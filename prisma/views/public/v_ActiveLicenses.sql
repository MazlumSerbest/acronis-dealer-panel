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
  par."parentAcronisId" AS "partnerParentAcronisId",
  cus."acronisId" AS "customerAcronisId"
FROM
  (
    (
      (
        "License" l
        LEFT JOIN "Product" pro ON ((pro.id = l."productId"))
      )
      LEFT JOIN "Partner" par ON ((par."acronisId" = l."partnerAcronisId"))
    )
    LEFT JOIN "Customer" cus ON ((cus."acronisId" = l."customerAcronisId"))
  )
WHERE
  (
    (l."customerAcronisId" IS NOT NULL)
    AND (l."activatedAt" >= (NOW() - '1 year' :: INTERVAL))
  );