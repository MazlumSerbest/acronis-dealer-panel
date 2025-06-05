SELECT
  l.id AS "licenseId",
  l."serialNo",
  c.id AS "customerId",
  c.name AS "customerName",
  p.name AS "productName",
  COALESCE(u."notificationEmails", u.email) AS email,
  (l."activatedAt" + '03:00:00' :: INTERVAL) AS "expiresAt",
  (
    date((l."activatedAt" + '03:00:00' :: INTERVAL)) - CURRENT_DATE
  ) AS "daysLeft",
  s.step
FROM
  (
    (
      (
        (
          (
            "License" l
            JOIN "User" u ON (
              (
                (u.active = TRUE)
                AND (u."emailVerified" IS NOT NULL)
                AND (u."partnerAcronisId" = l."partnerAcronisId")
              )
            )
          )
          CROSS JOIN (
            SELECT
              unnest(ARRAY [30, 15, 7, 1]) AS step
          ) s
        )
        LEFT JOIN "Customer" c ON ((c."acronisId" = l."customerAcronisId"))
      )
      LEFT JOIN "Product" p ON ((p.id = l."productId"))
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
        date((l."activatedAt" + '03:00:00' :: INTERVAL)) - CURRENT_DATE
      ) = s.step
    )
    AND (n.id IS NULL)
  );