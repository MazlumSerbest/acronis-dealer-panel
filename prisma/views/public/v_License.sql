SELECT
  l.id,
  l."productId",
  pro.name AS "productName",
  pro.code AS "productCode",
  COALESCE(pro.bytes, l.bytes) AS bytes,
  pro.model AS "productModel",
  pro.annual,
  pro."freeQuota",
  l."partnerAcronisId",
  par.name AS "partnerName",
  par."parentAcronisId" AS "partnerParentAcronisId",
  l."customerAcronisId",
  cus.name AS "customerName",
  l."serialNo",
  l."expiresAt",
  l."endsAt",
  l."assignedAt",
  l."activatedAt",
  l."createdAt",
  l."createdBy",
  l."updatedAt",
  l."updatedBy"
FROM
  (
    (
      (
        "License" l
        LEFT JOIN "Product" pro ON ((l."productId" = pro.id))
      )
      LEFT JOIN "Partner" par ON ((l."partnerAcronisId" = par."acronisId"))
    )
    LEFT JOIN "Customer" cus ON ((l."customerAcronisId" = cus."acronisId"))
  );