import ZebraBrowserPrintWrapper from "zebra-browser-print-wrapper";

export default async function printZPL(zpl: string) {
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
