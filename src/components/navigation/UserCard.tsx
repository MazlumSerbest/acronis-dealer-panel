// import { useSession, signOut } from "next-auth/react";

import { useDisclosure } from "@nextui-org/react";
import { Avatar, AvatarIcon } from "@nextui-org/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from "@nextui-org/button";
import { useTranslations } from "next-intl";

import { BiLogOut } from "react-icons/bi";

export default function UserCard() {
    const { isOpen, onClose, onOpenChange } = useDisclosure();
    const t = useTranslations("General");
    // const { data: session } = useSession();
    const session = {
        user: {
            name: "Administrator",
            email: "test@gmail.com",
        },
    };
    
    return (
        <>
            {session?.user ? (
                <div className="flex gap-2 items-center">
                    <Avatar
                        icon={<AvatarIcon />}
                        classNames={{
                            base: "bg-blue-200",
                            icon: "text-blue-400",
                        }}
                    />
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-bold text-blue-400">
                            {session?.user?.name}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                            {session?.user?.email}
                        </p>
                    </div>
                    <Popover
                        placement="top"
                        isOpen={isOpen}
                        onOpenChange={onOpenChange}
                    >
                        <PopoverTrigger>
                            <Button isIconOnly variant="light">
                                <BiLogOut className="text-2xl text-zinc-400" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="flex flex-col gap-2 p-3">
                            <h2 className="text-lg font-semibold text-zinc-600">
                                {t("logout")}
                            </h2>
                            <p className="text-sm text-zinc-500 pb-2">
                                {t("logoutMessage")}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="bordered"
                                    color="default"
                                    onPress={onClose}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    variant="solid"
                                    color="danger"
                                    className="bg-red-600"
                                    // onClick={() => signOut()}
                                >
                                    {t("logout")}
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            ) : (
                <div className="animate-pulse flex gap-2 items-center">
                    <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                    <div className="flex-1 flex flex-col min-w-0 gap-1">
                        <div className="h-4 bg-slate-200 rounded"></div>
                        <div className="h-3 bg-slate-200 rounded"></div>
                    </div>
                    <div className="rounded bg-slate-200 h-8 w-8"></div>
                </div>
            )}
        </>
    );
}
