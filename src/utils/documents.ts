"use server";
import prisma from "./db";
import { DateFormat } from "./date";

export async function createZPLFromIds(ids: string[]) {
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
        orderBy: {
            productId: "asc",
        },
    });

    let zpl = "";

    licenses.forEach((l: License) => {
        zpl += "^XA";
        zpl += "^CF0,20";
        zpl += `^FO30,25^FD${l?.product?.name}^FS`;
        zpl += `^FO320,25^FDExp: ${DateFormat(l.expiresAt).replaceAll(
            ".",
            "/",
        )}^FS`;
        zpl += "^BY2,2,40";
        zpl += `^FO30,50^BC^FD${l.serialNo}^FS`;
        zpl += "^XZ";
        zpl += "^XA";
        zpl += "^CF0,15";
        zpl += `^FO165,15^FDS/N: ${l.serialNo}^FS`;
        zpl += "^BY2,2,40";
        zpl += `^FO50,33^BC,60^FD${l.key}^FS`;
        zpl += "^XZ";
    });

    return zpl;
}

export async function createZPLFromObjects(licenses: License[]) {
    let zpl = "";

    licenses.forEach((l: License) => {
        zpl += "^XA";
        zpl += "^CF0,20";
        zpl += `^FO30,25^FD${l?.product?.name}^FS`;
        zpl += `^FO320,25^FDExp: ${DateFormat(l.expiresAt).replaceAll(
            ".",
            "/",
        )}^FS`;
        zpl += "^BY2,2,40";
        zpl += `^FO30,50^BC^FD${l.serialNo}^FS`;
        zpl += "^XZ";
        zpl += "^XA";
        zpl += "^CF0,15";
        zpl += `^FO165,15^FDS/N: ${l.serialNo}^FS`;
        zpl += "^BY2,2,40";
        zpl += `^FO50,33^BC,60^FD${l.key}^FS`;
        zpl += "^XZ";
    });

    return zpl;
}

export async function createLicensePDFFromIds(ids: string[]) {
    const licenses: any = await prisma.license.findMany({
        where: {
            id: { in: ids },
        },
        select: {
            product: {
                select: { name: true, code: true },
            },
            expiresAt: true,
            serialNo: true,
            key: true,
            productId: true,
        },
        orderBy: {
            productId: "asc",
        },
    });

    return licenses;
}
