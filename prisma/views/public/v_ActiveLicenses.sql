SELECT
  l.id,
  l."expiresAt",
  l."activatedAt",
  pro.code,
  pro.model,
  pro.quota,
  pro.unit,
  COALESCE(pro.bytes, l.bytes) AS bytes,
  pro."usageName",
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
    AND (l."endsAt" >= NOW())
  );