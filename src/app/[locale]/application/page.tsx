"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";

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

import Logo from "@/components/navigation/Logo";
import { cities } from "@/lib/constants";
import { Combobox } from "@/components/Combobox";
import { LuBuilding2, LuUser } from "react-icons/lu";

const applicationFormSchema = z.object({
    type: z.enum(["business", "person"], {
        required_error: "Lütfen şirket tipi seçiniz.",
    }),
    name: z.string(),
    taxNo: z
        .string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        })
        .min(10, { message: "Must be 10 or 11 characters long" })
        .max(11, { message: "Must be 10 or 11 characters long" }),
    taxOffice: z.number(),
    email: z.string().email(),
    cellPhone: z.string().length(10, { message: "Must be a valid number" }),
    phone: z.string().length(10, { message: "Must be a valid number" }),
    fax: z.string().length(10, { message: "Must be a valid number" }),
    address: z.string(),
    postalCode: z
        .string()
        .length(5, { message: "Must be exactly 5 characters long" }),
    city: z.number(),
    district: z.string(),
    file: z.instanceof(File),
    signature: z.instanceof(File),
});

type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<ApplicationFormValues> = {
    type: "business",
};

export default function Application() {
    const { toast } = useToast();

    const form = useForm<ApplicationFormValues>({
        resolver: zodResolver(applicationFormSchema),
        defaultValues,
    });

    function onSubmit(data: ApplicationFormValues) {
        toast({
            title: "Form Data",
            description: JSON.stringify(data),
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
                            Başvuru Formu
                        </CardTitle>
                        <CardDescription>
                            Bayi olmak için yapılması gerekenler.
                        </CardDescription>
                    </div>
                    <Logo width={40} height={40} />
                </CardHeader>
                
                <Separator />

                <CardContent className="flex flex-col p-6 gap-4">
                    <ol className="list-decimal list-inside divide-y divide-zinc-200 text-sm text-justify *:py-2">
                        <li>
                            Distinctively incubate unique systems via team
                            building intellectual capital. Rapidiously fashion
                            cross-platform data whereas.
                        </li>
                        <li>
                            Objectively envisioneer leading-edge scenarios
                            vis-a-vis distributed niche markets. Credibly
                            restore e-business value rather than premium
                            solutions. Efficiently seize covalent e-services
                            vis-a-vis.
                        </li>
                        <li>
                            Distinctively embrace frictionless convergence
                            without B2C portals. Dramatically restore
                            maintainable portals vis-a-vis state of the art
                            methods of empowerment. Appropriately synergize
                            next-generation infrastructures and excellent
                            synergy. Authoritatively cultivate.
                        </li>
                        <li>
                            Globally impact progressive channels and installed
                            base innovation. Enthusiastically leverage.
                        </li>
                    </ol>
                </CardContent>

                <Separator />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="flex flex-col gap-6 p-6">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Şirket Tipi</FormLabel>
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
                                                                    İşletme
                                                                </span>
                                                            </CardHeader>
                                                            <Separator />
                                                            <CardContent className="flex flex-col py-2 px-4 gap-2">
                                                                <p className="text-primary">
                                                                    Gerekli
                                                                    Belgeler
                                                                </p>
                                                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                                    <li>
                                                                        Sözleşme
                                                                    </li>
                                                                    <li>
                                                                        Vergi
                                                                        Levhası
                                                                    </li>
                                                                    <li>
                                                                        İmza
                                                                        Sirküsü
                                                                    </li>
                                                                    <li>
                                                                        Sicil
                                                                        Gazetesi
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
                                                                    Şahıs
                                                                </span>
                                                            </CardHeader>
                                                            <Separator />
                                                            <CardContent className="flex flex-col py-2 px-4 gap-2">
                                                                <p className="text-primary">
                                                                    Gerekli
                                                                    Belgeler
                                                                </p>
                                                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                                    <li>
                                                                        Sözleşme
                                                                    </li>
                                                                    <li>
                                                                        Vergi
                                                                        Levhası
                                                                    </li>
                                                                    <li>
                                                                        İmza
                                                                        Sirküsü
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Şirket Adı</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ör. Gen Bilgi Teknolojileri Sanayi ve Ticaret Ltd. Şti."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Şirketinizin resmi adı.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="taxNo"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Vergi No</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ör. 1234567890"
                                                    maxLength={11}
                                                    minLength={10}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Vergi no veya TC Kimlik No.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="taxOffice"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Vergi Dairesi</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    name="taxOffice"
                                                    data={taxOffices}
                                                    form={form}
                                                    field={field}
                                                    placeholder="Seçiniz"
                                                    inputPlaceholder="Arama Yap..."
                                                    emptyText="Herhangi bir sonuç yok."
                                                />
                                            </FormControl>
                                            {/* <FormDescription>
                                                Vergi no veya TC Kimlik No.
                                            </FormDescription> */}
                                            <FormMessage />
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
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Ör. test@gmail.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Vergi no veya TC Kimlik No.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="cellPhone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Mobil</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    placeholder="Ör. 5051234567"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Vergi no veya TC Kimlik No.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Telefon</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    placeholder="Ör. 2121234567"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Vergi no veya TC Kimlik No.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fax"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Fax</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    placeholder="Ör. 2121234567"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Vergi no veya TC Kimlik No.
                                            </FormDescription>
                                            <FormMessage />
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
                                        <FormLabel>Adres</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Şirketinizin resmi kayıtlı adresi.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>İl</FormLabel>
                                            <FormControl>
                                                <Combobox
                                                    name="city"
                                                    data={citiesList}
                                                    form={form}
                                                    field={field}
                                                    // value={field.value}
                                                    placeholder="Seçiniz"
                                                    inputPlaceholder="Arama Yap..."
                                                    emptyText="Herhangi bir sonuç yok."
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Şirketinizin resmi kayıtlı ili.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="district"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>İlçe</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ör. Karşıyaka"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Şirketinizin resmi kayıtlı
                                                ilçesi.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="postalCode"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Posta Kodu</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ör. 12345"
                                                    maxLength={5}
                                                    minLength={5}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Şirketinizin resmi kayıtlı posta
                                                kodu.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            {/* Files */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="file"
                                    render={({
                                        field: {
                                            value,
                                            onChange,
                                            ...fieldProps
                                        },
                                    }) => (
                                        <FormItem>
                                            <FormLabel>Sözleşme</FormLabel>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="signature"
                                    render={({
                                        field: {
                                            value,
                                            onChange,
                                            ...fieldProps
                                        },
                                    }) => (
                                        <FormItem>
                                            <FormLabel>İmza Sirküsü</FormLabel>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="signature"
                                    render={({
                                        field: {
                                            value,
                                            onChange,
                                            ...fieldProps
                                        },
                                    }) => (
                                        <FormItem>
                                            <FormLabel>Vergi Levhası</FormLabel>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {form.getValues("type") === "business" && (
                                    <FormField
                                        control={form.control}
                                        name="signature"
                                        render={({
                                            field: {
                                                value,
                                                onChange,
                                                ...fieldProps
                                            },
                                        }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Sicil Gazetesi
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...fieldProps}
                                                        type="file"
                                                        accept="image/*,.pdf"
                                                        placeholder="test"
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </CardContent>
                        {/* <Separator /> */}
                        <CardFooter className="flex flex-row">
                            <div className="flex-1"></div>
                            <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-500"
                            >
                                Başvuru Yap
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
