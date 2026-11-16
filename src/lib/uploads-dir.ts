import { join } from "path";

/**
 * Where uploaded files live.
 *
 * Inside the project directory they are wiped by a redeploy, they land in any
 * backup or export of the repository, and that means members' names, document
 * numbers and license PDFs travel with the code. `UPLOADS_DIR` points
 * production at a path outside the checkout; local development keeps
 * `data/uploads`, which `.gitignore` already excludes.
 */
export function uploadsPath(...segments: string[]): string {
  const root = process.env.UPLOADS_DIR || join(process.cwd(), "data/uploads");
  return join(root, ...segments);
}
