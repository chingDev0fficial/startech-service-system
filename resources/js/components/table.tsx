import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

export interface Column<T> {
    id: keyof T;
    label: string;
    minWidth?: number;
    align?: "right" | "left" | "center";
    format?: (value: any) => string;
    render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
    columns: Column[];
    rows: T[];
    rowsPerPageOptions?: number[];
    maxHeight?: number;
    isLoading?: boolean; // Add this
}

export default function AppTable<T extends { [key: string]: any }>({
    columns,
    rows,
    rowsPerPageOptions = [10, 25, 100],
    maxHeight = 400,
    isLoading = false, // Accept as prop instead of internal state
}: TableProps<T>) {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(rowsPerPageOptions[0]);
    // Remove internal loading state since it's now a prop

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    // Skeleton loading row component
    const SkeletonRow = () => (
        <TableRow>
            {columns.map((column, index) => (
                <TableCell key={index} align={column.align}>
                    <div className="animate-pulse bg-gray-200 h-4 rounded-md w-full"></div>
                </TableCell>
            ))}
        </TableRow>
    );

    // Loading spinner row (alternative to skeleton)
    const LoadingRow = () => (
        <TableRow>
            <TableCell colSpan={columns.length} align="center" style={{ height: '200px' }}>
                <div className="flex flex-col items-center justify-center space-y-2">
                    <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="text-gray-500">Loading data...</span>
                </div>
            </TableCell>
        </TableRow>
    );

    return (
        <div className="pt-5">
            <Paper sx={{ width: "100%", overflow: "hidden" }}>
                <TableContainer sx={{ maxHeight }}>
                    <Table stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={String(column.id)}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                // Option 1: Skeleton loading (recommended)
                                Array.from({ length: rowsPerPage }).map((_, index) => (
                                    <SkeletonRow key={`skeleton-${index}`} />
                                ))

                                // Option 2: Single loading row (uncomment to use instead)
                                // <LoadingRow />
                            ) : rows.length === 0 ? (
                                // Empty state
                                <TableRow>
                                    <TableCell colSpan={columns.length} align="center" style={{ height: '30px' }}>
                                        <span className="text-gray-500">No data available</span>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                // Actual data rows
                                rows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, rowIndex) => (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            tabIndex={-1}
                                            key={rowIndex}
                                        >
                                            {columns.map((column) => {
                                                const value = row[column.id];
                                                return (
                                                    <TableCell
                                                        key={String(column.id)}
                                                        align={column.align}
                                                    >
                                                        {column.render
                                                            ? column.render(row)
                                                            : column.format
                                                            ? column.format(value)
                                                            : value}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={rowsPerPageOptions}
                    component="div"
                    count={isLoading ? 0 : rows.length} // Don't show count while loading
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </div>
    );
}
