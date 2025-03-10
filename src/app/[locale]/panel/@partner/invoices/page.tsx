"use client";
import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

import Skeleton, { DefaultSkeleton } from "@/components/loaders/Skeleton";
import { LuChevronsUpDown, LuEye, LuFileText } from "react-icons/lu";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    DoubleArrowLeftIcon,
    DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { currencies } from "@/lib/constants";
import { DateFormat } from "@/utils/date";
import { PriceFormat } from "@/utils/price";
import { cn } from "@/lib/utils";
import useUserStore from "@/store/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvoicesPage() {
    const t = useTranslations("General");
    const tc = useTranslations("Components");
    const { user: currentUser } = useUserStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [paymentStatus, setPaymentStatus] = useState("");
    const [sort, setSort] = useState("-issue_date");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>();

    const {
        data: invoices,
        error,
        isLoading,
    } = useSWR(
        currentUser?.partner?.parasutId
            ? `/api/parasut/salesInvoices/contact/${currentUser?.partner?.parasutId}?currentPage=${currentPage}&paymentStatus=${paymentStatus}&sort=${sort}`
            : null,
        null,
        {
            revalidateOnFocus: false,
        },
    );

    const {
        data: selectedInvoice,
        error: selectedInvoiceError,
        isLoading: selectedInvoiceLoading,
        mutate: selectedInvoiceMutate,
    } = useSWR(
        selectedInvoiceId
            ? `/api/parasut/salesInvoices/${selectedInvoiceId}`
            : null,
        null,
        {
            revalidateOnFocus: false,
            onSuccess: (data) => {
                console.log(data);
            },
        },
    );

    if (error)
        return (
            <div className="flex min-h-24 justify-center items-center">
                {t("failedToLoad")}
            </div>
        );
    return (
        <>
            <div className="flex justify-between items-center">
                <div className="relative w-96 flex-1">
                    {/*  <MagnifyingGlassIcon className="absolute left-2 top-2 size-5 text-muted-foreground" />
                    <Input
                        placeholder={tc("searchPlaceholder")}
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />*/}
                </div>
                <Select
                    value={paymentStatus}
                    onValueChange={(status) => {
                        if (status === "all") setPaymentStatus("");
                        else setPaymentStatus(status);
                        setCurrentPage(1);
                    }}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder={t("paymentStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("all")}</SelectItem>
                        <SelectItem value="overdue">
                            <Badge variant="destructive">{t("overdue")}</Badge>
                        </SelectItem>
                        <SelectItem value="not_due">
                            <Badge className="bg-yellow-500 hover:bg-yellow-500/90">
                                {t("unpaid")}
                            </Badge>
                        </SelectItem>
                        <SelectItem value="paid">
                            <Badge className="bg-green-600 hover:bg-green-600/90">
                                {t("paid")}
                            </Badge>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("invoiceNo")}</TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="-ml-4"
                                    onClick={() =>
                                        setSort(
                                            sort === "-issue_date"
                                                ? "issue_date"
                                                : "-issue_date",
                                        )
                                    }
                                >
                                    {t("issueDate")}
                                    <LuChevronsUpDown className="size-4 ml-2" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="-ml-4"
                                    onClick={() =>
                                        setSort(
                                            sort === "-due_date"
                                                ? "due_date"
                                                : "-due_date",
                                        )
                                    }
                                >
                                    {t("dueDate")}
                                    <LuChevronsUpDown className="size-4 ml-2" />
                                </Button>
                            </TableHead>
                            <TableHead className="truncate">
                                {t("paymentStatus")}
                            </TableHead>
                            <TableHead className="text-right">
                                {t("netTotal")}
                            </TableHead>
                            <TableHead className="flex items-center justify-end -mr-4">
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        setSort(
                                            sort === "-remaining"
                                                ? "remaining"
                                                : "-remaining",
                                        )
                                    }
                                >
                                    {t("remaining")}
                                    <LuChevronsUpDown className="size-4 ml-2" />
                                </Button>
                            </TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading
                            ? Array.from({ length: 25 }).map((_, i) => (
                                  <TableRow
                                      key={i}
                                      className="odd:bg-zinc-100/50"
                                  >
                                      {Array.from({ length: 6 }).map((_, i) => (
                                          <TableCell key={i}>
                                              <Skeleton>
                                                  <div className="rounded-sm bg-slate-200 w-full h-5"></div>
                                              </Skeleton>
                                          </TableCell>
                                      ))}
                                  </TableRow>
                              ))
                            : invoices?.data?.map((invoice: ParasutInvoice) => (
                                  <TableRow
                                      key={invoice.id}
                                      className="odd:bg-zinc-100/50"
                                  >
                                      <TableCell className="font-medium">
                                          {invoice.attributes.invoice_no || "-"}
                                      </TableCell>
                                      <TableCell>
                                          {DateFormat(
                                              invoice.attributes.issue_date,
                                          )}
                                      </TableCell>
                                      <TableCell>
                                          {DateFormat(
                                              invoice.attributes.due_date,
                                          )}
                                      </TableCell>
                                      <TableCell>
                                          <Badge
                                              variant={
                                                  invoice.attributes
                                                      .payment_status ===
                                                  "overdue"
                                                      ? "destructive"
                                                      : "default"
                                              }
                                              className={cn(
                                                  invoice.attributes
                                                      .payment_status === "paid"
                                                      ? "bg-green-600 hover:bg-green-600/90"
                                                      : invoice.attributes
                                                            .payment_status ===
                                                        "unpaid"
                                                      ? "bg-yellow-500 hover:bg-yellow-500/90"
                                                      : "",
                                              )}
                                          >
                                              {t(
                                                  invoice.attributes
                                                      .payment_status,
                                              )}
                                          </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                          {invoice.attributes.net_total
                                              ? `${PriceFormat(
                                                    invoice.attributes
                                                        .net_total,
                                                )} ${
                                                    currencies.find(
                                                        (c) =>
                                                            c.key ===
                                                            invoice.attributes
                                                                .currency,
                                                    )?.symbol
                                                }`
                                              : "-"}
                                      </TableCell>
                                      <TableCell className="text-right">
                                          {invoice.attributes.remaining
                                              ? `${PriceFormat(
                                                    invoice.attributes
                                                        .remaining,
                                                )} ${
                                                    currencies.find(
                                                        (c) =>
                                                            c.key ===
                                                            invoice.attributes
                                                                .currency,
                                                    )?.symbol
                                                }`
                                              : "-"}
                                      </TableCell>
                                      <TableCell className="text-right">
                                          <Tooltip>
                                              <TooltipTrigger>
                                                  <LuEye
                                                      className="size-4 text-muted-foreground cursor-pointer hover:text-blue-500 active:text-blue-500/60"
                                                      onClick={() => {
                                                          setSelectedInvoiceId(
                                                              invoice.id,
                                                          );
                                                          setDrawerOpen(true);
                                                      }}
                                                  />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                  <p>{t("showInvoice")}</p>
                                              </TooltipContent>
                                          </Tooltip>
                                      </TableCell>
                                  </TableRow>
                              ))}
                        {invoices?.data?.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="h-24 text-center"
                                >
                                    {tc("noResults")}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm font-medium">
                    {tc("totalRows", {
                        length: invoices?.meta?.total_count || 0,
                    })}
                </div>

                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium sr-only lg:not-sr-only">
                            {tc("rowsPerPage")}: 25
                        </p>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        {`${tc("page")} ${invoices?.meta?.current_page || 0}/${
                            invoices?.meta?.total_pages || 0
                        }`}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden size-8 p-0 lg:flex"
                            onClick={() => {
                                if (currentPage > 1) setCurrentPage(1);
                            }}
                            disabled={currentPage <= 1}
                        >
                            <span className="sr-only">
                                {tc("goToFirstPage")}
                            </span>
                            <DoubleArrowLeftIcon className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8 p-0"
                            onClick={() => {
                                if (currentPage > 1)
                                    setCurrentPage(currentPage - 1);
                            }}
                            disabled={currentPage <= 1}
                        >
                            <span className="sr-only">
                                {tc("goToPreviousPage")}
                            </span>
                            <ChevronLeftIcon className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="size-8 p-0"
                            onClick={() => {
                                if (currentPage < invoices?.meta.total_pages)
                                    setCurrentPage(currentPage + 1);
                            }}
                            disabled={
                                invoices?.meta?.current_page >=
                                invoices?.meta?.total_pages
                            }
                        >
                            <span className="sr-only">
                                {tc("goToNextPage")}
                            </span>
                            <ChevronRightIcon className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden size-8 p-0 lg:flex"
                            onClick={() =>
                                setCurrentPage(invoices?.meta?.total_pages)
                            }
                            disabled={
                                currentPage >= invoices?.meta?.total_pages
                            }
                        >
                            <span className="sr-only">
                                {tc("goToLastPage")}
                            </span>
                            <DoubleArrowRightIcon className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent>
                    <div className="max-h-2/3 overflow-y-auto">
                        <div className="container pb-4">
                            {selectedInvoiceLoading ? (
                                <Skeleton>
                                    <DefaultSkeleton className="h-80 mt-4" />
                                </Skeleton>
                            ) : (
                                <>
                                    <DrawerHeader className="flex flex-row items-center gap-4 px-0 mb-2">
                                        <LuFileText className="size-10 text-muted-foreground" />

                                        <div className="flex-1 flex flex-col gap-1">
                                            <DrawerTitle className="flex justify-between text-xl">
                                                <div>{t("invoiceDetail")}</div>

                                                <div className="flex items-center space-x-2">
                                                    <Badge
                                                        variant={
                                                            selectedInvoice
                                                                ?.data
                                                                ?.attributes
                                                                ?.payment_status ===
                                                            "overdue"
                                                                ? "destructive"
                                                                : "default"
                                                        }
                                                        className={cn(
                                                            selectedInvoice
                                                                ?.data
                                                                ?.attributes
                                                                ?.payment_status ===
                                                                "paid"
                                                                ? "bg-green-600 hover:bg-green-600/90"
                                                                : selectedInvoice
                                                                      ?.data
                                                                      ?.attributes
                                                                      ?.payment_status ===
                                                                  "unpaid"
                                                                ? "bg-yellow-500 hover:bg-yellow-500/90"
                                                                : "",
                                                        )}
                                                    >
                                                        {t(
                                                            selectedInvoice
                                                                ?.data
                                                                ?.attributes
                                                                ?.payment_status,
                                                        )}
                                                    </Badge>

                                                    <div>
                                                        {
                                                            selectedInvoice
                                                                ?.data
                                                                ?.attributes
                                                                ?.invoice_no
                                                        }
                                                    </div>
                                                </div>
                                            </DrawerTitle>

                                            <DrawerDescription className="flex justify-between">
                                                {DateFormat(
                                                    selectedInvoice?.data
                                                        ?.attributes
                                                        ?.issue_date,
                                                )}

                                                <div>
                                                    {t("dueDate")}:{" "}
                                                    {DateFormat(
                                                        selectedInvoice?.data
                                                            ?.attributes
                                                            ?.due_date,
                                                    )}
                                                </div>
                                            </DrawerDescription>
                                        </div>
                                    </DrawerHeader>

                                    <div className="w-full grid grid-cols-8 gap-4">
                                        <div className="md:order-2 col-span-full md:col-span-2">
                                            <Card>
                                                <CardContent className="flex flex-col gap-2 p-4 text-muted-foreground">
                                                    <div className="flex justify-between">
                                                        <div className="text-foreground">
                                                            {t("grossTotal")}
                                                        </div>
                                                        {`${PriceFormat(
                                                            selectedInvoice
                                                                ?.data
                                                                ?.attributes
                                                                ?.gross_total,
                                                        )} ${
                                                            currencies.find(
                                                                (c) =>
                                                                    c.key ===
                                                                    selectedInvoice
                                                                        ?.data
                                                                        ?.attributes
                                                                        ?.currency,
                                                            )?.symbol
                                                        }`}
                                                    </div>

                                                    <Separator />

                                                    <div className="flex justify-between">
                                                        <div className="text-foreground">
                                                            {t("taxTotal")}
                                                        </div>

                                                        {`${PriceFormat(
                                                            selectedInvoice
                                                                ?.data
                                                                ?.attributes
                                                                ?.total_vat,
                                                        )} ${
                                                            currencies.find(
                                                                (c) =>
                                                                    c.key ===
                                                                    selectedInvoice
                                                                        ?.data
                                                                        ?.attributes
                                                                        ?.currency,
                                                            )?.symbol
                                                        }`}
                                                    </div>

                                                    <Separator />

                                                    <div className="flex justify-between">
                                                        <div className="text-foreground font-bold">
                                                            {t("netTotal")}
                                                        </div>
                                                        {`${PriceFormat(
                                                            selectedInvoice
                                                                ?.data
                                                                ?.attributes
                                                                ?.net_total,
                                                        )} ${
                                                            currencies.find(
                                                                (c) =>
                                                                    c.key ===
                                                                    selectedInvoice
                                                                        ?.data
                                                                        ?.attributes
                                                                        ?.currency,
                                                            )?.symbol
                                                        }`}
                                                    </div>

                                                    {selectedInvoice?.data
                                                        ?.attributes
                                                        ?.payment_status !==
                                                        "paid" && (
                                                        <>
                                                            <Separator />

                                                            <div className="flex justify-between text-destructive">
                                                                <div className="font-bold">
                                                                    {t(
                                                                        "remaining",
                                                                    )}
                                                                </div>
                                                                {`${PriceFormat(
                                                                    selectedInvoice
                                                                        ?.data
                                                                        ?.attributes
                                                                        ?.remaining,
                                                                )} ${
                                                                    currencies.find(
                                                                        (c) =>
                                                                            c.key ===
                                                                            selectedInvoice
                                                                                ?.data
                                                                                ?.attributes
                                                                                ?.currency,
                                                                    )?.symbol
                                                                }`}
                                                            </div>
                                                        </>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <div className="md:order-1 col-span-full md:col-span-6 border rounded-md max-h-fit">
                                            <Table>
                                                <TableHeader className="bg-zinc-100/50">
                                                    <TableRow>
                                                        <TableHead>
                                                            {t("product")}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t("quantity")}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t("unitPrice")}
                                                        </TableHead>
                                                        <TableHead>
                                                            {t("tax")}
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            {t("total")}
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>

                                                <TableBody>
                                                    {selectedInvoice?.included
                                                        .filter(
                                                            (i: any) =>
                                                                i.type ===
                                                                "sales_invoice_details",
                                                        )
                                                        .map((d: any) => (
                                                            <TableRow
                                                                key={d.id}
                                                            >
                                                                <TableCell className="flex flex-col font-medium">
                                                                    {
                                                                        selectedInvoice?.included?.find(
                                                                            (
                                                                                p: any,
                                                                            ) =>
                                                                                p?.id ==
                                                                                d
                                                                                    ?.relationships
                                                                                    ?.product
                                                                                    ?.data
                                                                                    ?.id,
                                                                        )
                                                                            .attributes
                                                                            .name
                                                                    }
                                                                    <span className="font-normal text-muted-foreground">
                                                                        {
                                                                            d
                                                                                ?.attributes
                                                                                ?.description
                                                                        }
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {Math.floor(
                                                                        d
                                                                            ?.attributes
                                                                            ?.quantity,
                                                                    ) + " "}
                                                                    <span className="text-muted-foreground">
                                                                        {t(
                                                                            "piece",
                                                                        )}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {PriceFormat(
                                                                        d
                                                                            ?.attributes
                                                                            ?.unit_price,
                                                                    ) + " "}
                                                                    <span className="text-muted-foreground">
                                                                        {
                                                                            currencies.find(
                                                                                (
                                                                                    c,
                                                                                ) =>
                                                                                    c.key ===
                                                                                    selectedInvoice
                                                                                        ?.data
                                                                                        ?.attributes
                                                                                        ?.currency,
                                                                            )
                                                                                ?.symbol
                                                                        }
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="text-muted-foreground">
                                                                        %
                                                                    </span>
                                                                    {Math.floor(
                                                                        d
                                                                            ?.attributes
                                                                            ?.vat_rate,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {PriceFormat(
                                                                        d
                                                                            ?.attributes
                                                                            ?.net_total_without_invoice_discount,
                                                                    ) + " "}
                                                                    <span className="text-muted-foreground">
                                                                        {
                                                                            currencies.find(
                                                                                (
                                                                                    c,
                                                                                ) =>
                                                                                    c.key ===
                                                                                    selectedInvoice
                                                                                        ?.data
                                                                                        ?.attributes
                                                                                        ?.currency,
                                                                            )
                                                                                ?.symbol
                                                                        }
                                                                    </span>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
