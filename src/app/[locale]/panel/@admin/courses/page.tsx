"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { DataTable } from "@/components/table/DataTable";
import BoolChip from "@/components/BoolChip";
import FormError from "@/components/FormError";
import Skeleton, { TableSkeleton } from "@/components/loaders/Skeleton";
import { LuChevronsUpDown, LuMoreHorizontal } from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const courseFormSchema = z.object({
    id: z.string().cuid().optional(),
    name: z
        .string({
            required_error: "User.name.required",
        })
        .max(60, {
            message: "User.name.maxLength",
        }),
    category: z.enum(["panel", "acronis"], {
        required_error: "User.category.required",
    }),
    shortDescription: z
        .string({
            required_error: "User.shortDescription.required",
        })
        .max(80, {
            message: "User.shortDescription.maxLength",
        }),
    description: z.string({
        required_error: "User.description.required",
    }),
    duration: z.string({
        required_error: "User.duration.required",
    }),
    level: z.string({
        required_error: "User.level.required",
    }),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function CoursesPage() {
    const t = useTranslations("General");
    const router = useRouter();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

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
    });

    function onSubmit(values: CourseFormValues) {
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
                    toast({
                        variant: "destructive",
                        title: t("errorTitle"),
                        description: res.message,
                    });
                }
            });
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
                <div className="flex flex-row items-center">
                    {t("name")}
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
                            <LuMoreHorizontal className="size-4" />
                            {/* <Button
                                 aria-haspopup="true"
                                 size="icon"
                                 variant="ghost"
                             >
                                 <span className="sr-only">
                                     {t("toggleMenu")}
                                 </span>
                             </Button> */}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                                {t("actions")}
                            </DropdownMenuLabel>
                            {data?.application && (
                                <DropdownMenuItem
                                    onClick={() => {
                                        router.push(
                                            `/panel/applications/${data.application?.id}`,
                                        );
                                    }}
                                >
                                    {t("goToApplication")}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => {
                                    // setIsNew(false);
                                    // setOpen(true);
                                    // form.reset(data);
                                }}
                            >
                                {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>{t("delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
    //#endregion

    if (error) return <div>{t("failedToLoad")}</div>;
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
                facetedFilters={[
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
                onClick={(row) => {}}
            />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
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
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={t(
                                                            "select",
                                                        )}
                                                    />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="panel">
                                                    {t("panel")}
                                                </SelectItem>
                                                <SelectItem value="acronis">
                                                    {t("acronis")}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.category
                                            }
                                        />
                                    </FormItem>
                                )}
                            />

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

                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
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
                                        <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("level")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.level
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
                                    {t("save")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
