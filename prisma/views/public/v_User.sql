SELECT
  u.id,
  u.name,
  u.email,
  CASE
    WHEN (u."emailVerified" IS NULL) THEN false
    ELSE TRUE
  END AS "emailVerified",
  u.role,
  u.active,
  u.language,
  u.deleted,
  COALESCE(u."acronisTenantId", '' :: text) AS "acronisTenantId",
  COALESCE(u."partnerAcronisId", '' :: text) AS "partnerAcronisId",
  u."createdAt",
  u."createdBy",
  u."updatedAt",
  u."updatedBy",
  u."notificationEmails",
  COALESCE(p.name, '' :: text) AS "partnerName",
  s."createdAt" AS "lastLogin"
FROM
  (
    (
      "User" u
      LEFT JOIN "Partner" p ON ((p."acronisId" = u."partnerAcronisId"))
    )
    LEFT JOIN (
      SELECT
        DISTINCT ON (s_1."userId") s_1."userId",
        s_1."createdAt"
      FROM
        "Session" s_1
      ORDER BY
        s_1."userId",
        s_1."createdAt" DESC
    ) s ON ((s."userId" = u.id))
  );