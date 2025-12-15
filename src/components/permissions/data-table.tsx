"use client";

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    ExpandedState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getPaginationRowModel,
    getSortedRowModel,
    getExpandedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { FacetedFilter } from "./faceted-filter";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const t = useTranslations("dataTable");
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState("");
    const [expanded, setExpanded] = useState<ExpandedState>({});

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getSubRows: (row: any) => row.subRows,
        paginateExpandedRows: false,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        onExpandedChange: setExpanded,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
            expanded,
        },
        initialState: {
            pagination: {
                pageSize: 20,
            },
        },
    });

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t("filters.searchPlaceholder")}
                            value={globalFilter ?? ""}
                            onChange={(event) => setGlobalFilter(event.target.value)}
                            className="pl-9"
                        />
                    </div>
                    {table.getColumn("userPermissions") && (
                        <FacetedFilter
                            column={table.getColumn("userPermissions")}
                            title={t("filters.users")}
                            options={Array.from(
                                new Set(
                                    data.flatMap((file: any) =>
                                        (file.permissions || []).map((p: any) =>
                                            p.emailAddress || p.displayName || p.domain || p.type
                                        )
                                    )
                                )
                            ).map((email) => ({
                                label: email,
                                value: email,
                            }))}
                        />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Select
                        value={
                            (table.getColumn("isFolder")?.getFilterValue() as string) ?? "all"
                        }
                        onValueChange={(value) =>
                            table
                                .getColumn("isFolder")
                                ?.setFilterValue(value === "all" ? undefined : value)
                        }
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder={t("filters.type")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                            <SelectItem value="folder">{t("filters.folders")}</SelectItem>
                            <SelectItem value="file">{t("filters.files")}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={
                            (table.getColumn("shared")?.getFilterValue() as string) ?? "all"
                        }
                        onValueChange={(value) =>
                            table
                                .getColumn("shared")
                                ?.setFilterValue(value === "all" ? undefined : value)
                        }
                    >
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder={t("filters.sharing")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t("filters.allFiles")}</SelectItem>
                            <SelectItem value="shared">{t("filters.shared")}</SelectItem>
                            <SelectItem value="private">{t("filters.private")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Selection info */}
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div className="rounded-md bg-muted px-4 py-2 text-sm">
                    {t("selection.filesSelected", {
                        selected: table.getFilteredSelectedRowModel().rows.length,
                        total: table.getFilteredRowModel().rows.length,
                    })}
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    {t("empty")}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {t("pagination.showing", {
                        start: table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1,
                        end: Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length
                        ),
                        total: table.getFilteredRowModel().rows.length,
                    })}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                        {t("pagination.page", {
                            current: table.getState().pagination.pageIndex + 1,
                            total: table.getPageCount(),
                        })}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export { useReactTable };
