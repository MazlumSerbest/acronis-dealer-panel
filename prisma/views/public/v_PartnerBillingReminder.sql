SELECT
  p.id AS "partnerId",
  p.name AS "partnerName",
  COALESCE(u."notificationEmails", u.email) AS email,
  (p."billingDate" + '03:00:00' :: INTERVAL) AS "billingDate",
  (
    date((p."billingDate" + '03:00:00' :: INTERVAL)) - CURRENT_DATE
  ) AS "daysLeft",
  s.step
FROM
  (
    (
      (
        "Partner" p
        JOIN "User" u ON (
          (
            (u.active = TRUE)
            AND (u."emailVerified" IS NOT NULL)
            AND (
              (u."partnerAcronisId" = p."parentAcronisId")
              OR (u."acronisTenantId" = p."parentAcronisId")
            )
          )
        )
      )
      CROSS JOIN (
        SELECT
          unnest(ARRAY [30, 15, 7, 1]) AS step
      ) s
    )
    LEFT JOIN "Notification" n ON (
      (
        (n."entityType" = 'billing' :: text)
        AND (n."entityId" = p.id)
        AND (n.step = s.step)
      )
    )
  )
WHERE
  (
    (
      (
        date((p."billingDate" + '03:00:00' :: INTERVAL)) - CURRENT_DATE
      ) = s.step
    )
    AND (n.id IS NULL)
  );