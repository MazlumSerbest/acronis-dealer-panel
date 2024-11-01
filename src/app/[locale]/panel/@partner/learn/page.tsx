"use client";
import { useState } from "react";
import useSWR from "swr";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import CourseCard from "@/components/CourseCard";
import { useTranslations } from "next-intl";
import Loader from "@/components/loaders/Loader";

export default function LearnPage() {
    const t = useTranslations("General");
    const [courses, setCourses] = useState<Course[]>([]);

    //#region Fetch Data
    const { data, error, isLoading } = useSWR(`/api/admin/course`, null, {
        revalidateOnFocus: false,
        onSuccess: (data) => {
            setCourses(data.filter((c: Course) => c.active));
        },
    });
    //#endregion

    if (error) return <div>{t("failedToLoad")}</div>;
    return (
        <div>
            <div className="flex flex-col pt-6 gap-8">
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
                        <ScrollArea className="">
                            <div className="flex w-max space-x-4 p-4">
                                {courses
                                    ?.filter(
                                        (c: Course) => c.category == "panel",
                                    )
                                    .map((course: Course) => {
                                        return (
                                            <CourseCard
                                                key={course.id}
                                                id={course.id || ""}
                                                name={course.name}
                                                description={
                                                    course.shortDescription
                                                }
                                                duration={course.duration}
                                                level={course.level}
                                            />
                                        );
                                    })}
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
                        <ScrollArea className="">
                            <div className="flex w-max space-x-4 p-4">
                                {courses
                                    ?.filter(
                                        (c: Course) => c.category == "acronis",
                                    )
                                    .map((course: Course) => {
                                        return (
                                            <CourseCard
                                                key={course.id}
                                                id={course.id || ""}
                                                name={course.name}
                                                description={
                                                    course.shortDescription
                                                }
                                                duration={course.duration}
                                                level={course.level}
                                            />
                                        );
                                    })}
                            </div>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    )}
                </div>
            </div>
        </div>
    );
}
