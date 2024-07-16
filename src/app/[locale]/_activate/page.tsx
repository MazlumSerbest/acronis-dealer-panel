"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import Logo from "@/components/navigation/Logo";
import { LuMinus, LuUser, LuUserPlus } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const applicationFormSchema = z.object({
    type: z.enum(["new", "exist"], {
        required_error: "Lütfen bu alanı doldurunuz.",
    }),
    name: z.string(),
    email: z.string().email(),
    keys: z.array(
        z.object({
            value: z.string().min(10, {
                message: "Lütfen geçerli bir lisans kodu giriniz.",
            }),
        }),
    ),
});

type ActivateFormValues = z.infer<typeof applicationFormSchema>;

const defaultValues: Partial<ActivateFormValues> = {
    type: "new",
    keys: [{ value: "" }],
};

export default function Activate() {
    const { toast } = useToast();

    const form = useForm<ActivateFormValues>({
        resolver: zodResolver(applicationFormSchema),
        defaultValues,
        mode: "onChange",
    });

    const { fields, append, remove } = useFieldArray({
        name: "keys",
        control: form.control,
    });

    function onSubmit(data: ActivateFormValues) {
        toast({
            title: "Form Data",
            description: JSON.stringify(data),
        });
    }

    return (
        <div className="flex flex-col min-h-dvh w-full place-items-center bg-zinc-100">
            <Card className="max-w-[800px] mt-8 mb-6">
                <CardHeader className="flex flex-row">
                    <div className="flex-1">
                        <CardTitle className="text-3xl tracking-tight text-blue-400">
                            Lisans Aktivasyonu
                        </CardTitle>
                        <CardDescription>
                            Lisansınızı etkinleştirmek için lütfen aşağıdaki
                            adımları takip edin.
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
                            Distinctively incubate unique systems via team
                            building intellectual capital. Rapidiously fashion
                            cross-platform data whereas.
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
                                        {/* <FormLabel>Şirket Tipi</FormLabel> */}
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
                                                                value="new"
                                                                className="sr-only"
                                                            />
                                                        </FormControl>
                                                        <Card className="h-full">
                                                            <CardHeader className="flex flex-row p-4 gap-4 items-center">
                                                                <LuUserPlus className="size-6" />
                                                                <span className="flex-1">
                                                                    Yeni Müşteri
                                                                </span>
                                                            </CardHeader>
                                                        </Card>
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem>
                                                    <FormLabel className="[&:has([data-state=checked])>div]:ring-2 !ring-blue-500 ring-offset-2 [&:has([data-state=checked])>div]:text-blue-500 cursor-pointer">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                value="exist"
                                                                className="sr-only"
                                                            />
                                                        </FormControl>
                                                        <Card className="h-full">
                                                            <CardHeader className="flex flex-row p-4 gap-4 items-center">
                                                                <LuUser className="size-6" />
                                                                <span className="flex-1">
                                                                    Varolan
                                                                    Müşteri
                                                                </span>
                                                            </CardHeader>
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

                            {form.getValues("type") === "new" && (
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Ad</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ör. Güngör Yılmaz veya DCube Yazılım Ltd. Şti."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Resmi ad.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>E-Posta</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="Ör. info@dcube.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Kayıtlı olan mail adresiniz.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div>
                                {fields.map((field, index) => (
                                    <FormField
                                        control={form.control}
                                        key={field.id}
                                        name={`keys.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel
                                                    className={cn(
                                                        index !== 0 &&
                                                            "sr-only",
                                                    )}
                                                >
                                                    Lisans Kodu
                                                </FormLabel>
                                                <FormDescription
                                                    className={cn(
                                                        index !== 0 &&
                                                            "sr-only",
                                                    )}
                                                >
                                                    Aktive etmek
                                                    istediğiniz lisans kodlarını
                                                    aşağıya giriniz. Birden
                                                    fazla kod girmek için{" "}
                                                    <Badge variant="outline">Kod Ekle</Badge>{" "}
                                                    butonuna tıklayınız.
                                                </FormDescription>
                                                <FormControl>
                                                    <div className="flex flex-row gap-2">
                                                        <Input {...field} />
                                                        {index !== 0 && (
                                                            <Button
                                                                size="icon"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    remove(
                                                                        index,
                                                                    )
                                                                }
                                                            >
                                                                <LuMinus className="size-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => append({ value: "" })}
                                >
                                    Kod Ekle
                                </Button>
                            </div>
                        </CardContent>
                        {/* <Separator /> */}
                        <CardFooter className="flex flex-row">
                            <div className="flex-1"></div>
                            <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-500"
                            >
                                Lisansı Aktive Et
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
