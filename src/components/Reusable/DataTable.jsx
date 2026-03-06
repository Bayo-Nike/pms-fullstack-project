import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress,
    Box, Typography
} from '@mui/material';

/**
 * A reusable data table component.
 * @param {array} columns - Array of objects defining the table columns. e.g., [{ field: 'id', headerName: 'ID', width: 90 }]
 * @param {array} data - Array of data objects to display in the rows.
 * @param {boolean} isLoading - If true, shows a loading spinner instead of the table.
 * @param {function} renderActions - A function that receives a row object and returns JSX for the actions cell.
 */
export const DataTable = ({ columns, data, isLoading = false, renderActions }) => {

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body1">No data available.</Typography>
            </Paper>
        );
    }

    return (
        <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <Table sx={{ minWidth: 650 }} aria-label="reusable data table">
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell key={column.field} sx={{ fontWeight: 'bold', width: column.width }}>
                                {column.headerName}
                            </TableCell>
                        ))}
                        {renderActions && (
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Actions</TableCell>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow
                            key={row.id || index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#fafafa' } }}
                        >
                            {columns.map((column) => (
                                <TableCell key={`${column.field}-${row.id || index}`}>
                                    {row[column.field]}
                                </TableCell>
                            ))}
                            {renderActions && (
                                <TableCell align="right">
                                    {renderActions(row)}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};