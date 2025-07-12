"use client";
import { useState } from "react";
import useSWR from "swr";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import CourseCard from "@/components/cards/Course";
import { useTranslations } from "next-intl";
import Loader from "@/components/loaders/Loader";

export default function LearnPage() {
    const t = useTranslations("General");
    const [panelCourses, setPanelCourses] = useState<Course[]>([]);
    const [acronisCourses, setAcronisCourses] = useState<Course[]>([]);

    //#region Fetch Data
    const { data, error, isLoading } = useSWR(`/api/course`, null, {
        revalidateOnFocus: false,
        onSuccess: (data) => {
            setPanelCourses(data.filter((c: Course) => c.category == "panel"));
            setAcronisCourses(
                data.filter((c: Course) => c.category == "acronis"),
            );
        },
    });
    //#endregion

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    return (
        <div className="xl:container flex flex-col gap-6">
            <div>
                <h3 className="text-xl font-semibold">
                    {t("partnerPanelCourses")}
                </h3>
                <p className="text-muted-foreground">
                    {t("partnerPanelCoursesDescription")}
                </p>
                {isLoading ? (
                    <div className="h-24">
                        <Loader />
                    </div>
                ) : (
                    <ScrollArea>
                        <div className="flex w-max space-x-4 py-4">
                            {panelCourses?.length > 0 ? (
                                panelCourses.map((course: Course) => {
                                    return (
                                        <CourseCard
                                            key={course.id}
                                            type={course.type}
                                            id={course.id || ""}
                                            name={course.name}
                                            description={
                                                course.shortDescription
                                            }
                                            duration={course.duration}
                                            level={course.level}
                                        />
                                    );
                                })
                            ) : (
                                <div className="flex flex-col p-4 w-72 min-h-32 gap-4 border shadow-sm hover:shadow-md rounded-lg">
                                    <div className="flex-1 flex flex-col gap-2 text-muted-foreground">
                                        <h4 className="font-semibold my-auto">
                                            {t("noCourses")}
                                        </h4>
                                    </div>
                                </div>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                )}
            </div>
            <div>
                <h3 className="text-xl font-semibold">
                    {t("acronisCloudCourses")}
                </h3>
                <p className="text-muted-foreground">
                    {t("acronisCloudCoursesDescription")}
                </p>
                {isLoading ? (
                    <div className="h-24">
                        <Loader />
                    </div>
                ) : (
                    <ScrollArea>
                        <div className="flex w-max space-x-4 py-4">
                            {acronisCourses.length > 0 ? (
                                acronisCourses.map((course: Course) => {
                                    return (
                                        <CourseCard
                                            key={course.id}
                                            id={course.id || ""}
                                            type={course.type}
                                            name={course.name}
                                            description={
                                                course.shortDescription
                                            }
                                            duration={course.duration}
                                            level={course.level}
                                        />
                                    );
                                })
                            ) : (
                                <div className="flex flex-col p-4 w-72 min-h-32 gap-4 border shadow-sm hover:shadow-md rounded-lg">
                                    <div className="flex-1 flex flex-col gap-2 text-muted-foreground">
                                        <h4 className="font-semibold my-auto">
                                            {t("noCourses")}
                                        </h4>
                                    </div>
                                </div>
                            )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}
