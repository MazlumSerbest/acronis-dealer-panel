SELECT
  c.id AS "customerId",
  COALESCE(u."notificationEmails", u.email) AS email,
  c."billingDate",
  (date(c."billingDate") - CURRENT_DATE) AS "daysLeft",
  s.step
FROM
  (
    (
      (
        "Customer" c
        JOIN "User" u ON ((u."partnerAcronisId" = c."partnerAcronisId"))
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
    ((date(c."billingDate") - CURRENT_DATE) = s.step)
    AND (n.id IS NULL)
  );