"use client";
import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import Combobox from "@/components/Combobox";
import DatePicker from "@/components/DatePicker";
import Skeleton from "@/components/loaders/Skeleton";

import { LuLoaderCircle, LuSave, LuTrash2 } from "react-icons/lu";
import { cities } from "@/lib/constants";
import FormError from "@/components/FormError";
import { Badge } from "@/components/ui/badge";

const potentialPartnerFormSchema = z.object({
    status: z.enum(["potential", "contacted", "won", "lost"]),
    companyType: z.enum(["business", "person"]),
    name: z
        .string({
            required_error: "PotentialPartner.name.required",
        })
        .min(3, "PotentialPartner.name.minLength"),
    authorizedPerson: z.string().optional(),
    email: z
        .string()
        .email({
            message: "PotentialPartner.email.invalidType",
        })
        .optional(),
    city: z.coerce.number().optional(),
    district: z.string().optional(),
    taxNo: z.number().optional(),
    taxOffice: z.string().optional(),
    phone: z.string().optional(),
    postalCode: z.string().optional(),
    address: z.string().optional(),
    contactedAt: z.date().optional(),
    note: z.string().optional(),
});

type PotentialPartnerFormValues = z.infer<typeof potentialPartnerFormSchema>;

export default function PotentialPartnerDetail({
    params,
}: {
    params: { id: string };
}) {
    const t = useTranslations("General");

    const [submitting, setSubmitting] = useState(false);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);
    const [districts, setDistricts] = useState<ListBoxItem[]>([]);

    const {
        data: partner,
        error,
        isLoading,
        mutate,
    } = useSWR(`/api/admin/potentialPartner/${params?.id}`, null, {
        revalidateOnFocus: false,
        onSuccess: (data) => {
            setDistricts(
                cities
                    .find((c) => c.code == data.city)
                    ?.districts.map((d) => {
                        return {
                            id: d,
                            name: d,
                        };
                    }) || [],
            );
            form.reset({
                status: data.status,
                companyType: data.companyType,
                name: data.name,
                authorizedPerson: data.authorizedPerson || undefined,
                taxNo: data.taxNo || undefined,
                taxOffice: data.taxOffice || undefined,
                phone: data.phone || undefined,
                email: data.email || undefined,
                contactedAt: new Date(data.contactedAt) || undefined,
                city: data.city,
                district: data.district || undefined,
                postalCode: data.postalCode || undefined,
                address: data.address || undefined,
                note: data.note || undefined,
            } as PotentialPartnerFormValues);
        },
    });

    //#region Form
    const form = useForm<PotentialPartnerFormValues>({
        resolver: zodResolver(potentialPartnerFormSchema),
    });

    function onSubmit(values: PotentialPartnerFormValues) {
        if (submitting) return;
        setSubmitting(true);

        fetch(`/api/admin/potentialPartner/${params?.id}`, {
            method: "PUT",
            body: JSON.stringify(values),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    mutate();
                    form.reset();
                } else {
                    toast({
                        variant: "destructive",
                        title: t("errorTitle"),
                        description: res.message,
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
                <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-5 md:col-span-3 rounded-xl bg-slate-200 w-full h-[480px]"></div>
                    <div className="col-span-5 md:col-span-2 rounded-xl bg-slate-200 w-full h-[480px]"></div>
                </div>
            </Skeleton>
        );
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
                <div className="grid grid-cols-5 gap-3">
                    <div className="absolute top-4 right-4 flex flex-row gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
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

                    <Card className="col-span-5 md:col-span-3 max-h-min">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex flex-row gap-4 text-xl">
                                {partner?.name}
                                {partner?.status === "potential" ? (
                                    <Badge variant="outline">
                                        {t("potential")}
                                    </Badge>
                                ) : partner?.status === "contacted" ? (
                                    <Badge className="bg-yellow-500 hover:bg-yellow-500/90">
                                        {t("contacted")}
                                    </Badge>
                                ) : partner?.status === "won" ? (
                                    <Badge className="bg-green-600 hover:bg-green-600/90">
                                        {t("won")}
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">
                                        {t("lost")}
                                    </Badge>
                                )}
                            </CardTitle>
                            {/* <CardDescription>
                                Mazlum Serbest
                            </CardDescription> */}
                        </CardHeader>
                        <CardContent className="flex flex-col divide-y text-sm leading-6 sm:*:grid sm:*:grid-cols-2 md:*:grid-cols-3 *:items-center *:py-2">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("status")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="max-w-full md:max-w-sm">
                                                        <SelectValue
                                                            placeholder={t(
                                                                "status",
                                                            )}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="potential">
                                                        {t("potential")}
                                                    </SelectItem>
                                                    <SelectItem value="contacted">
                                                        {t("contacted")}
                                                    </SelectItem>
                                                    <SelectItem value="won">
                                                        {t("won")}
                                                    </SelectItem>
                                                    <SelectItem value="lost">
                                                        {t("lost")}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.status
                                                }
                                            />
                                        </dd>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="companyType"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto after:content-['*'] after:ml-0.5 after:text-destructive">
                                            {t("companyType")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="max-w-full md:max-w-sm">
                                                        <SelectValue
                                                            placeholder={t(
                                                                "companyType",
                                                            )}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="business">
                                                        {t("business")}
                                                    </SelectItem>
                                                    <SelectItem value="person">
                                                        {t("person")}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.companyType
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
                                name="authorizedPerson"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto">
                                            {t("authorizedPerson")}
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
                                                        ?.authorizedPerson
                                                }
                                            />
                                        </dd>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="taxNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto">
                                            {t("taxNo")}
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
                                                        ?.taxNo
                                                }
                                            />
                                        </dd>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="taxOffice"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto">
                                            {t("taxOffice")}
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
                                                        ?.taxOffice
                                                }
                                            />
                                        </dd>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto">
                                            {t("email")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    className="max-w-full md:max-w-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.email
                                                }
                                            />
                                        </dd>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto">
                                            {t("phone")}
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
                                                        ?.phone
                                                }
                                            />
                                        </dd>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contactedAt"
                                render={({ field }) => (
                                    <FormItem>
                                        <dt className="font-medium my-auto">
                                            {t("contactedAt")}
                                        </dt>
                                        <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                            <div className="max-w-full md:max-w-sm">
                                                <DatePicker
                                                    field={field}
                                                    from={
                                                        new Date(
                                                            new Date().setFullYear(
                                                                new Date().getFullYear() -
                                                                    1,
                                                            ),
                                                        )
                                                    }
                                                    to={
                                                        new Date(
                                                            new Date().setMonth(
                                                                new Date().getMonth() +
                                                                    6,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.contactedAt
                                                }
                                            />
                                        </dd>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3 col-span-5 md:col-span-2 max-h-min">
                        <Card className="col-span-5 md:col-span-2 max-h-min">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex flex-row justify-between text-xl">
                                    {t("address")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col divide-y text-sm leading-6 sm:*:grid sm:*:grid-cols-2 md:*:grid-cols-3 *:items-center *:py-2">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <dt className="font-medium my-auto after:content-['*'] after:ml-0.5 after:text-destructive">
                                                {t("city")}
                                            </dt>
                                            <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                                <FormControl>
                                                    <Combobox
                                                        name="city"
                                                        data={
                                                            cities.map((c) => {
                                                                return {
                                                                    id: c.code,
                                                                    name: c.name,
                                                                };
                                                            }) || []
                                                        }
                                                        form={form}
                                                        field={field}
                                                        onChange={() => {
                                                            form.setValue(
                                                                "district",
                                                                undefined,
                                                            );
                                                            setDistricts(
                                                                cities
                                                                    .find(
                                                                        (c) =>
                                                                            c.code ==
                                                                            form.getValues(
                                                                                "city",
                                                                            ),
                                                                    )
                                                                    ?.districts.map(
                                                                        (d) => {
                                                                            return {
                                                                                id: d,
                                                                                name: d,
                                                                            };
                                                                        },
                                                                    ) || [],
                                                            );
                                                        }}
                                                        placeholder={t(
                                                            "select",
                                                        )}
                                                        inputPlaceholder={t(
                                                            "searchPlaceholder",
                                                        )}
                                                        emptyText={t(
                                                            "noResults",
                                                        )}
                                                    />
                                                </FormControl>
                                                <FormError
                                                    error={
                                                        form?.formState?.errors
                                                            ?.city
                                                    }
                                                />
                                            </dd>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="district"
                                    render={({ field }) => (
                                        <FormItem>
                                            <dt className="font-medium my-auto">
                                                {t("district")}
                                            </dt>
                                            <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                                <FormControl>
                                                    <Combobox
                                                        name="district"
                                                        data={districts}
                                                        form={form}
                                                        field={field}
                                                        placeholder={t(
                                                            "select",
                                                        )}
                                                        inputPlaceholder={t(
                                                            "searchPlaceholder",
                                                        )}
                                                        emptyText={t(
                                                            "noResults",
                                                        )}
                                                    />
                                                </FormControl>
                                                <FormError
                                                    error={
                                                        form?.formState?.errors
                                                            ?.district
                                                    }
                                                />
                                            </dd>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <dt className="font-medium my-auto">
                                                {t("postalCode")}
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
                                                            ?.taxNo
                                                    }
                                                />
                                            </dd>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <dt className="font-medium my-auto">
                                                {t("address")}
                                            </dt>
                                            <dd className="col-span-1 md:col-span-2 text-foreground mt-1 sm:mt-0">
                                                <Textarea
                                                    rows={3}
                                                    className="max-w-full md:max-w-sm field-sizing-content"
                                                    {...field}
                                                />
                                                <FormError
                                                    error={
                                                        form?.formState?.errors
                                                            ?.taxNo
                                                    }
                                                />
                                            </dd>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card className="col-span-5 md:col-span-2 max-h-min">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex flex-row justify-between text-xl">
                                    {t("note")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm leading-6">
                                <FormField
                                    control={form.control}
                                    name="note"
                                    render={({ field }) => (
                                        <FormItem>
                                            <dd>
                                                <Textarea
                                                    rows={5}
                                                    className="field-sizing-content"
                                                    {...field}
                                                ></Textarea>
                                            </dd>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.note
                                                }
                                            />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    );
}
