import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ user: { role: "ADMIN" } })),
}));

vi.mock("crypto", () => ({
  randomUUID: () => "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
}));

import { auth } from "@/lib/auth";
import { POST } from "../route";
import { NextRequest } from "next/server";

function createRequest(file: File): NextRequest {
  const formData = new FormData();
  formData.append("file", file);
  return new NextRequest("http://localhost/api/upload/branding", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/upload/branding", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts a valid PNG image", async () => {
    const file = new File(["PNG data"], "logo.png", { type: "image/png" });
    const res = await POST(createRequest(file));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toBe(
      "/api/uploads/branding/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png",
    );
  });

  it("accepts a valid JPEG image", async () => {
    const file = new File(["JPEG data"], "photo.jpg", { type: "image/jpeg" });
    const res = await POST(createRequest(file));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toContain(".jpg");
  });

  it("accepts a valid SVG image", async () => {
    const file = new File(["<svg></svg>"], "logo.svg", {
      type: "image/svg+xml",
    });
    const res = await POST(createRequest(file));

    expect(res.status).toBe(200);
  });

  it("rejects unsupported file types", async () => {
    const file = new File(["data"], "doc.pdf", { type: "application/pdf" });
    const res = await POST(createRequest(file));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("PNG, JPG o SVG");
  });

  it("rejects files over 1 MB", async () => {
    const largeData = new Uint8Array(1024 * 1024 + 1);
    const file = new File([largeData], "big.png", { type: "image/png" });
    const res = await POST(createRequest(file));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("1 MB");
  });

  it("rejects request without file", async () => {
    const formData = new FormData();
    const req = new NextRequest("http://localhost/api/upload/branding", {
      method: "POST",
      body: formData,
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});

describe("POST /api/upload/branding, who may call it", () => {
  it("refuses a caller with no session", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const file = new File(["PNG data"], "logo.png", { type: "image/png" });

    expect((await POST(createRequest(file))).status).toBe(401);
  });

  it("refuses an instructor, who cannot reach this setting anywhere else", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { role: "INSTRUCTOR" },
    } as never);
    const file = new File(["PNG data"], "logo.png", { type: "image/png" });

    expect((await POST(createRequest(file))).status).toBe(403);
  });
});
