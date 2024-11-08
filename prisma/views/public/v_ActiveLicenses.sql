SELECT
  l.id,
  l."expiresAt",
  l."activatedAt",
  pro.code,
  pro.model,
  pro.quota,
  pro.unit,
  pro.bytes,
  par."acronisId" AS "partnerAcronisId",
  cus."acronisId" AS "customerAcronisId"
FROM
  (
    (
      (
        "License" l
        LEFT JOIN "Product" pro ON ((pro.id = l."productId"))
      )
      LEFT JOIN "Partner" par ON ((par.id = l."partnerAcronisId"))
    )
    LEFT JOIN "Customer" cus ON ((cus.id = l."customerAcronisId"))
  )
WHERE
  (
    (l."customerAcronisId" IS NOT NULL)
    AND (l."activatedAt" >= (NOW() - '1 year' :: INTERVAL))
  );