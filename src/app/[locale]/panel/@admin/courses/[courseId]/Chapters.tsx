import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import FormError from "@/components/FormError";
import DestructiveToast from "@/components/DestructiveToast";

import { DateTimeFormat } from "@/utils/date";
import { LuChevronsUpDown, LuLoaderCircle, LuEllipsisVertical } from "react-icons/lu";

const chapterFormSchema = z.object({
    courseId: z.string().cuid().optional(),
    name: z
        .string({
            required_error: "Chapter.name.required",
        })
        .max(60, {
            message: "Chapter.name.maxLength",
        }),
    order: z.coerce.number({
        required_error: "Chapter.order.required",
    }),
});

type ChapterFormValues = z.infer<typeof chapterFormSchema>;

export default function Chapters({
    courseId,
    chapters,
    mutate,
}: {
    courseId: string;
    chapters: Chapter[];
    mutate: () => void;
}) {
    const t = useTranslations("General");
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    //#region Form
    const form = useForm<ChapterFormValues>({
        resolver: zodResolver(chapterFormSchema),
    });

    function onSubmit(values: ChapterFormValues) {
        if (submitting) return;
        setSubmitting(true);

        values.courseId = courseId;
        fetch("/api/admin/chapter", {
            method: "POST",
            body: JSON.stringify(values),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    setOpen(false);
                    form.reset({});
                    mutate();
                } else {
                    DestructiveToast({
                        title: t("errorTitle"),
                        description: res.message,
                        t,
                    });
                }
            })
            .finally(() => setSubmitting(false));
    }
    //#endregion

    //#region Table
    const visibleColumns = {
        createdAt: false,
        createdBy: false,
        updatedAt: false,
        updatedBy: false,
    };

    const columns: ColumnDef<any, any>[] = [
        {
            accessorKey: "name",
            enableHiding: false,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {t("name")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("name");

                return data || "-";
            },
        },
        {
            accessorKey: "order",
            enableHiding: false,
            enableGlobalFilter: false,
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="-ml-4"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    {t("order")}
                    <LuChevronsUpDown className="size-4 ml-2" />
                </Button>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("order");

                return data || "-";
            },
        },
        {
            accessorKey: "active",
            header: t("active"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("active");

                return <BoolChip size="size-4" value={data} />;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "createdAt",
            header: t("createdAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("createdAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "createdBy",
            header: t("createdBy"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("createdBy");

                return data || "-";
            },
        },
        {
            accessorKey: "updatedAt",
            header: t("updatedAt"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("updatedAt");

                return DateTimeFormat(data);
            },
        },
        {
            accessorKey: "updatedBy",
            header: t("updatedBy"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("updatedBy");

                return data || "-";
            },
        },
        {
            accessorKey: "actions",
            header: "",
            enableGlobalFilter: false,
            enableHiding: false,
            cell: ({ row }) => {
                const data: Partner = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center">
                            <LuEllipsisVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {t("actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => {
                                    router.push(
                                        `/panel/courses/${courseId}/${row.original.id}`,
                                    );
                                }}
                            >
                                {t("edit")}
                            </DropdownMenuItem>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        {t("delete")}
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {t("areYouSure")}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t("areYouSureDescription")}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>

                                    <div className="text-sm text-muted-foreground">
                                        {t("selectedItem", { name: data.name })}
                                    </div>

                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            {t("close")}
                                        </AlertDialogCancel>
                                        <AlertDialogAction asChild>
                                            <Button
                                                variant="destructive"
                                                className="bg-destructive hover:bg-destructive/90"
                                                onClick={() => {
                                                    if (submitting) return;
                                                    setSubmitting(true);

                                                    fetch(
                                                        `/api/admin/chapter/${data.id}`,
                                                        {
                                                            method: "DELETE",
                                                        },
                                                    )
                                                        .then((res) =>
                                                            res.json(),
                                                        )
                                                        .then((res) => {
                                                            if (res.ok) {
                                                                toast({
                                                                    description:
                                                                        res.message,
                                                                });
                                                                mutate();
                                                            } else {
                                                                toast({
                                                                    variant:
                                                                        "destructive",
                                                                    title: t(
                                                                        "errorTitle",
                                                                    ),
                                                                    description:
                                                                        res.message,
                                                                });
                                                            }
                                                        })
                                                        .finally(() =>
                                                            setSubmitting(
                                                                false,
                                                            ),
                                                        );
                                                }}
                                            >
                                                {t("delete")}
                                            </Button>
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
    //#endregion

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-medium text-xl">
                        {t("chapters")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="">
                    <DataTable
                        zebra
                        columns={columns}
                        data={chapters || []}
                        visibleColumns={visibleColumns}
                        defaultSort="order"
                        defaultSortDirection="asc"
                        facetedFilters={[
                            {
                                column: "active",
                                title: t("active"),
                                options: [
                                    { value: true, label: t("true") },
                                    { value: false, label: t("false") },
                                ],
                            },
                        ]}
                        onAddNew={() => {
                            setOpen(true);
                        }}
                    />
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {`${t("new")} ${t("chapter")}`}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("name")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} maxLength={60} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.name
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="order"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("order")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.order
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
                                    disabled={submitting}
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-600/90"
                                >
                                    {t("save")}
                                    {submitting && (
                                        <LuLoaderCircle className="size-4 animate-spin ml-2" />
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
