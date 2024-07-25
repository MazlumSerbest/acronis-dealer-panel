import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandList,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { LuCheck, LuChevronsUpDown } from "react-icons/lu";
import { cn } from "@/lib/utils";

type Props = {
    name: string;
    data: ListBoxItem[];
    form: any;
    field: any;
    value?: string | number | null | undefined;
    placeholder?: string;
    inputPlaceholder?: string;
    emptyText?: string;
};

export default function Combobox({
    name,
    data,
    form,
    field,
    value,
    placeholder = "Select",
    inputPlaceholder = "Search...",
    emptyText = "No data found.",
}: Props) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "flex w-full justify-between",
                        !field.value && "text-muted-foreground",
                    )}
                >
                    <span className="flex-1 text-left">
                        {field.value
                            ? data.find((i) => i.id == field.value)?.name
                            : placeholder}
                    </span>
                    <LuChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
                <Command>
                    <CommandInput placeholder={inputPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {data.map((i) => (
                                <CommandItem
                                    key={i.id}
                                    value={i.name}
                                    className="text-zinc-800"
                                    onSelect={() => {
                                        form.setValue(name, i.id);
                                        setOpen(false);
                                    }}
                                >
                                    {i.name}
                                    <LuCheck
                                        className={cn(
                                            "ml-auto size-4",
                                            i.id == field.value
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
