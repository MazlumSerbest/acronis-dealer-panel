"use client";
import { useEffect, useState } from "react";
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
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import {
    LuArrowRight,
    LuChevronLeft,
    LuChevronRight,
    LuPlayCircle,
} from "react-icons/lu";
import Loader from "@/components/loaders/Loader";
import { useTranslations } from "next-intl";

export default function CourseLayout({
    children,
    params: { courseId, lessonId },
}: {
    children: React.ReactNode;
    params: { courseId: string; lessonId: string };
}) {
    const t = useTranslations("General");
    const [openChapter, setOpenChapter] = useState<Chapter>();
    const [currentLesson, setCurrentLesson] = useState<Lesson>();
    const [prevLessonId, setPrevLessonId] = useState<string | undefined>(
        undefined,
    );
    const [nextLessonId, setNextLessonId] = useState<string | undefined>();

    const {
        data: course,
        error,
        isLoading,
    } = useSWR(`/api/course/${courseId}`, null, {
        revalidateOnFocus: false,
    });

    useEffect(() => {
        const currentChapter = course?.chapters.find((c: Chapter) =>
            c.lessons.some((l: Lesson) => l.id == lessonId),
        );
        setOpenChapter(currentChapter);

        const currentLesson = currentChapter?.lessons.find(
            (l: Lesson) => l.id == lessonId,
        );
        setCurrentLesson(currentLesson);

        const allLessons = course?.chapters
            ?.filter((c: Chapter) => c.active)
            .flatMap((c: Chapter) => c.lessons.filter((l: Lesson) => l.active));
        setPrevLessonId(
            allLessons?.[allLessons.indexOf(currentLesson) - 1]?.id,
        );
        setNextLessonId(
            allLessons?.[allLessons.indexOf(currentLesson) + 1]?.id,
        );
    }, [course, lessonId]);

    if (!course)
        return (
            <div className="h-80">
                <Loader />
            </div>
        );
    return (
        <div className="flex-1 flex justify-center">
            <div className="grid grid-cols-3 max-w-[1200px] w-full mt-6 gap-4">
                <div className="flex flex-col col-span-3 lg:col-span-2 w-full gap-4">
                    {children}
                </div>
                <Card className="col-span-3 lg:col-span-1 w-full max-h-min overflow-auto">
                    <CardHeader className="py-3">
                        <CardTitle className="text-xl">{course.name}</CardTitle>
                        <CardDescription className="text-sm">
                            {t("currentLesson")}
                        </CardDescription>
                        <CardTitle className="text-sm">{currentLesson?.name}</CardTitle>
                        <div className="flex flex-row justify-between !mt-4">
                            <Button
                                size="sm"
                                variant="outline"
                                // className="bg-blue-400 hover:bg-blue-400/90"
                                disabled={!prevLessonId}
                                asChild={prevLessonId ? true : false}
                            >
                                <Link
                                    href={`/panel/learn/${course.id}/${prevLessonId}`}
                                    className="flex flex-row gap-2"
                                >
                                    <LuChevronLeft className="size-4" />
                                    {t("previous")}
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                // className="bg-blue-400 hover:bg-blue-400/90"
                                disabled={!nextLessonId}
                                asChild={nextLessonId ? true : false}
                            >
                                <Link
                                    href={`/panel/learn/${course.id}/${nextLessonId}`}
                                    className="flex flex-row gap-2"
                                >
                                    {t("next")}
                                    <LuChevronRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    {/* <div className="w-full">
                        <h2 className="text-2xl font-bold"></h2>
                    </div> */}
                    <Separator />
                    <Accordion
                        type="single"
                        // defaultValue={currentChapter?.id}
                        value={openChapter?.id}
                        onValueChange={(value) => {
                            setOpenChapter(
                                course.chapters.find(
                                    (c: Chapter) => c.id == value,
                                ),
                            );
                        }}
                        className="w-full"
                        collapsible
                    >
                        {course.chapters
                            .filter((c: Chapter) => c.active)
                            .map((chapter: Chapter, index: number) => (
                                <AccordionItem
                                    key={index}
                                    value={chapter.id || ""}
                                    className="px-2"
                                >
                                    <AccordionTrigger className="font-semibold !no-underline px-4">
                                        {chapter.name}
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y divide-y gap-2 p-0">
                                        <div></div>
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
                                                            href={`/panel/learn/${courseId}/${lesson.id}`}
                                                            className={cn(
                                                                "flex w-full place-items-start hover:text-blue-400 text-muted-foreground gap-2",
                                                                lesson.id ==
                                                                    lessonId
                                                                    ? "*:text-blue-400"
                                                                    : "*:text-muted-foreground",
                                                            )}
                                                        >
                                                            <LuPlayCircle className="size-5 group-hover:text-blue-400" />
                                                            <span className="flex-1">
                                                                {lesson.name}
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
        </div>
    );
}
