import { useTranslations } from "next-intl";

import { Button } from "./ui/button";
import { FormControl } from "./ui/form";
import { LuCalendar } from "react-icons/lu";
import { Calendar } from "./ui/calendar";

import { DateFormat } from "@/utils/date";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";

type Props = {
    field: any;
    placeholder?: string;
    from?: Date;
    to?: Date;
};

export default function DatePicker({
    field,
    placeholder,
    from = new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
    to = new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
}: Props) {
    const tc = useTranslations("Components");

    return (
        <Popover>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "flex w-full pl-3 text-left font-normal hover:bg-transparent hover:cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400 active:ring-2 active:ring-blue-400",
                            !field?.value && "text-muted-foreground",
                        )}
                    >
                        {field?.value ? (
                            DateFormat(field?.value?.toString())
                        ) : (
                            <span>
                                {placeholder ? placeholder : tc("selectDate")}
                            </span>
                        )}
                        <LuCalendar className="ml-auto size-4 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    fixedWeeks
                    mode="single"
                    selected={field?.value}
                    onSelect={field?.onChange}
                    captionLayout="dropdown"
                    startMonth={from}
                    endMonth={to}
                />
            </PopoverContent>
        </Popover>
    );
}
