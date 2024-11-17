import useSWR from "swr";
import { useTranslations } from "next-intl";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { LuArrowDownCircle } from "react-icons/lu";
import { DateTimeFormat } from "@/utils/date";

type Props = {
    licenseId: string;
    trigger: React.ReactNode;
};

export function LicenseHistorySheet({ licenseId, trigger }: Props) {
    const tc = useTranslations("Components");
 
    const { data } = useSWR(`/api/admin/licenseHistory/${licenseId}`, null, {
        revalidateOnFocus: false,
    });

    return (
        <TooltipProvider>
            <Tooltip>
                <Sheet>
                    <SheetTrigger>
                        <TooltipTrigger>{trigger}</TooltipTrigger>
                    </SheetTrigger>
                    <SheetContent className="flex flex-col gap-2">
                        <SheetHeader>
                            <SheetTitle>{tc("licenseHistory")}</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-sm overflow-y-auto">
                            {data?.map((item: any, index: number) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <div className="font-bold">
                                        {tc(item.action)}
                                    </div>
                                    <div>
                                        {item.action === "activation"
                                            ? item.customer.name
                                            : item.partner.name}
                                    </div>
                                    <div className="text-muted-foreground">
                                        {DateTimeFormat(item.createdAt)}
                                    </div>
                                    <div className="text-muted-foreground">
                                        {item.createdBy}
                                    </div>
                                    {index !== data.length - 1 && (
                                        <LuArrowDownCircle
                                            strokeWidth={1}
                                            className="size-10 text-blue-500/50"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet>
                <TooltipContent>
                    <p>{tc("history")}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
