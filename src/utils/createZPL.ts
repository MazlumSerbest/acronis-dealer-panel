"use server";
import prisma from "./db";
import { DateFormat } from "./date";

export default async function createZPL(ids: string[]) {
    const licenses: any = await prisma.license.findMany({
        where: {
            id: { in: ids },
        },
        select: {
            product: {
                select: { name: true },
            },
            expiresAt: true,
            serialNo: true,
            key: true,
            productId: true,
        },
    });

    let zpl = "";

    licenses.forEach((l: License) => {
        zpl += "^XA";
        zpl += "^CF0,20";
        zpl += `^FO30,20^FD${l?.product?.name}^FS`;
        zpl += `^FO320,20^FDExp: ${DateFormat(l.expiresAt).replaceAll(".", "/")}^FS`;
        zpl += "^BY2,2,40";
        zpl += `^FO30,45^BC^FD${l.serialNo}^FS`;
        zpl += "^XZ";
        zpl += "^XA";
        zpl += "^CF0,15";
        zpl += `^FO165,10^FDS/N: ${l.serialNo}^FS`;
        zpl += "^BY2,2,40";
        zpl += `^FO50,28^BC,60^FD${l.key}^FS`;
        zpl += "^XZ";
    });

    return zpl;
}
