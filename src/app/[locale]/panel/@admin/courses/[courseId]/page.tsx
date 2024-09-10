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
import { Textarea } from "@/components/ui/textarea";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import Loader from "@/components/loaders/Loader";
import BoolChip from "@/components/BoolChip";
import FormError from "@/components/FormError";

import Chapters from "./Chapters";
import Link from "next/link";
import { LuChevronLeft } from "react-icons/lu";

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
    duration: z.string({
        required_error: "Course.duration.required",
    }),
    level: z.string({
        required_error: "Course.level.required",
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
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function CourseDetail({
    params,
}: {
    params: { courseId: string };
}) {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages.Course");
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const { data, error, isLoading, mutate } = useSWR(
        `/api/admin/course/${params.courseId}`,
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
                href={`/panel/courses`}
                className="flex flex-row gap-1 font-medium hover:underline "
            >
                <LuChevronLeft className="size-6" />
                {t("backToCourses")}
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="font-medium text-xl">
                        {t("courseDetail")}
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
                        {
                            <div>
                                <dt className="font-medium">{t("category")}</dt>
                                <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                    {t(data.category)}
                                </dd>
                            </div>
                        }
                        <div>
                            <dt className="font-medium">{t("name")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.name || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("duration")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.duration || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("level")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.level || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">
                                {t("shortDescription")}
                            </dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.shortDescription || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("description")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.description || "-"}
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
                        {t("editCourse")}
                    </Button>
                </CardFooter>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-screen overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{t("editCourse")}</DialogTitle>
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

            <Chapters
                courseId={params.courseId}
                chapters={data.chapters}
                isLoading={isLoading}
                mutate={mutate}
            />
        </>
    );
}
