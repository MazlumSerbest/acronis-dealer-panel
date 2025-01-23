export async function createPDF(zpl: string) {
    await fetch(`${window.location.protocol}//api.labelary.com/v1/printers/8dpmm/labels/2.36x0.59`, {
        method: "POST",
        headers: {
            Accept: "application/pdf",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: zpl,
    })
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
