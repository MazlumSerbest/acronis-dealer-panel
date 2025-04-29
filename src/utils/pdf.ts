import { acronisServiceProvider, dcube } from "@/lib/logos";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { DateFormat } from "./date";

export async function createZPLAsPDF(zpl: string) {
    if (!self) return;

    await fetch(
        `${window.location.protocol}//api.labelary.com/v1/printers/8dpmm/labels/2.36x0.59`,
        {
            method: "POST",
            headers: {
                Accept: "application/pdf",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: zpl,
        },
    )
        .then((res) => res.blob())
        .then(async (res) => {
            // Blob'dan URL oluştur
            const pdfBlob = new Blob([res], {
                type: "application/pdf",
            });
            const pdfUrl = URL.createObjectURL(pdfBlob);

            // Yeni sekmede URL'yi aç
            window.open(pdfUrl, "_blank");

            // Bellek sızıntısını önlemek için Blob URL'sini zamanlayarak temizleyin
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000); // 10 saniye sonra temizle
        })
        .catch((err) => {
            console.error(err);
        });
}

export async function createLicenseAsPDF(licenses: License[]) {
    if (!licenses || licenses.length === 0) return;

    let licensesHtml = "";

    await licenses.forEach(
        (l: License) =>
            (licensesHtml += `
                <div style="position: relative; width: 324px; height: 204px; background-color: rgba(239, 246, 255, 0.6); display: grid; grid-template-columns: repeat(3, 1fr); padding: 10px; color: #3f3f46;">
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <img
                            src="${dcube}"
                            style="margin: 0 -10px 0 0; width: 60px; margin-top: -25px;"
                        />

                        <img src="${acronisServiceProvider}" style="margin-top: 25px;"/>

                        <h6 style="position: absolute; font-size: 6px; bottom: 15px;">
                            D3 Bilişim Teknolojileri
                            <br />
                            panel.d3bilisim.com.tr
                        </h6>
                    </div>
                    <div style="grid-column: 2 / span 2; margin-left: 10px; border-left-width: 1px; border-color: rgba(96, 165, 250, 0.3);">
                        <div style="display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: space-between; height: 100%; margin-top: -6px;">
                            <div>
                                <h6 style="font-size: 12px; font-weight: bold; color: #60a5fa;">
                                    ${l?.product?.name}
                                </h6>
                                <h6 style="font-size: 10px; font-weight: bold; color: #60a5fa;">
                                    1 Year
                                </h6>
                                <h6 style="font-size: 10px; font-weight: 600;">
                                    ${l?.product?.code}
                                </h6>
                            </div>

                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                <h6 style="font-size: 12px; font-weight: bold; color: #60a5fa;">
                                    License Key
                                </h6>

                                <h6 style="font-size: 10px; padding: 0 20px 10px 20px; margin-top: 6px; font-weight: bold; border: 1px solid rgba(96, 165, 250, 0.3); border-radius: 8px;">
                                    ${l.key}
                                </h6>

                                <h6 style="font-size: 7px; font-weight: 600; margin-top: -6px;">
                                    S/N: ${l.serialNo}
                                </h6>
                            </div>

                            <div>
                                <h6 style="font-size: 6px; font-weight: 600;">
                                    Expires At: ${DateFormat(l.expiresAt)}
                                </h6>
                            </div>
                        </div>
                    </div>
                </div>
            `),
    );

    const html = `
        <html>
            <body>
                ${licensesHtml}
            </body>
        </html>
    `;

    const opt = {
        margin: 0,
        filename: "lisanslar.pdf",
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 8 },
        jsPDF: {
            unit: "mm",
            format: "credit-card",
            orientation: "l",
        },
    };

    // @ts-ignore
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().set(opt).from(html).save();
}
