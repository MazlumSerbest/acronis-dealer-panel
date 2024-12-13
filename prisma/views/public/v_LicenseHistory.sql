SELECT
  lh.id,
  lh.action,
  lh."createdAt",
  lh."createdBy",
  l."serialNo" AS "licenseSerialNo",
  pro.name AS "productName",
  pp.name AS "previousPartner",
  pp."acronisId" AS "previousPartnerAcronisId",
  p.name AS partner,
  p."acronisId" AS "partnerAcronisId",
  c.name AS customer
FROM
  (
    (
      (
        (
          (
            "LicenseHistory" lh
            LEFT JOIN "License" l ON ((lh."licenseId" = l.id))
          )
          LEFT JOIN "Product" pro ON ((l."productId" = pro.id))
        )
        LEFT JOIN "Partner" pp ON ((lh."previousPartnerAcronisId" = pp."acronisId"))
      )
      LEFT JOIN "Partner" p ON ((lh."partnerAcronisId" = p."acronisId"))
    )
    LEFT JOIN "Customer" c ON ((lh."customerAcronisId" = c."acronisId"))
  );