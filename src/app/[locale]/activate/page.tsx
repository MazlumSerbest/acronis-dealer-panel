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
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import Logo from "@/components/navigation/Logo";
import { LuUser, LuUserPlus } from "react-icons/lu";

const applicationFormSchema = z.object({
    type: z.enum(["new", "exist"], {
        required_error: "Lütfen bu alanı doldurunuz.",
    }),
    name: z.string(),
    email: z.string().email(),
    key: z.string(),
});

type ActivateFormValues = z.infer<typeof applicationFormSchema>;

const defaultValues: Partial<ActivateFormValues> = {
    type: "new",
};

export default function Activate() {
    const { toast } = useToast();

    const form = useForm<ActivateFormValues>({
        resolver: zodResolver(applicationFormSchema),
        defaultValues,
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <FormField
                                    control={form.control}
                                    name="key"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>Lisans Key</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ör. 1234567890"
                                                    maxLength={11}
                                                    minLength={10}
                                                    {...field}
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
