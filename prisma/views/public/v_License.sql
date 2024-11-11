SELECT
  l.id,
  l."productId",
  pro.name AS "productName",
  pro.code AS "productCode",
  pro.quota AS "productQuota",
  pro.unit AS "productUnit",
  l."partnerAcronisId",
  par.name AS "partnerName",
  par."parentAcronisId" AS "partnerParentAcronisId",
  l."customerAcronisId",
  cus.name AS "customerName",
  l."serialNo",
  l."expiresAt",
  l."assignedAt",
  l."activatedAt",
  (l."activatedAt" + '1 year' :: INTERVAL) AS "completionDate",
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