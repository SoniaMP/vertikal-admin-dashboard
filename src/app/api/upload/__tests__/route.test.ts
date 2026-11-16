import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("crypto", () => ({
  randomUUID: () => "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
}));

import { POST } from "../route";
import { NextRequest } from "next/server";

/** A PDF is recognised by its first bytes, not by the name or the type. */
function pdfFile(body: string = "%PDF-1.7\nreal enough") {
  return new File([body], "licencia.pdf", { type: "application/pdf" });
}

/** Each test speaks from its own address, so the limiter counts them apart. */
function createRequest(file: File, ip: string): NextRequest {
  const formData = new FormData();
  formData.append("file", file);
  return new NextRequest("http://localhost/api/upload", {
    method: "POST",
    body: formData,
    headers: { "x-forwarded-for": ip },
  });
}

describe("POST /api/upload", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts a real PDF", async () => {
    const res = await POST(createRequest(pdfFile(), "10.0.0.1"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe(
      "/api/uploads/licenses/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.pdf",
    );
  });

  it("refuses a file that only claims to be a PDF", async () => {
    const liar = new File(["MZ this is an executable"], "licencia.pdf", {
      type: "application/pdf",
    });

    const res = await POST(createRequest(liar, "10.0.0.2"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("no es un PDF");
  });

  it("refuses anything over five megabytes", async () => {
    const huge = new File([new Uint8Array(6 * 1024 * 1024)], "licencia.pdf", {
      type: "application/pdf",
    });

    const res = await POST(createRequest(huge, "10.0.0.3"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("5 MB");
  });

  it("refuses a missing file", async () => {
    const formData = new FormData();
    const request = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: formData,
      headers: { "x-forwarded-for": "10.0.0.4" },
    });

    expect((await POST(request)).status).toBe(400);
  });

  it("stops the sixth upload from one address and says when to return", async () => {
    const ip = "10.0.0.5";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const allowed = await POST(createRequest(pdfFile(), ip));
      expect(allowed.status).toBe(200);
    }

    const blocked = await POST(createRequest(pdfFile(), ip));
    const body = await blocked.json();

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();
    expect(body.error).toContain("demasiados archivos");
  });

  it("counts the limit per address, not for everyone at once", async () => {
    const noisy = "10.0.0.6";
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await POST(createRequest(pdfFile(), noisy));
    }

    const other = await POST(createRequest(pdfFile(), "10.0.0.7"));

    expect(other.status).toBe(200);
  });
});
