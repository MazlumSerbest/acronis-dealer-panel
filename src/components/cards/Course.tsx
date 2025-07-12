import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type Props = {
    id: string;
    type: "standard" | "video";
    name: string;
    description: string;
    duration?: string;
    level?: string;
};

export default function CourseCard({
    id,
    type,
    name,
    description,
    duration,
    level,
}: Props) {
    const t = useTranslations("Components.CourseCard");

    return (
        <div className="flex flex-col p-4 w-72 min-h-52 gap-4 border shadow-sm hover:shadow-md rounded-lg ">
            <div className="flex-1 flex flex-col gap-2">
                <h4 className="text-lg font-semibold">{name}</h4>
                <p className="flex-1 text-sm text-muted-foreground mb-2">
                    {description}
                </p>
                {type === "standard" ? (
                    <div className="flex flex-row justify-between">
                        <p className="text-sm text-muted-foreground">
                            {duration}
                        </p>
                        <p className="text-sm text-muted-foreground">{level}</p>
                    </div>
                ) : (
                    <div className="flex flex-row justify-center">
                        <p className="text-sm text-muted-foreground">
                            {t("singleVideoCourse")}
                        </p>
                    </div>
                )}
            </div>
            <Button className="bg-blue-400 hover:bg-blue-400/90" asChild>
                <Link href={`/panel/learn/${id}`}>
                    {type === "standard" ? t("startCourse") : t("watchVideo")}
                </Link>
            </Button>
        </div>
    );
}
