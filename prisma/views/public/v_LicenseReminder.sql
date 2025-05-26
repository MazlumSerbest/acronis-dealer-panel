SELECT
  l.id AS "licenseId",
  COALESCE(u."notificationEmails", u.email) AS email,
  l."activatedAt",
  (
    date((l."activatedAt" + '1 year' :: INTERVAL)) - CURRENT_DATE
  ) AS "daysLeft",
  s.step
FROM
  (
    (
      (
        "License" l
        JOIN "User" u ON ((u."partnerAcronisId" = l."partnerAcronisId"))
      )
      CROSS JOIN (
        SELECT
          unnest(ARRAY [30, 15, 7, 1]) AS step
      ) s
    )
    LEFT JOIN "Notification" n ON (
      (
        (n."entityType" = 'license' :: text)
        AND (n."entityId" = l.id)
        AND (n.step = s.step)
      )
    )
  )
WHERE
  (
    (
      (
        date((l."activatedAt" + '1 year' :: INTERVAL)) - CURRENT_DATE
      ) = s.step
    )
    AND (n.id IS NULL)
  );