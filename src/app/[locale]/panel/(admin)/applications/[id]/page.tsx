"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { useToast } from "@/components/ui/use-toast";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import FormError from "@/components/FormError";
import { DateTimeFormat } from "@/utils/date";
import { cities } from "@/lib/constants";

const applicationFormSchema = z.object({
    name: z
        .string({
            required_error: "Application.name.required",
            invalid_type_error: "Application.name.invalidType",
        })
        .min(10, { message: "Application.name.minLength" }),
    email: z
        .string({
            required_error: "Application.email.required",
        })
        .email({
            message: "Application.email.invalidType",
        }),
    mobile: z
        .string({
            required_error: "Application.mobile.required",
        })
        .length(10, { message: "Application.mobile.length" })
        .refine(
            (value) => /^[0-9]*$/.test(value ?? ""),
            "Application.mobile.invalidType",
        ),
    phone: z
        .string({
            required_error: "Application.phone.required",
        })
        .length(10, { message: "Application.phone.length" })
        .refine(
            (value) => /^[0-9]*$/.test(value ?? ""),
            "Application.phone.invalidType",
        ),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

const partnerFormSchema = z.object({
    acronisId: z.string({
        required_error: "Partner.acronisId.required",
        invalid_type_error: "Partner.acronisId.invalidType",
    }),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

export default function ApplicationDetail({
    params,
}: {
    params: { id: string };
}) {
    const t = useTranslations("General");
    const tf = useTranslations("FormMessages");
    const { toast } = useToast();

    const [openApprove, setOpenApprove] = useState(false);
    const [openCreatePartner, setOpenCreatePartner] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [tenantName, setTenantName] = useState("");

    const { data, error, mutate } = useSWR(
        `/api/application/${params.id}`,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {},
        },
    );

    //#region Form
    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationFormSchema),
    });

    function onSubmit(values: ApplicationFormValues) {
        fetch(`/api/application/${params.id}`, {
            method: "PUT",
            body: JSON.stringify(values),
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    setOpenUpdate(false);
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

    const partnerForm = useForm<PartnerFormValues>({
        resolver: zodResolver(partnerFormSchema),
    });

    function onSubmitPartner(values: PartnerFormValues) {
        const partner = {
            ...values,
            name: data?.name,
            email: data?.email,
            mobile: data?.mobile,
            applicationId: params.id,
        };

        fetch("/api/partner", {
            method: "POST",
            body: JSON.stringify(partner),
            headers: { "Content-Type": "application/json" },
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    setOpenCreatePartner(false);
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

    const citiesList: ListBoxItem[] = cities.map((city) => {
        return {
            id: city.code,
            name: city.name,
        };
    });

    if (error) return <div>{t("failedToLoad")}</div>;
    if (!data)
        return (
            <Skeleton>
                <DefaultSkeleton />
            </Skeleton>
        );
    return (
        <>
            <Card className="w-full">
                <CardHeader className="py-4">
                    <CardTitle className="font-medium text-xl">
                        {t("applicationInformation")}
                    </CardTitle>
                    <CardDescription>{data.name}</CardDescription>
                </CardHeader>

                <CardContent className="grid gap-2">
                    <div className="flex flex-col divide-y text-sm leading-6 *:sm:grid *:sm:grid-cols-2 *:md:grid-cols-3 *:px-4 *:py-2">
                        {
                            <div>
                                <dt className="font-medium">{t("status")}</dt>
                                <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                    {!data.approvedAt && !data.partner
                                        ? t("waiting")
                                        : data.approvedAt && !data.partner
                                        ? t("approved")
                                        : data.approvedAt && data.partner
                                        ? t("resolved")
                                        : "-"}
                                </dd>
                            </div>
                        }
                        <div>
                            <dt className="font-medium">{t("companyName")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.name || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("companyType")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {t(data.companyType) || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("taxNo")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.taxNo || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("taxOffice")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.taxOffice || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("email")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.email || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("mobile")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data?.mobile ? "+90" + data.phone : "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("phone")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data?.phone ? "+90" + data.phone : "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("address")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.address || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("city")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {citiesList.find((c) => c.id == data.city)
                                    ?.name || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("district")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.district || "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">{t("postalCode")}</dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {data.postalCode || "-"}
                            </dd>
                        </div>
                    </div>
                </CardContent>

                {!data.partner && (
                    <CardFooter className="flex flex-row gap-2 justify-end">
                        {!data.approvedAt && !data.partnerId && (
                            <Dialog
                                open={openApprove}
                                onOpenChange={setOpenApprove}
                            >
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-400 hover:bg-blue-400/90">
                                        {t("approveApplication")}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {t("approveApplication")}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {t("approveMessage")}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">
                                                {t("close")}
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            className="bg-blue-400 hover:bg-blue-400/90"
                                            onClick={() => {
                                                fetch(
                                                    `/api/application/${data.id}/approve`,
                                                    {
                                                        method: "PUT",
                                                    },
                                                )
                                                    .then((res) => res.json())
                                                    .then((res) => {
                                                        if (res.ok) {
                                                            toast({
                                                                description:
                                                                    res.message,
                                                            });
                                                            setOpenApprove(
                                                                false,
                                                            );
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
                                                            setOpenApprove(
                                                                false,
                                                            );
                                                        }
                                                    });
                                            }}
                                        >
                                            {t("approve")}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        {data.approvedAt && !data.partner && (
                            <>
                                <Button
                                    className="bg-blue-400 hover:bg-blue-400/90"
                                    onClick={() => {
                                        partnerForm.reset({});
                                        setTenantName("");
                                        setOpenCreatePartner(true);
                                    }}
                                >
                                    {t("createPartner")}
                                </Button>

                                <Dialog
                                    open={openCreatePartner}
                                    onOpenChange={setOpenCreatePartner}
                                >
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {t("createPartner")}
                                            </DialogTitle>
                                            <DialogDescription>
                                                {t("createPartnerMessage")}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Form {...partnerForm}>
                                            <form
                                                onSubmit={partnerForm.handleSubmit(
                                                    onSubmitPartner,
                                                )}
                                                autoComplete="off"
                                                className="space-y-4"
                                            >
                                                <FormField
                                                    control={
                                                        partnerForm.control
                                                    }
                                                    name="acronisId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                                                {t("acronisId")}
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    onChange={(
                                                                        v,
                                                                    ) => {
                                                                        fetch(
                                                                            `/api/acronis/tenants/${v.target.value}`,
                                                                        )
                                                                            .then(
                                                                                (
                                                                                    res,
                                                                                ) =>
                                                                                    res.json(),
                                                                            )
                                                                            .then(
                                                                                (
                                                                                    res,
                                                                                ) => {
                                                                                    setTenantName(
                                                                                        res
                                                                                            ?.tenant
                                                                                            ?.name,
                                                                                    );
                                                                                    partnerForm.setValue(
                                                                                        "acronisId",
                                                                                        v
                                                                                            .target
                                                                                            .value,
                                                                                    );
                                                                                },
                                                                            );
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                {tenantName}
                                                            </FormDescription>
                                                            <FormError
                                                                error={
                                                                    partnerForm
                                                                        ?.formState
                                                                        ?.errors
                                                                        ?.acronisId
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
                                                        className="bg-blue-400 hover:bg-blue-400/90"
                                                    >
                                                        {t("create")}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                        {!data.partner && (
                            <>
                                <Button
                                    className="bg-green-600 hover:bg-green-600/90"
                                    onClick={() => {
                                        form.reset(data);
                                        setOpenUpdate(true);
                                    }}
                                >
                                    {t("editApplication")}
                                </Button>

                                <Dialog
                                    open={openUpdate}
                                    onOpenChange={setOpenUpdate}
                                >
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {t("editApplication")}
                                            </DialogTitle>
                                        </DialogHeader>
                                        <Form {...form}>
                                            <form
                                                onSubmit={form.handleSubmit(
                                                    onSubmit,
                                                )}
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
                                                                <Input
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormError
                                                                error={
                                                                    form
                                                                        ?.formState
                                                                        ?.errors
                                                                        ?.name
                                                                }
                                                            />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                                                {t("email")}
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormError
                                                                error={
                                                                    form
                                                                        ?.formState
                                                                        ?.errors
                                                                        ?.email
                                                                }
                                                            />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="mobile"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                                                {t("mobile")}
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative flex items-center">
                                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 transform text-zinc-400 text-sm">
                                                                        +90
                                                                    </span>
                                                                    <Input
                                                                        type="tel"
                                                                        className="pl-10"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormError
                                                                error={
                                                                    form
                                                                        ?.formState
                                                                        ?.errors
                                                                        ?.mobile
                                                                }
                                                            />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="after:content-['*'] after:ml-0.5 after:text-destructive">
                                                                {t("phone")}
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="relative flex items-center">
                                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 transform text-zinc-400 text-sm">
                                                                        +90
                                                                    </span>
                                                                    <Input
                                                                        type="tel"
                                                                        className="pl-10"
                                                                        {...field}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormError
                                                                error={
                                                                    form
                                                                        ?.formState
                                                                        ?.errors
                                                                        ?.phone
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
                        )}
                    </CardFooter>
                )}
            </Card>

            <Card className="w-full">
                <CardHeader className="py-4">
                    <CardTitle className="font-medium text-xl">
                        {t("registrationInformation")}
                    </CardTitle>
                </CardHeader>

                <CardContent className="grid gap-2">
                    <div className="flex flex-col divide-y text-sm leading-6 *:sm:grid *:sm:grid-cols-2 *:md:grid-cols-3 *:px-4 *:py-2">
                        <div>
                            <dt className="font-medium">
                                {t("applicationDate")}
                            </dt>
                            <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                {DateTimeFormat(data.applicationDate) || "-"}
                            </dd>
                        </div>
                        {data.approvedAt && (
                            <div>
                                <dt className="font-medium">
                                    {t("approvedAt")}
                                </dt>
                                <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                    {DateTimeFormat(data.approvedAt) || "-"}
                                </dd>
                            </div>
                        )}
                        {data.approvedBy && (
                            <div>
                                <dt className="font-medium">
                                    {t("approvedBy")}
                                </dt>
                                <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                    {data.approvedBy || "-"}
                                </dd>
                            </div>
                        )}
                        {data.partner && (
                            <>
                                <div>
                                    <dt className="font-medium">
                                        {t("partnerId")}
                                    </dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        {data.partner.id || "-"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium">
                                        {t("acronisId")}
                                    </dt>
                                    <dd className="col-span-1 md:col-span-2 font-light text-zinc-600 mt-1 sm:mt-0">
                                        {data.partner.acronisId || "-"}
                                    </dd>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
