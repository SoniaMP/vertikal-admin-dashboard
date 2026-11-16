-- Who paid while the Stripe webhook was disabled and therefore never got a
-- confirmation email, nor produced a notice to the club.
--
-- The webhook stopped delivering around 2026-09-05 (oldest failed event found
-- in the Stripe dashboard; anything older had already been purged). The cutoff
-- below is deliberately earlier so nobody is missed; narrow it once the real
-- date is known.
--
-- There is no column that records whether the email went out. `confirmationSent`
-- exists in the schema but nothing in the app ever writes to it, so it is always
-- false and useless as a filter. The date is all we have.
--
-- Run against the production database, read-only:
--   sqlite3 -readonly /path/to/prod.db < scripts/missing-confirmations.sql
--
-- Note: course registrations live in a table called `courses` (@@map).

.mode box
.headers on

SELECT '=== Altas de socio pagadas sin confirmación ===' AS '';

SELECT
  date(m.createdAt)                      AS fecha,
  mem.firstName || ' ' || mem.lastName   AS socio,
  mem.email                              AS email,
  mem.dni                                AS dni,
  printf('%.2f €', m.totalAmount / 100.0) AS importe,
  m.status                               AS estado,
  s.name                                 AS temporada
FROM Membership m
JOIN Member mem ON mem.id = m.memberId
JOIN Season s   ON s.id = m.seasonId
WHERE m.paymentStatus = 'COMPLETED'
  AND m.createdAt >= '2026-09-01'
ORDER BY m.createdAt;

SELECT '=== Inscripciones a cursos pagadas sin confirmación ===' AS '';

SELECT
  date(c.createdAt)                        AS fecha,
  c.firstName || ' ' || c.lastName         AS inscrito,
  c.email                                  AS email,
  cat.title                                AS curso,
  printf('%.2f €', cp.amountCents / 100.0) AS importe
FROM courses c
JOIN CourseCatalog cat ON cat.id = c.courseCatalogId
JOIN CoursePrice cp    ON cp.id = c.coursePriceId
WHERE c.paymentStatus = 'COMPLETED'
  AND c.createdAt >= '2026-09-01'
ORDER BY c.createdAt;

SELECT '=== Totales ===' AS '';

SELECT
  (SELECT COUNT(*) FROM Membership
    WHERE paymentStatus = 'COMPLETED' AND createdAt >= '2026-09-01') AS altas,
  (SELECT COUNT(*) FROM courses
    WHERE paymentStatus = 'COMPLETED' AND createdAt >= '2026-09-01') AS cursos;
