"use client";
import useSWR from "swr";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import CourseCard from "@/components/CourseCard";
import { useTranslations } from "next-intl";

export default function LearnPage() {
    const t = useTranslations("General");

    //#region Fetch Data
    const { data: courses, error } = useSWR(`/api/admin/course`, null, {
        revalidateOnFocus: false,
    });
    //#endregion

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
                    <ScrollArea className="">
                        <div className="flex w-max space-x-4 p-4">
                            {courses
                                ?.filter((c: Course) => c.category == "panel")
                                .map((course: Course) => {
                                    return (
                                        <CourseCard
                                            id={course.id}
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
                </div>
                <div>
                    <h3 className="text-xl font-semibold">
                        {t("acronisCloudCourses")}
                    </h3>
                    <p className="text-muted-foreground">
                        {t("acronisCloudCoursesDescription")}
                    </p>
                    <ScrollArea className="">
                        <div className="flex w-max space-x-4 p-4">
                            {courses
                                ?.filter((c: Course) => c.category == "acronis")
                                .map((course: Course) => {
                                    return (
                                        <CourseCard
                                            id={course.id}
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
                </div>
            </div>
        </div>
    );
}
