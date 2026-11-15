import { redirect } from "next/navigation";

/**
 * Member rows link to `/admin/registros/{id}`, so the parent path is one
 * backspace away in the address bar. The list itself lives at `/admin`.
 */
export default function RegistrosPage() {
  redirect("/admin");
}
