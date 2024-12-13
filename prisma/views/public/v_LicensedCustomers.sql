SELECT
  c."acronisId",
  c.name,
  l.code,
  l.model,
  l.quota,
  l.unit,
  l.bytes
FROM
  (
    (
      "Customer" c
      LEFT JOIN "Partner" p ON ((c."partnerAcronisId" = p."acronisId"))
    )
    LEFT JOIN "v_ActiveLicenses" l ON ((c."acronisId" = l."customerAcronisId"))
  )
WHERE
  (p.licensed = TRUE);