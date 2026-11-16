const ROLE_NOUNS: Record<string, { one: string; many: string }> = {
  ADMIN: { one: "administradora o administrador", many: "administradores" },
  INSTRUCTOR: { one: "instructor", many: "instructores" },
};

/**
 * The one line under the users title: who can get into the panel, counted by
 * what they are allowed to do. It is the whole table, so the counts are the
 * screen's own data rather than a figure from somewhere else.
 */
export function formatUserRolesFinding(roleNames: string[]): string {
  if (roleNames.length === 0) {
    return "Nadie tiene acceso al panel todavía.";
  }

  const counts = new Map<string, number>();
  for (const role of roleNames) {
    counts.set(role, (counts.get(role) ?? 0) + 1);
  }

  const parts = [...counts.entries()].map(([role, count]) => {
    const noun = ROLE_NOUNS[role] ?? { one: role, many: role };
    return `${count} ${count === 1 ? noun.one : noun.many}`;
  });

  return `${joinWithAnd(parts)} con acceso al panel.`;
}

function joinWithAnd(parts: string[]): string {
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} y ${parts[parts.length - 1]}`;
}
