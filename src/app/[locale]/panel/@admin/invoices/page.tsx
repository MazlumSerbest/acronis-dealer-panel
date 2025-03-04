"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useTranslations } from "next-intl";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

import { DateFormat } from "@/utils/date";
import { LuChevronsUpDown, LuEye } from "react-icons/lu";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    DoubleArrowLeftIcon,
    DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import Loader from "@/components/loaders/Loader";
import { currencies } from "@/lib/constants";
import Skeleton from "@/components/loaders/Skeleton";
import { PriceFormat } from "@/utils/price";

// Mock data for demonstration
const mockInvoices = [
    {
        id: "INV-001",
        customer: "Acme Corp",
        date: "2023-11-01",
        amount: 1250.0,
        status: "paid",
    },
    {
        id: "INV-002",
        customer: "Globex Inc",
        date: "2023-11-03",
        amount: 890.5,
        status: "pending",
    },
    {
        id: "INV-003",
        customer: "Stark Industries",
        date: "2023-11-05",
        amount: 2340.75,
        status: "overdue",
    },
    {
        id: "INV-004",
        customer: "Wayne Enterprises",
        date: "2023-11-08",
        amount: 1100.25,
        status: "paid",
    },
    {
        id: "INV-005",
        customer: "LexCorp",
        date: "2023-11-10",
        amount: 3200.0,
        status: "pending",
    },
];

// Status badge colors
const statusColors: Record<string, string> = {
    paid: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    overdue: "bg-red-100 text-red-800",
};

export default function InvoicesPage() {
    const t = useTranslations("General");
    const tc = useTranslations("Components");
    const searchParams = useSearchParams();

    const [currentPage, setCurrentPage] = useState(1);
    const [paymentStatus, setPaymentStatus] = useState("");
    const [sort, setSort] = useState("-issue_date");

    const {
        data: invoices,
        error,
        isLoading,
        mutate,
    } = useSWR(
        [
            `/api/parasut/salesInvoices?currentPage=${currentPage}&paymentStatus=${paymentStatus}&sort=${sort}`,
        ],
        null,
        {
            revalidateOnFocus: false,
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
                        mutate();
                    }}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder={t("paymentStatus")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("all")}</SelectItem>
                        <SelectItem value="overdue">{t("overdue")}</SelectItem>
                        <SelectItem value="not_due">{t("unpaid")}</SelectItem>
                        <SelectItem value="paid">{t("paid")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("invoiceNo")}</TableHead>
                            <TableHead>{t("customer")}</TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="-ml-4"
                                    onClick={() => {
                                        setSort(
                                            sort === "-issue_date"
                                                ? "issue_date"
                                                : "-issue_date",
                                        );
                                        mutate();
                                    }}
                                >
                                    {t("issueDate")}
                                    <LuChevronsUpDown className="size-4 ml-2" />
                                </Button>
                            </TableHead>

                            <TableHead>
                                <Button
                                    variant="ghost"
                                    className="-ml-4"
                                    onClick={() => {
                                        setSort(
                                            sort === "-due_date"
                                                ? "due_date"
                                                : "-due_date",
                                        );
                                        mutate();
                                    }}
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
                                    onClick={() => {
                                        setSort(
                                            sort === "-remaining"
                                                ? "remaining"
                                                : "-remaining",
                                        );
                                        mutate();
                                    }}
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
                            ? Array.from({ length: 15 }).map((_, i) => (
                                  <TableRow key={i} className="odd:bg-zinc-100/50">
                                      {Array.from({ length: 7 }).map((_, i) => (
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
                                          <p className="truncate max-w-[200px]">
                                              {invoices?.included.find(
                                                  (inc: any) =>
                                                      inc.type === "contacts" &&
                                                      inc.id ===
                                                          invoice.relationships
                                                              .contact.data.id,
                                              )?.attributes.short_name || "-"}
                                          </p>
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
                                          <Link
                                              target="_blank"
                                              href={
                                                  invoice.attributes
                                                      .sharing_preview_url
                                              }
                                              className="flex items-center justify-end"
                                          >
                                              <Tooltip>
                                                  <TooltipTrigger>
                                                      <LuEye className="size-4 text-muted-foreground cursor-pointer hover:text-blue-500 active:text-blue-500/60" />
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                      <p>{t("showInvoice")}</p>
                                                  </TooltipContent>
                                              </Tooltip>
                                          </Link>
                                      </TableCell>
                                  </TableRow>
                              ))}
                        {invoices?.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
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
                <div className="flex-1 text-sm text-muted-foreground">
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
                                if (currentPage > 1) {
                                    setCurrentPage(1);
                                    mutate();
                                }
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
                                if (currentPage > 1) {
                                    setCurrentPage(currentPage - 1);
                                    mutate();
                                }
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
                                if (currentPage < invoices?.meta.total_pages) {
                                    setCurrentPage(currentPage + 1);
                                    mutate();
                                }
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
        </>
    );
}
