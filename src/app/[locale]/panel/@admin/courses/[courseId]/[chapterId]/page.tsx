"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/form";
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
import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";

import FormError from "@/components/FormError";
import DestructiveToast from "@/components/DestructiveToast";

import Lessons from "./Lessons";
import Link from "next/link";
import {
    LuChevronLeft,
    LuLoaderCircle,
    LuSave,
    LuTrash2,
} from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";

const chapterFormSchema = z.object({
    id: z.string().cuid(),
    active: z.boolean(),
    name: z
        .string({
            required_error: "Chapter.name.required",
        })
        .min(3, {
            message: "Chapter.name.minLength",
        })
        .max(60, {
            message: "Chapter.name.maxLength",
        }),
    order: z.coerce.number({
        required_error: "Chapter.order.required",
    }),
});

type ChapterFormValues = z.infer<typeof chapterFormSchema>;

export default function ChapterDetail({
    params,
}: {
    params: { courseId: string; chapterId: string };
}) {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.Chapter");
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/chapter/${params.chapterId}`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (d) => {
                form.reset(d);
            },
        },
    );

    //#region Form
    const form = useForm<ChapterFormValues>({
        resolver: zodResolver(chapterFormSchema),
    });

    function onSubmit(values: ChapterFormValues) {
        if (submitting) return;
        setSubmitting(true);

        fetch(`/api/admin/chapter/${params.chapterId}`, {
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
                            <Link href={`/panel/courses/${params.courseId}`}>
                                <LuChevronLeft className="size-4 mr-1" />
                                {t("backToCourse")}
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
                                                                `/api/admin/chapter/${params.chapterId}`,
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
                                                                            `/panel/courses/${params.courseId}`,
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
                                {t("chapterDetail")}
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
                                name="order"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("order")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="max-w-full md:max-w-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.order
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

                    <Lessons
                        chapterId={params.chapterId}
                        lessons={data.lessons}
                        mutate={mutate}
                    />
                </div>
            </form>
        </Form>
    );
}
