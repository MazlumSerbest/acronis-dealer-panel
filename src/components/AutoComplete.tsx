import { Fragment, useState } from "react";
import { Combobox, Transition } from "@headlessui/react";
import { BiChevronDown } from "react-icons/bi";

type Props = {
    data: ListBoxItem[];
    onChange: (value: any) => any;
    value?: any;
};

export default function AutoComplete(props: Props) {
    const [query, setQuery] = useState("");
    const data = props.data;

    const filteredData =
        query === ""
            ? data
            : data.filter((data) =>
                  data.name
                      .toLowerCase()
                      .replace(/\s+/g, "")
                      .includes(query.toLowerCase().replace(/\s+/g, "")),
              ) || [];

    return (
        <Combobox onChange={props.onChange} value={props.value}>
            <div className="relative">
                <div className="block w-full rounded-md border-0 px-3.5 py-2 text-zinc-700 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400  focus-within:ring-2 focus-within:ring-inset focus-within:ring-sky-500 sm:text-sm sm:leading-6 outline-none">
                    <Combobox.Input
                        className="w-full border-none text-sm text-zinc-700 outline-none"
                        displayValue={(item: ListBoxItem) =>
                            data.find((e) => e.id.toString() == item?.toString())
                                ?.name || ""
                        }
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <BiChevronDown
                            className="h-5 w-5 text-zinc-700"
                            aria-hidden="true"
                        />
                    </Combobox.Button>
                </div>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery("")}
                >
                    <Combobox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-zinc/5 focus:outline-none sm:text-sm">
                        {(!data.length || (filteredData?.length === 0 && query !== "")) ? (
                            <div className="relative cursor-default select-none px-4 py-2 text-zinc-700">
                                Herhangi bir kayıt bulunamadı.
                            </div>
                        ) : (
                            filteredData?.map((item: ListBoxItem) => (
                                <Combobox.Option
                                    key={item.id}
                                    value={item.id}
                                    className={({ active }) =>
                                        `relative cursor-default select-none px-3.5 py-1 ${
                                            active
                                                ? "bg-sky-600 text-white"
                                                : "text-zinc-700"
                                        }`
                                    }
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${
                                                    selected
                                                        ? "font-bold"
                                                        : "font-normal"
                                                }`}
                                            >
                                                {item.name}
                                            </span>
                                            {/* {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? 'text-white' : 'text-sky-600'
                            }`}
                          >
                            <BiCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null} */}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))
                        )}
                    </Combobox.Options>
                </Transition>
            </div>
        </Combobox>
    );
}
