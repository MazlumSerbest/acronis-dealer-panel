"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogClose,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import FormError from "@/components/FormError";

import { LuChevronsUpDown, LuLoader2, LuMoreHorizontal } from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const newsFormSchema = z.object({
    id: z.string().cuid().optional(),
    status: z.enum(["active", "draft", "passive"]),
    title: z
        .string({
            required_error: "News.title.required",
        })
        .min(3, {
            message: "News.title.minLength",
        }),
    order: z.coerce.number({
        required_error: "News.order.required",
        invalid_type_error: "News.order.invalidType",
    }),
    image: z
        .any()
        .refine((files) => files?.[0], "News.image.required")
        .refine(
            (files) => files?.[0]?.size <= 2 * 1024 * 1024,
            "News.image.maxSize",
        )
        .refine(
            (files) =>
                ["image/png", "image/jpeg", "image/jpg"].includes(
                    files?.[0]?.type,
                ),
            "News.image.invalidType",
        ),
    content: z.string().optional(),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

export default function NewsPage() {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.News");
    const router = useRouter();
    const { toast } = useToast();

    const [open, setOpen] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [images, setImages] = useState<{ src: string; id: string }[]>([]);

    const { data, error, isLoading, mutate } = useSWR(`/api/admin/news`, null, {
        revalidateOnFocus: false,
        onSuccess: (data) => {
            const imageObjects = data.map((item: any) => {
                return {
                    src: item.image,
                    id: item.id,
                };
            });

            setImages(imageObjects);
        },
    });

    //#region Form
    const form = useForm<NewsFormValues>({
        resolver: zodResolver(newsFormSchema),
        defaultValues: {
            status: "draft",
        },
    });

    const imageRef = form.register("image");

    function onSubmit(values: NewsFormValues) {
        if (submitting) return;
        setSubmitting(true);

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("order", values.order.toString());
        formData.append("status", values.status);
        formData.append("image", values.image[0]);
        formData.append("content", values.content || "");

        if (isNew) {
            fetch("/api/admin/news", {
                method: "POST",
                body: formData,
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        toast({
                            description: res.message,
                        });
                        setOpen(false);
                        mutate();
                        form.reset();
                    } else {
                        toast({
                            variant: "destructive",
                            title: t("errorTitle"),
                            description: res.message,
                        });
                    }

                    setSubmitting(false);
                });
        } else {
            fetch(`/api/admin/news/${values.id}`, {
                method: "PUT",
                body: JSON.stringify(values),
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        toast({
                            description: res.message,
                        });
                        setOpen(false);
                        mutate();
                        form.reset();
                    } else {
                        toast({
                            variant: "destructive",
                            title: t("errorTitle"),
                            description: res.message,
                        });
                    }

                    setSubmitting(false);
                });
        }
    }
    //#endregion

    //#region Table
    const visibleColumns = {
        partnerAcronisId: false,
        createdAt: false,
        createdBy: false,
        updatedAt: false,
        updatedBy: false,
    };

    const columns: ColumnDef<any, any>[] = [
        {
            accessorKey: "title",
            enableHiding: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("title")}
                    <Button
                        variant="ghost"
                        className="p-1"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        <LuChevronsUpDown className="size-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const data: string = row.getValue("title");

                return data || "-";
            },
        },
        {
            accessorKey: "order",
            enableHiding: false,
            header: ({ column }) => (
                <div className="flex flex-row items-center">
                    {t("order")}
                    <Button
                        variant="ghost"
                        className="p-1"
                        onClick={() =>
                            column.toggleSorting(column.getIsSorted() === "asc")
                        }
                    >
                        <LuChevronsUpDown className="size-4" />
                    </Button>
                </div>
            ),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: number = row.getValue("order");

                return data;
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "status",
            header: t("status"),
            enableGlobalFilter: false,
            enableHiding: false,
            cell: ({ row }) => {
                const data: string = row.getValue("status");

                return (
                    <Badge
                        variant={
                            data === "active"
                                ? "default"
                                : data === "draft"
                                ? "secondary"
                                : "destructive"
                        }
                        className={cn(data === "active" && "bg-green-600 hover:bg-green-600/90")}
                    >
                        {t(data)}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
        {
            accessorKey: "content",
            header: t("content"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: boolean = row.getValue("content") ? true : false;

                return <BoolChip value={data} />;
            },
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
                const data: News = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center">
                            <LuMoreHorizontal className="size-4 text-muted-foreground cursor-pointer hover:text-blue-500 active:text-blue-500/60" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {t("actions")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => {
                                    setIsNew(false);
                                    setOpen(true);
                                    form.reset(data);
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
                                        {t("selectedItem", {
                                            name: data.title,
                                        })}
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
                                                    fetch(
                                                        `/api/admin/news/${data.id}`,
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
                                                        });
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

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    if (!data)
        return (
            <Skeleton>
                <TableSkeleton />
            </Skeleton>
        );
    return (
        <>
            <DataTable
                zebra
                columns={columns}
                data={data || []}
                visibleColumns={visibleColumns}
                isLoading={isLoading}
                defaultPageSize={30}
                defaultSort="order"
                defaultSortDirection="asc"
                facetedFilters={[
                    {
                        column: "status",
                        title: t("status"),
                        options: [
                            { value: "passive", label: t("passive") },
                            { value: "draft", label: t("draft") },
                            { value: "active", label: t("active") },
                        ],
                    },
                ]}
                onAddNew={() => {
                    setIsNew(true);
                    setOpen(true);
                    form.reset({ status: "draft" });
                    form.reset({ status: "draft" });
                }}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="md:w-[780px] max-w-[780px] max-h-screen overflow-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {isNew ? t("newNews") : t("editNews")}
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
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>{t("status")}</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="passive" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {t("passive")}
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="draft" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {t("draft")}
                                                    </FormLabel>
                                                </FormItem>
                                                {!isNew && (
                                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="active" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {t("active")}
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("title")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.title
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

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("image")}
                                        </FormLabel>
                                        <FormDescription>
                                            {tf("image.description")}
                                        </FormDescription>

                                        {!isNew && (
                                            <div className="w-full flex justify-center">
                                                <div className="w-96">
                                                    <AspectRatio ratio={16 / 9}>
                                                        <Image
                                                            src={
                                                                images.find(
                                                                    (i) =>
                                                                        i.id ===
                                                                        form.getValues(
                                                                            "id",
                                                                        ),
                                                                )?.src || ""
                                                            }
                                                            alt=""
                                                            className="rounded-xl object-cover"
                                                            fill
                                                        />
                                                    </AspectRatio>
                                                </div>
                                            </div>
                                        )}
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg"
                                                {...imageRef}
                                            />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.image
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("content")}</FormLabel>
                                        <FormControl>
                                            <MinimalTiptapEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                className="w-full"
                                                editorContentClassName="p-5"
                                                output="html"
                                                placeholder={t(
                                                    "contentEditorPlaceholder",
                                                )}
                                                editable={true}
                                                editorClassName="focus:outline-none"
                                            />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.content
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
                                        <LuLoader2 className="size-4 animate-spin ml-2" />
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
