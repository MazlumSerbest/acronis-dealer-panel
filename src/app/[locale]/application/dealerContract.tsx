import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";

import { jsPDF } from "jspdf";
// @ts-ignore
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import FormError from "@/components/FormError";
import { Textarea } from "@/components/ui/textarea";

const contractFormSchema = z.object({
    legalName: z.string({
        required_error: "Contract.name.required",
    }),
    legalAddress: z.string({
        required_error: "Contract.address.required",
    }),
});

type ContractFormValues = z.infer<typeof contractFormSchema>;

export default function DealerContract({ label }: { label: string }) {
    const t = useTranslations("General");
    const [open, setOpen] = useState(false);

    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractFormSchema),
    });

    function onSubmit(values: ContractFormValues) {
        const element = `<html>
        <body class="flex flex-col h-full w-full text-3xl gap-4">
            <h1 class="text-center font-bold text-xl uppercase">DBackup Bayi Sözleşmesi</h1>
            <br/>
            <h2 class="text-sm font-bold uppercase">1.Taraflar</h2>
            <p class="text-sm underline decoration-dotted">${values.legalAddress}</p>
            <p class="text-sm">İşbu sözleşme, bir tarafta ${values.legalName} (Bundan sonra "Bayi" olarak anılacaktır) ile diğer tarafta DBackup (Bundan sonra "Şirket" olarak anılacaktır) arasında aşağıda belirtilen hükümler çerçevesinde akdedilmiştir.</p>
            <p class="text-sm">Intrinsicly create backward-compatible e-commerce without installed base channels. Professionally cultivate alternative e-business without scalable internal or "organic" sources. Appropriately whiteboard extensive platforms through viral growth strategies. Collaboratively procrastinate visionary expertise rather than long-term high-impact relationships. Synergistically architect enterprise-wide quality vectors with high standards in customer service. <span class="underline decoration-dotted">${values.legalName}</span></p>
            <br />
            <div class="flex flex-row justify-center items-center gap-4">
                <label for="office">Ofis:</label>
                <input type="checkbox" id="office" name="office" class="text-sm" />
                <label for="vehicle1">Mağaza:</label>
                <input type="checkbox" class="text-sm" />
                <label for="vehicle1">Test:</label>
                <input type="checkbox" class="text-sm" />
            </div>
            <div class="h-4"></div>
        </body>
        </html>`;

        const opt = {
            margin: [0.5, 1, 0.5, 1],
            filename: "Bayi Sözleşmesi.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: {
                unit: "in",
                format: "letter",
                orientation: "portrait",
            },
        };

        html2pdf().set(opt).from(element).save();
    }

    return (
        <>
            <a
                className="text-blue-400 hover:underline hover:text-blue-600 hover:cursor-pointer   "
                onClick={() => {
                    setOpen(true);
                }}
            >
                {label}
            </a>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("contract")}</DialogTitle>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="legalName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("legalName")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.legalName
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="legalAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("legalAddress")}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={5} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.legalAddress
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">
                                        {t("close")}
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-600/90"
                                >
                                    {t("download")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
