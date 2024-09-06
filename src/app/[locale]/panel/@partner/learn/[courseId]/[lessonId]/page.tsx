"use client";
import useSWR from "swr";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import Loader from "@/components/loaders/Loader";
import { useTranslations } from "next-intl";

export default function LessonPage({
    params,
}: {
    params: { courseId: string; lessonId: string };
}) {
    const t = useTranslations("General");

    //#region Fetch Data
    const { data: lesson, error } = useSWR(
        `/api/admin/lesson/${params.lessonId}`,
        null,
        {
            revalidateOnFocus: false,
        },
    );
    //#endregion

    if (error) return <div>{t("failedToLoad")}</div>;
    if (!lesson)
        return (
            <div className="h-80">
                <Loader />
            </div>
        );
    return (
        <div className="flex flex-col gap-4">
            <iframe
                className="w-full min-h-[450px] rounded-xl"
                src={lesson?.link}
                title={lesson?.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
            ></iframe>

            <Card>
                <CardHeader>
                    <CardTitle>{t("description")}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    {lesson?.description}
                </CardContent>
            </Card>
        </div>
    );
}
