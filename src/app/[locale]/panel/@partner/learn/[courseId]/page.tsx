"use client";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useTranslations } from "next-intl";
import { LuChevronLeft, LuCirclePlay } from "react-icons/lu";
import Loader from "@/components/loaders/Loader";

export default function CourseDetail({
    params,
}: {
    params: { courseId: string };
}) {
    const t = useTranslations("General");
    const tc = useTranslations("Components.CourseCard");
    const [chapterCount, setChapterCount] = useState(0);
    const [lessonCount, setLessonCount] = useState(0);

    //#region Fetch Data
    const {
        data: course,
        error,
        isLoading,
    } = useSWR(`/api/course/${params.courseId}`, null, {
        revalidateOnFocus: false,
        onSuccess: (data) => {
            if (data?.type === "standard") {
                let chapters = 0;
                let lessons = 0;
                data?.chapters?.forEach((c: Chapter) => {
                    if (c.active) {
                        chapters++;
                        lessons += c.lessons.filter(
                            (l: Lesson) => l.active,
                        ).length;
                    }
                });
                setChapterCount(chapters);
                setLessonCount(lessons);
            }
        },
    });
    //#endregion

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    if (isLoading)
        return (
            <div className="h-80">
                <Loader />
            </div>
        );
    return (
        <div className="xl:container flex flex-col gap-4">
            <div>
                <Button
                    size="sm"
                    variant="link"
                    className="text-sm text-foreground underline-foreground p-0"
                    asChild
                >
                    <Link href={`/panel/learn`}>
                        <LuChevronLeft className="size-4 mr-1" />
                        {t("backToCourses")}
                    </Link>
                </Button>
            </div>

            {course?.type === "standard" ? (
                <div className="grid grid-cols-3 max-w-[1200px] w-full gap-4">
                    <div className="flex flex-col col-span-3 lg:col-span-2 w-full gap-4">
                        <h2 className="text-2xl font-bold">{course.name}</h2>
                        <p className="text-muted-foreground px-2">
                            {course.shortDescription}
                        </p>
                        <div className="flex flex-row justify-between text-muted-foreground px-2">
                            <p>{course.duration}</p>
                            <p>{course.level}</p>
                        </div>
                        <Button
                            className="bg-blue-400 hover:bg-blue-400/90"
                            asChild
                        >
                            <Link
                                href={`/panel/learn/${course.id}/${course?.chapters[0].lessons[0].id}`}
                            >
                                {t("startCourse")}
                            </Link>
                        </Button>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("description")}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground">
                                {course.description}
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="col-span-3 lg:col-span-1 w-full max-h-min overflow-auto">
                        <CardHeader className="items-center">
                            <CardTitle>{t("chapters")}</CardTitle>
                            <CardDescription className="text-sm">
                                {t("infoCounts", {
                                    chapterCount,
                                    lessonCount,
                                })}
                            </CardDescription>
                        </CardHeader>
                        <Separator />
                        <Accordion type="single" collapsible className="w-full">
                            {course.chapters
                                .filter((c: Chapter) => c.active)
                                .map((chapter: Chapter, index: number) => (
                                    <AccordionItem
                                        key={index}
                                        value={chapter.id || ""}
                                        className="px-2"
                                    >
                                        <AccordionTrigger className="font-semibold no-underline! px-4">
                                            {chapter.name}
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y divide-y gap-2 p-0">
                                            {chapter.lessons
                                                .filter((l: Lesson) => l.active)
                                                .map(
                                                    (
                                                        lesson: Lesson,
                                                        index: number,
                                                    ) => (
                                                        <Button
                                                            key={index}
                                                            variant="ghost"
                                                            className="p-6"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/panel/learn/${course.id}/${lesson.id}`}
                                                                className="flex w-full place-items-start hover:text-blue-400 text-muted-foreground gap-2"
                                                            >
                                                                <LuCirclePlay className="size-5 group-hover:text-blue-400" />
                                                                <span className="flex-1">
                                                                    {
                                                                        lesson.name
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </Button>
                                                    ),
                                                )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                        </Accordion>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    <iframe
                        className="col-span-3 lg:col-span-2 w-full min-h-[450px] rounded-xl"
                        src={course?.link}
                        title={course?.name}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                    ></iframe>

                    <Card className="col-span-3 lg:col-span-1">
                        <CardHeader className="py-3">
                            <CardTitle className="text-xl">
                                {course?.name}
                            </CardTitle>
                            <CardDescription className="text-sm">
                                {course.shortDescription}
                            </CardDescription>
                        </CardHeader>
                        <Separator />
                        <CardContent className="font-semibold text-md mt-4">
                            {t("type") + ": "}
                            <span className="text-muted-foreground font-normal">
                                {tc("singleVideoCourse")}
                            </span>
                        </CardContent>
                        <CardContent className="font-semibold text-md">
                            {t("category") + ": "}
                            <span className="text-muted-foreground font-normal">
                                {t(course.category)}
                            </span>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3 max-h-fit">
                        <CardHeader>
                            <CardTitle>{t("description")}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground">
                            {course?.description}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
