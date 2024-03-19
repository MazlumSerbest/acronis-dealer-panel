import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import Logo from "@/components/navigation/Logo";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Application() {
    return (
        <div className="flex flex-col h-dvh w-full place-items-center bg-zinc-100">
            <Card className="max-w-[800px] mt-8">
                <CardHeader className="flex flex-row">
                    <div className="flex-1">
                        <CardTitle>
                            <h1 className="text-3xl tracking-tight text-blue-400">
                                Application Form
                            </h1>
                        </CardTitle>
                        <CardDescription>
                            <p className="text-sm">
                                Things to do for dealership
                            </p>
                        </CardDescription>
                    </div>
                    <Logo width={40} height={40} />
                </CardHeader>
                <Separator />
                <CardContent className="flex flex-col pt-6">
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
                    <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                Is it accessible?
                            </AccordionTrigger>
                            <AccordionContent>
                                Yes. It adheres to the WAI-ARIA design pattern.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
                <Separator />
                <CardContent className="pt-6">
                    <RadioGroup defaultValue="option-one">
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="option-one"
                                id="option-one"
                            />
                            <Label htmlFor="option-one">Option One</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="option-two"
                                id="option-two"
                            />
                            <Label htmlFor="option-two">Option Two</Label>
                        </div>
                    </RadioGroup>
                    <Label>Name</Label>
                    <Input placeholder="Ex. Gen Bilgi Teknolojileri" />
                </CardContent>
                <Separator />
                <CardFooter></CardFooter>
            </Card>
        </div>
    );
}
