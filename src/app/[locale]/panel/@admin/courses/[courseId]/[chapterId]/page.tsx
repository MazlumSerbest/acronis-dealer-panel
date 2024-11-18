"use client";
import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";

import Loader from "@/components/loaders/Loader";
import FormError from "@/components/FormError";
import BoolChip from "@/components/BoolChip";
import Lessons from "./Lessons";
import Link from "next/link";
import { LuChevronLeft, LuLoader2 } from "react-icons/lu";

const chapterFormSchema = z.object({
    id: z.string().cuid(),
    active: z.boolean(),
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

export default function ChapterDetail({
    params,
}: {
    params: { courseId: string; chapterId: string };
}) {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.Chapter");
    const { toast } = useToast();

    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/chapter/${params.chapterId}`,
        null,
        {
            revalidateOnFocus: false,
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
                    toast({
                        variant: "destructive",
                        title: t("errorTitle"),
                        description: res.message,
                    });
                }

                setSubmitting(false);
            });
    }
    //#endregion

    if (error) return <div>{t("failedToLoad")}</div>;
    if (!data)
        return (
            <div className="h-80">
                <Loader />
            </div>
        );
    return (
        <>
            <Link
                href={`/panel/courses/${params.courseId}`}
                className="flex flex-row gap-1 font-medium hover:underline "
            >
                <LuChevronLeft className="size-6" />
                {t("backToCourse")}
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="font-medium text-xl">
                        {t("chapterDetail")}
                    </CardTitle>
                    <CardDescription>{data.name || "-"}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <div className="flex flex-col divide-y text-sm leading-6 *:sm:grid *:sm:grid-cols-2 *:md:grid-cols-3 *:px-4 *:py-2">
                        <div>
                            <dt className="font-medium">{t("active")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                <BoolChip value={data.active} />
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("name")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.name || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("order")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.order || "-"}
                            </dd>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-row gap-2 justify-end">
                    <Button
                        className="bg-green-600 hover:bg-green-600/90"
                        onClick={() => {
                            form.reset(data);
                            setOpen(true);
                        }}
                    >
                        {t("editChapter")}
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-screen overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{t("editChapter")}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            autoComplete="off"
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="active"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between">
                                        <div className="space-y-0.5">
                                            <FormLabel>{t("active")}</FormLabel>
                                            <FormDescription>
                                                {tf("active.description")}
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
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
                                        <LuLoader2 className="size-4 animate-spin ml-2" />
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Lessons
                chapterId={params.chapterId}
                lessons={data.lessons}
                isLoading={isLoading}
                mutate={mutate}
            />
        </>
    );
}
