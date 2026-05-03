export function getActiveNavHref(
  pathname: string,
  hrefs: ReadonlyArray<string>,
): string | null {
  let activeHref: string | null = null;
  for (const href of hrefs) {
    const isMatch = pathname === href || pathname.startsWith(href + "/");
    if (!isMatch) continue;
    if (activeHref === null || href.length > activeHref.length) {
      activeHref = href;
    }
  }
  return activeHref;
}
