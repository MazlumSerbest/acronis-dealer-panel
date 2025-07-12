"use client";
import { useState } from "react";
import useSWR from "swr";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import CourseCard from "@/components/cards/Course";
import { useTranslations } from "next-intl";
import Loader from "@/components/loaders/Loader";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function LearnPage() {
    const t = useTranslations("General");
    const [panelCourses, setPanelCourses] = useState<Course[]>();
    const [acronisCourses, setAcronisCourses] = useState<Course[]>();

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
        <div className="xl:container p-4 lg:p-0 flex flex-col gap-6">
            <div>
                <h3 className="text-xl font-semibold">
                    {t("partnerPanelCourses")}
                </h3>
                <p className="text-muted-foreground">
                    {t("partnerPanelCoursesDescription")}
                </p>
                {isLoading || !panelCourses ? (
                    <div className="h-24">
                        <Loader />
                    </div>
                ) : (
                    <Carousel
                        className="w-full"
                        opts={{
                            align: "center",
                            // loop: true,
                            dragFree: true,
                        }}
                    >
                        <CarouselContent className="py-4">
                            {panelCourses?.length > 0 ? (
                                panelCourses.map((course: Course) => {
                                    return (
                                        <CarouselItem className="sm:basis-1/2 lg:basis-1/3 xl:basis-26/100">
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
                                        </CarouselItem>
                                    );
                                })
                            ) : (
                                <CarouselItem className="sm:basis-1/2 lg:basis-1/3 xl:basis-26/100">
                                    <AspectRatio
                                        ratio={4 / 2}
                                        className="flex flex-col p-4 gap-4 border shadow-sm rounded-lg"
                                    >
                                        <div className="flex-1 flex flex-col gap-2 text-muted-foreground">
                                            <h4 className="font-semibold my-auto">
                                                {t("noCourses")}
                                            </h4>
                                        </div>
                                    </AspectRatio>
                                </CarouselItem>
                            )}
                        </CarouselContent>

                        <div className="flex gap-2 items-center">
                            <CarouselPrevious className="relative size-10 top-auto bottom-auto left-0 right-0 !translate-0" />
                            <CarouselNext className="relative size-10 top-auto bottom-auto left-0 right-0 !translate-0" />
                            <p className="text-center text-muted-foreground text-sm ml-5">
                                {t("totalCourses", {
                                    count: panelCourses?.length,
                                })}
                            </p>
                        </div>
                    </Carousel>
                )}
            </div>
            <div>
                <h3 className="text-xl font-semibold">
                    {t("acronisCloudCourses")}
                </h3>
                <p className="text-muted-foreground">
                    {t("acronisCloudCoursesDescription")}
                </p>
                {isLoading || !acronisCourses ? (
                    <div className="h-24">
                        <Loader />
                    </div>
                ) : (
                    <Carousel
                        className="w-full"
                        opts={{
                            align: "center",
                            // loop: true,
                            dragFree: true,
                        }}
                    >
                        <CarouselContent className="py-4">
                            {acronisCourses?.length > 0 ? (
                                acronisCourses.map((course: Course) => {
                                    return (
                                        <CarouselItem className="sm:basis-1/2 lg:basis-1/3 xl:basis-26/100">
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
                                        </CarouselItem>
                                    );
                                })
                            ) : (
                                <CarouselItem>
                                    <AspectRatio
                                        ratio={4 / 2}
                                        className="flex flex-col p-4 w-72 gap-4 border shadow-sm rounded-lg"
                                    >
                                        <div className="flex-1 flex flex-col gap-2 text-muted-foreground">
                                            <h4 className="font-semibold my-auto">
                                                {t("noCourses")}
                                            </h4>
                                        </div>
                                    </AspectRatio>
                                </CarouselItem>
                            )}
                        </CarouselContent>

                        <div className="flex gap-2 items-center">
                            <CarouselPrevious className="relative size-10 top-auto bottom-auto left-0 right-0 !translate-0" />
                            <CarouselNext className="relative size-10 top-auto bottom-auto left-0 right-0 !translate-0" />
                            <p className="text-center text-muted-foreground text-sm ml-5">
                                {t("totalCourses", {
                                    count: acronisCourses?.length,
                                })}
                            </p>
                        </div>
                    </Carousel>
                )}
            </div>
        </div>
    );
}
