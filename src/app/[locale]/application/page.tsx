"use client";
import { useTranslations, useLocale } from "next-intl";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

import { Turnstile } from "@marsidev/react-turnstile";
import Combobox from "@/components/Combobox";
import Logo from "@/components/navigation/Logo";
import FormError from "@/components/FormError";
import { cities } from "@/lib/constants";
import { LuBuilding2, LuUser } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const applicationFormSchema = z.object({
    companyType: z.enum(["business", "person"], {
        required_error: "Application.companyType.required",
    }),
    name: z
        .string({
            required_error: "Application.name.required",
            invalid_type_error: "Application.name.invalidType",
        })
        .min(10, { message: "Application.name.minLength" }),
    taxNo: z
        .string({
            required_error: "Application.taxNo.required",
        })
        .min(10, { message: "Application.taxNo.minLength" })
        .max(11, { message: "Application.taxNo.maxLength" })
        .refine(
            (value) => /^[0-9]*$/.test(value ?? ""),
            "Application.taxNo.invalidType",
        ),
    taxOffice: z.number({
        required_error: "Application.taxOffice.required",
    }),
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
    address: z
        .string({
            required_error: "Application.address.required",
        })
        .min(10, { message: "Application.address.minLength" }),
    city: z.number({
        required_error: "Application.city.required",
    }),
    district: z.string({
        required_error: "Application.district.required",
    }),
    postalCode: z
        .string({
            required_error: "Application.postalCode.required",
        })
        .length(5, { message: "Application.postalCode.length" })
        .refine(
            (value) => /^[0-9]*$/.test(value ?? ""),
            "Application.postalCode.invalidType",
        ),
    contract: z.instanceof(File),
    taxCertificate: z.instanceof(File),
    signatureCircular: z.instanceof(File, { message: "" }),
    tradeRegistry: z.instanceof(File).optional(),
    personalData: z.literal<boolean>(true, {
        errorMap: () => ({ message: "Application.personalData.required" }),
    }),
    turnstile: z.literal<boolean>(true, {
        errorMap: () => ({ message: "Application.turnstile.required" }),
    }),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

export default function Application() {
    const { toast } = useToast();
    const locale = useLocale();
    const t = useTranslations("General");
    const ta = useTranslations("Application");

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationFormSchema)
    });

    function onSubmit(data: ApplicationFormValues) {
        const formData = new FormData();
        formData.append("companyType", data.companyType);
        formData.append("name", data.name);
        formData.append("taxNo", data.taxNo);
        formData.append("taxOffice", data.taxOffice.toString());
        formData.append("email", data.email);
        formData.append("mobile", data.mobile);
        formData.append("phone", data.phone);
        formData.append("address", data.address);
        formData.append("city", data.city.toString());
        formData.append("district", data.district);
        formData.append("postalCode", data.postalCode);
        // Files

        fetch("/api/application", {
            method: "POST",
            body: formData,
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.ok) {
                    toast({
                        description: res.message,
                    });
                    form.reset();
                } else {
                    toast({
                        variant: "destructive",
                        title: t("errorTitle"),
                        description: res.message,
                    });
                }
            });
    }

    const citiesList: ListBoxItem[] = cities.map((city) => {
        return {
            id: city.code,
            name: city.name,
        };
    });
    const taxOffices: ListBoxItem[] = [
        {
            id: 121212,
            name: "Test Vergi Dairesi",
        },
        {
            id: 121213,
            name: "Test Vergi Dairesi 2",
        },
        {
            id: 121214,
            name: "Test Vergi Dairesi 3",
        },
    ];

    return (
        <div className="flex flex-col min-h-dvh w-full place-items-center bg-zinc-100">
            <Card className="max-w-[800px] mt-8 mb-6">
                <CardHeader className="flex flex-row">
                    <div className="flex-1">
                        <CardTitle className="text-3xl tracking-tight text-blue-400">
                            {ta("title")}
                        </CardTitle>
                        <CardDescription>{ta("description")}</CardDescription>
                    </div>
                    <Logo width={40} height={40} />
                </CardHeader>

                <Separator />

                <CardContent className="flex flex-col p-6 gap-4">
                    <ol className="list-decimal list-inside divide-y divide-zinc-200 text-sm text-justify *:py-2">
                        <li>{ta("Steps.1")}</li>
                        <li>{ta("Steps.2")}</li>
                        <li>{ta("Steps.3")}</li>
                        <li>{ta("Steps.4")}</li>
                    </ol>
                </CardContent>

                <Separator />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="flex flex-col gap-6 p-6">
                            <FormField
                                control={form.control}
                                name="companyType"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>
                                            {t("companyType")}
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-2"
                                            >
                                                <FormItem>
                                                    <FormLabel className="[&:has([data-state=checked])>div]:ring-2 !ring-blue-500 ring-offset-2 [&:has([data-state=checked])>div]:text-blue-500 cursor-pointer">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value="business"
                                                                className="sr-only"
                                                            />
                                                        </FormControl>
                                                        <Card className="h-full">
                                                            <CardHeader className="flex flex-row p-4 gap-4 items-center">
                                                                <LuBuilding2 className="size-6" />
                                                                <span className="flex-1">
                                                                    {t(
                                                                        "business",
                                                                    )}
                                                                </span>
                                                            </CardHeader>
                                                            <Separator />
                                                            <CardContent className="flex flex-col py-2 px-4 gap-2">
                                                                <p className="text-primary">
                                                                    {t(
                                                                        "requiredDocuments",
                                                                    )}
                                                                </p>
                                                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                                    <li>
                                                                        {t(
                                                                            "contract",
                                                                        )}
                                                                    </li>
                                                                    <li>
                                                                        {t(
                                                                            "taxCertificate",
                                                                        )}
                                                                    </li>
                                                                    <li>
                                                                        {t(
                                                                            "signatureCircular",
                                                                        )}
                                                                    </li>
                                                                    <li>
                                                                        {t(
                                                                            "tradeRegistry",
                                                                        )}
                                                                    </li>
                                                                </ul>
                                                            </CardContent>
                                                        </Card>
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem>
                                                    <FormLabel className="[&:has([data-state=checked])>div]:ring-2 !ring-blue-500 ring-offset-2 [&:has([data-state=checked])>div]:text-blue-500 cursor-pointer">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value="person"
                                                                className="sr-only"
                                                            />
                                                        </FormControl>
                                                        <Card className="h-full">
                                                            <CardHeader className="flex flex-row p-4 gap-4 items-center">
                                                                <LuUser className="size-6" />
                                                                <span className="flex-1">
                                                                    {t(
                                                                        "person",
                                                                    )}
                                                                </span>
                                                            </CardHeader>
                                                            <Separator />
                                                            <CardContent className="flex flex-col py-2 px-4 gap-2">
                                                                <p className="text-primary">
                                                                    {t(
                                                                        "requiredDocuments",
                                                                    )}
                                                                </p>
                                                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                                    <li>
                                                                        {t(
                                                                            "contract",
                                                                        )}
                                                                    </li>
                                                                    <li>
                                                                        {t(
                                                                            "taxCertificate",
                                                                        )}
                                                                    </li>
                                                                    <li>
                                                                        {t(
                                                                            "signatureCircular",
                                                                        )}
                                                                    </li>
                                                                </ul>
                                                            </CardContent>
                                                        </Card>
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        {/* <FormDescription>
                                        </FormDescription> */}
                                        <FormError
                                            error={
                                                form?.formState?.errors
                                                    ?.companyType
                                            }
                                        />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>
                                            {t("companyName")}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={
                                                    t("example") +
                                                    " Gen Bilgi Teknolojileri Sanayi ve Ticaret Ltd. Şti."
                                                }
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {ta("Descriptions.companyName")}
                                        </FormDescription>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.name
                                            }
                                        />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="taxNo"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>{t("taxNo")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={
                                                        t("example") +
                                                        " 1234567890"
                                                    }
                                                    maxLength={11}
                                                    minLength={10}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {ta("Descriptions.taxNo")}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.taxNo
                                                }
                                            />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="taxOffice"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>
                                                {t("taxOffice")}
                                            </FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    name="taxOffice"
                                                    data={taxOffices}
                                                    form={form}
                                                    field={field}
                                                    placeholder={t("select")}
                                                    inputPlaceholder={t(
                                                        "searchPlaceholder",
                                                    )}
                                                    emptyText={t("noResults")}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {ta("Descriptions.taxOffice")}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.taxOffice
                                                }
                                            />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* Contact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>{t("email")}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    // type="email"
                                                    placeholder={
                                                        t("example") +
                                                        " test@gmail.com"
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {ta("Descriptions.email")}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
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
                                        <FormItem className="space-y-2">
                                            <FormLabel>{t("mobile")}</FormLabel>
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
                                            <FormDescription>
                                                {ta("Descriptions.mobile")}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
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
                                        <FormItem className="space-y-2">
                                            <FormLabel>{t("phone")}</FormLabel>
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
                                            <FormDescription>
                                                {ta("Descriptions.phone")}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.phone
                                                }
                                            />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* Address */}
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>{t("address")}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            {ta("Descriptions.address")}
                                        </FormDescription>
                                        <FormError
                                            error={
                                                form?.formState?.errors?.address
                                            }
                                        />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>{t("city")}</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    name="city"
                                                    data={citiesList}
                                                    form={form}
                                                    field={field}
                                                    // value={field.value}
                                                    placeholder={t("select")}
                                                    inputPlaceholder={t(
                                                        "searchPlaceholder",
                                                    )}
                                                    emptyText={t("noResults")}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {ta("Descriptions.city")}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors.city
                                                }
                                            />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="district"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>
                                                {t("district")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="district"
                                                    placeholder={
                                                        t("example") +
                                                        " Karşıyaka"
                                                    }
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {ta("Descriptions.district")}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.district
                                                }
                                            />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>
                                                {t("postalCode")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="postalCode"
                                                    placeholder={
                                                        t("example") + " 12345"
                                                    }
                                                    maxLength={5}
                                                    minLength={5}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {ta("Descriptions.postalCode")}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.postalCode
                                                }
                                            />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* Files */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="contract"
                                    render={({
                                        field: {
                                            value,
                                            onChange,
                                            ...fieldProps
                                        },
                                    }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("contract")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...fieldProps}
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    placeholder="test"
                                                    onChange={(e) =>
                                                        onChange(
                                                            e.target.files &&
                                                                e.target
                                                                    .files[0],
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {ta("Descriptions.contract")}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.contract
                                                }
                                            />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="taxCertificate"
                                    render={({
                                        field: {
                                            value,
                                            onChange,
                                            ...fieldProps
                                        },
                                    }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("taxCertificate")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...fieldProps}
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) =>
                                                        onChange(
                                                            e.target.files &&
                                                                e.target
                                                                    .files[0],
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {ta(
                                                    "Descriptions.taxCertificate",
                                                )}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.taxCertificate
                                                }
                                            />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="signatureCircular"
                                    render={({
                                        field: {
                                            value,
                                            onChange,
                                            ...fieldProps
                                        },
                                    }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {t("signatureCircular")}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...fieldProps}
                                                    type="file"
                                                    accept="image/*,.pdf"
                                                    onChange={(e) =>
                                                        onChange(
                                                            e.target.files &&
                                                                e.target
                                                                    .files[0],
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                {ta(
                                                    "Descriptions.signatureCircular",
                                                )}
                                            </FormDescription>
                                            <FormError
                                                error={
                                                    form?.formState?.errors
                                                        ?.signatureCircular
                                                }
                                            />
                                        </FormItem>
                                    )}
                                />
                                {form.getValues("companyType") ===
                                    "business" && (
                                    <FormField
                                        control={form.control}
                                        name="tradeRegistry"
                                        render={({
                                            field: {
                                                value,
                                                onChange,
                                                ...fieldProps
                                            },
                                        }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {t("tradeRegistry")}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...fieldProps}
                                                        type="file"
                                                        accept="image/*,.pdf"
                                                        onChange={(e) =>
                                                            onChange(
                                                                e.target
                                                                    .files &&
                                                                    e.target
                                                                        .files[0],
                                                            )
                                                        }
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    {ta(
                                                        "Descriptions.tradeRegistry",
                                                    )}
                                                </FormDescription>
                                                <FormError
                                                    error={
                                                        form?.formState?.errors
                                                            ?.tradeRegistry
                                                    }
                                                />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <div className="flex justify-end">
                                <FormField
                                    control={form.control}
                                    name="personalData"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row space-x-3 space-y-0">
                                            <div className="space-y-1 leading-none text-right">
                                                <FormLabel>
                                                    {ta(
                                                        "Descriptions.personalData",
                                                    )}
                                                </FormLabel>
                                            </div>
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex place-items-end">
                                <div className="flex-1"></div>
                                <div className="grid gap-2">
                                    <Turnstile
                                        siteKey="0x4AAAAAAAfReA6N46PHA4HD"
                                        className={cn(
                                            form.formState.errors.turnstile
                                                ? "ring-destructive ring-2"
                                                : "",
                                        )}
                                        options={{
                                            language: locale,
                                        }}
                                        onSuccess={() => {
                                            form.setValue("turnstile", true);
                                        }}
                                        onError={() => {
                                            form.setValue("turnstile", false);
                                        }}
                                    />
                                    <FormError
                                        error={
                                            form?.formState?.errors?.turnstile
                                        }
                                    />
                                    <FormError
                                        error={
                                            form?.formState?.errors
                                                ?.personalData
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                        {/* <Separator /> */}
                        <CardFooter className="flex flex-row gap-2">
                            <div className="flex-1"></div>
                            <Button
                                size="lg"
                                type="submit"
                                className="bg-blue-400 hover:bg-blue-400/90"
                            >
                                {t("apply")}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
