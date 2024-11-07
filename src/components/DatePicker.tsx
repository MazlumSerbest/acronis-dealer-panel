import { useLocale, useTranslations } from "next-intl";

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
};

export default function DatePicker({ field, placeholder }: Props) {
    const tc = useTranslations("Components");

    return (
        <Popover>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "flex w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                        )}
                    >
                        {field.value ? (
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
                    initialFocus
                    fixedWeeks
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear() - 10}
                    toYear={new Date().getFullYear() + 20}
                />
            </PopoverContent>
        </Popover>
    );
}
