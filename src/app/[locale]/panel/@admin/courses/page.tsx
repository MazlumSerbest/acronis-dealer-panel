"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogClose,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import FormError from "@/components/FormError";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import DestructiveToast from "@/components/DestructiveToast";

import { LuChevronsUpDown, LuLoaderCircle } from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";

const courseFormSchema = z.object({
    type: z.enum(["standard", "video"]),
    name: z
        .string({
            required_error: "Course.name.required",
        })
        .max(60, {
            message: "Course.name.maxLength",
        }),
    category: z.enum(["panel", "acronis"], {
        required_error: "Course.category.required",
    }),
    shortDescription: z
        .string({
            required_error: "Course.shortDescription.required",
        })
        .max(80, {
            message: "Course.shortDescription.maxLength",
        }),
    description: z.string({
        required_error: "Course.description.required",
    }),
    duration: z.string().optional(),
    level: z.string().optional(),
    link: z.string().optional(),
    // duration: z.string({
    //     required_error: "Course.duration.required",
    // }),
    // level: z.string({
    //     required_error: "Course.level.required",
    // }),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function CoursesPage() {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.Course");
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [courseType, setCourseType] = useState("standard");

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/course`,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    //#region Form
    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseFormSchema),
        defaultValues: {
            type: "standard",
        },
    });

    function onSubmit(values: CourseFormValues) {
        if (submitting) return;
        setSubmitting(true);

        fetch("/api/admin/course", {
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
            accessorKey: "type",
            header: t("type"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("type");

                return t(data) || "-";
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
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
            accessorKey: "category",
            header: t("category"),
            enableGlobalFilter: false,
            cell: ({ row }) => {
                const data: string = row.getValue("category");

                return t(data) || "-";
            },
            filterFn: (row, id, value) => value.includes(row.getValue(id)),
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
    ];
    //#endregion

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    if (isLoading)
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
                facetedFilters={[
                    {
                        column: "type",
                        title: t("type"),
                        options: [
                            { value: "standard", label: t("standard") },
                            { value: "video", label: t("video") },
                        ],
                    },
                    {
                        column: "category",
                        title: t("category"),
                        options: [
                            { value: "panel", label: t("panel") },
                            { value: "acronis", label: t("acronis") },
                        ],
                    },
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
                onClick={(item) => {
                    router.push("courses/" + item?.original?.id);
                }}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-screen overflow-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {`${t("new")} ${t("course")}`}
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
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("type")}
                                        </FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => {
                                                    setCourseType(value);
                                                    if (value === "standard") {
                                                        form.setValue(
                                                            "link",
                                                            undefined,
                                                        );
                                                    } else {
                                                        form.setValue(
                                                            "duration",
                                                            undefined,
                                                        );
                                                        form.setValue(
                                                            "level",
                                                            undefined,
                                                        );
                                                    }
                                                    field.onChange(value);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={t(
                                                            "select",
                                                        )}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="standard">
                                                        {t("standard")}
                                                    </SelectItem>
                                                    <SelectItem value="video">
                                                        {t("video")}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.type
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

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
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("category")}
                                        </FormLabel>
                                        <FormControl>
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={t(
                                                            "select",
                                                        )}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="panel">
                                                        {t("panel")}
                                                    </SelectItem>
                                                    <SelectItem value="acronis">
                                                        {t("acronis")}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.category
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            {courseType === "standard" ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="duration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("duration")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormError
                                                    error={
                                                        form?.formState?.errors
                                                            ?.duration
                                                    }
                                                />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="level"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("level")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormError
                                                    error={
                                                        form?.formState?.errors
                                                            ?.level
                                                    }
                                                />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            ) : (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="link"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                                    {t("link")}
                                                </FormLabel>
                                                <FormDescription>
                                                    {tf("link.description")}
                                                </FormDescription>
                                                <FormControl>
                                                    <Textarea
                                                        {...field}
                                                        rows={2}
                                                    />
                                                </FormControl>
                                                <FormError
                                                    error={
                                                        form?.formState?.errors
                                                            ?.link
                                                    }
                                                />
                                            </FormItem>
                                        )}
                                    />

                                    {form.getValues("link") && (
                                        <iframe
                                            className="max-w-96 min-h-[100px] rounded-xl mx-auto"
                                            src={form.getValues("link")}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                        ></iframe>
                                    )}
                                </>
                            )}

                            <FormField
                                control={form.control}
                                name="shortDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("shortDescription")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} maxLength={80} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.shortDescription
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("description")}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={4} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.description
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
