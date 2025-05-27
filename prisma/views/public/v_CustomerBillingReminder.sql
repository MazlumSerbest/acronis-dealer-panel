SELECT
  c.id AS "customerId",
  c.name AS "customerName",
  COALESCE(u."notificationEmails", u.email) AS email,
  (c."billingDate" + '1 day' :: INTERVAL) AS "billingDate",
  (
    date((c."billingDate" + '1 day' :: INTERVAL)) - CURRENT_DATE
  ) AS "daysLeft",
  s.step
FROM
  (
    (
      (
        "Customer" c
        JOIN "User" u ON (
          (
            (u."partnerAcronisId" = c."partnerAcronisId")
            AND (u."emailVerified" IS NOT NULL)
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
        AND (n."entityId" = c.id)
        AND (n.step = s.step)
      )
    )
  )
WHERE
  (
    (
      (
        date((c."billingDate" + '1 day' :: INTERVAL)) - CURRENT_DATE
      ) = s.step
    )
    AND (n.id IS NULL)
  );