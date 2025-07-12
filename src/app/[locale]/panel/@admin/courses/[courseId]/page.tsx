"use client";
import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
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

import FormError from "@/components/FormError";
import DestructiveToast from "@/components/DestructiveToast";

import Chapters from "./Chapters";
import Link from "next/link";
import {
    LuChevronLeft,
    LuLoaderCircle,
    LuSave,
    LuTrash2,
} from "react-icons/lu";
import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import { DateTimeFormat } from "@/utils/date";

const courseFormSchema = z.object({
    id: z.string().cuid(),
    active: z.boolean(),
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
    duration: z.string().optional(),
    level: z.string().optional(),
    link: z.string().optional(),
    // duration: z.string({
    //     required_error: "Course.duration.required",
    // }),
    // level: z.string({
    //     required_error: "Course.level.required",
    // }),
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
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function CourseDetail({
    params,
}: {
    params: { courseId: string };
}) {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.Course");
    const router = useRouter();

    const [submitting, setSubmitting] = useState(false);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/course/${params.courseId}`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (d) => {
                form.reset(d);
                if (d.type === "standard") {
                    form.setValue("link", undefined);
                } else {
                    form.setValue("duration", undefined);
                    form.setValue("level", undefined);
                }
            },
        },
    );

    //#region Form
    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseFormSchema),
    });

    function onSubmit(values: CourseFormValues) {
        if (submitting) return;
        setSubmitting(true);

        fetch(`/api/admin/course/${params.courseId}`, {
            method: "PUT",
            body: JSON.stringify(values),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
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

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    if (isLoading)
        return (
            <Skeleton>
                <div className="container">
                    <DefaultSkeleton />
                </div>
            </Skeleton>
        );
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
                <div className="xl:container flex flex-col gap-3">
                    <div className="col-span-full flex flex-row justify-between">
                        <Button
                            size="sm"
                            variant="link"
                            className="text-sm text-foreground underline-foreground p-0"
                            asChild
                        >
                            <Link href={`/panel/courses`}>
                                <LuChevronLeft className="size-4 mr-1" />
                                {t("backToCourses")}
                            </Link>
                        </Button>

                        <div className="flex flex-row gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                type="button"
                                                disabled={deleteSubmitting}
                                                variant="destructive"
                                                size="icon"
                                            >
                                                {deleteSubmitting ? (
                                                    <LuLoaderCircle className="size-5 animate-spin" />
                                                ) : (
                                                    <LuTrash2
                                                        className="size-5"
                                                        strokeWidth={1.5}
                                                    />
                                                )}
                                            </Button>
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

                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    {t("close")}
                                                </AlertDialogCancel>
                                                <AlertDialogAction asChild>
                                                    <Button
                                                        disabled={
                                                            deleteSubmitting
                                                        }
                                                        variant="destructive"
                                                        className="bg-destructive hover:bg-destructive/90"
                                                        onClick={() => {
                                                            if (
                                                                deleteSubmitting
                                                            )
                                                                return;
                                                            setDeleteSubmitting(
                                                                true,
                                                            );

                                                            fetch(
                                                                `/api/admin/chapter/${params.courseId}`,
                                                                {
                                                                    method: "DELETE",
                                                                },
                                                            )
                                                                .then((res) =>
                                                                    res.json(),
                                                                )
                                                                .then((res) => {
                                                                    if (
                                                                        res.ok
                                                                    ) {
                                                                        toast({
                                                                            description:
                                                                                res.message,
                                                                        });
                                                                        router.push(
                                                                            "/panel/courses",
                                                                        );
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
                                                                    setDeleteSubmitting(
                                                                        false,
                                                                    ),
                                                                );
                                                        }}
                                                    >
                                                        {t("delete")}
                                                        {deleteSubmitting && (
                                                            <LuLoaderCircle className="size-4 animate-spin ml-2" />
                                                        )}
                                                    </Button>
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TooltipTrigger>
                                <TooltipContent>{t("delete")}</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-blue-400 hover:bg-blue-400/90"
                                        size="icon"
                                    >
                                        {submitting ? (
                                            <LuLoaderCircle className="size-5 animate-spin" />
                                        ) : (
                                            <LuSave
                                                className="size-5"
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("save")}</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl">
                                {t("courseDetail")}
                            </CardTitle>
                            <CardDescription>
                                {data.name || "-"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col divide-y text-sm leading-6 sm:*:grid sm:*:grid-cols-2 md:*:grid-cols-3 *:items-center *:py-2">
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto">
                                            {t("active")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            <FormDescription>
                                                {tf("active.description")}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.active
                                                }
                                            />
                                        </dd>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("name")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                            <FormControl>
                                                <Input
                                                    className="max-w-full md:max-w-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.name
                                                }
                                            />
                                        </dd>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("category")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                            <Select
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="max-w-full md:max-w-sm">
                                                        <SelectValue
                                                            placeholder={t(
                                                                "category",
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
                                        </dd>
                                    </FormItem>
                                )}
                            />

                            {data.type === "standard" ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="duration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <dt className="font-medium my-auto after:content-['*'] after:ml-0.5 after:text-destructive">
                                                    {t("duration")}
                                                </dt>
                                                <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                                    <FormControl>
                                                        <Input
                                                            className="max-w-full md:max-w-sm"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormError
                                                        error={
                                                            form?.formState
                                                                ?.errors
                                                                ?.duration
                                                        }
                                                    />
                                                </dd>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="level"
                                        render={({ field }) => (
                                            <FormItem>
                                                <dt className="font-medium my-auto after:content-['*'] after:ml-0.5 after:text-destructive">
                                                    {t("level")}
                                                </dt>
                                                <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                                    <FormControl>
                                                        <Input
                                                            className="max-w-full md:max-w-sm"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormError
                                                        error={
                                                            form?.formState
                                                                ?.errors?.level
                                                        }
                                                    />
                                                </dd>
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
                                                <dt className="font-medium my-auto after:content-['*'] after:ml-0.5 after:text-destructive">
                                                    {t("link")}
                                                </dt>
                                                <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0 flex flex-col gap-2">
                                                    <FormDescription>
                                                        {tf("link.description")}
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Textarea
                                                            rows={2}
                                                            className="max-w-full md:max-w-sm"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormError
                                                        error={
                                                            form?.formState
                                                                ?.errors?.link
                                                        }
                                                    />
                                                    {form.getValues("link") && (
                                                        <div className="max-w-full md:max-w-sm">
                                                            <iframe
                                                                className="max-w-96 min-h-[100px] rounded-xl mx-auto"
                                                                src={form.getValues(
                                                                    "link",
                                                                )}
                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                referrerPolicy="strict-origin-when-cross-origin"
                                                                allowFullScreen
                                                            ></iframe>
                                                        </div>
                                                    )}
                                                </dd>
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <FormField
                                control={form.control}
                                name="shortDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("shortDescription")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                            <FormControl>
                                                <Input
                                                    className="max-w-full md:max-w-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.shortDescription
                                                }
                                            />
                                        </dd>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("description")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                            <FormControl>
                                                <Textarea
                                                    className="max-w-full md:max-w-sm"
                                                    rows={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.description
                                                }
                                            />
                                        </dd>
                                    </FormItem>
                                )}
                            />

                            <div>
                                <dt className="font-medium">
                                    {t("createdBy")}
                                </dt>
                                <dd>{data.createdBy}</dd>
                            </div>

                            <div>
                                <dt className="font-medium">
                                    {t("createdAt")}
                                </dt>
                                <dd>{DateTimeFormat(data.createdAt)}</dd>
                            </div>
                        </CardContent>
                    </Card>

                    {data.type === "standard" && (
                        <Chapters
                            courseId={params.courseId}
                            chapters={data.chapters}
                            mutate={mutate}
                        />
                    )}
                </div>
            </form>
        </Form>
    );
}
