import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";

export async function printZPL(zpl: string) {
    try {
        // Create a new instance of the object
        const browserPrint = new ZebraBrowserPrintWrapper();

        // Select default printer
        const defaultPrinter = await browserPrint.getDefaultPrinter();

        // Set the printer
        browserPrint.setPrinter(defaultPrinter);

        // Check printer status
        const printerStatus = await browserPrint.checkPrinterStatus();

        // Check if the printer is ready
        if (printerStatus.isReadyToPrint) {
            browserPrint.print(zpl);
            return { ok: true };
        } else {
            return { message: printerStatus.errors, ok: false };
        }
    } catch (error) {
        return { message: error, ok: false };
    }
}

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
