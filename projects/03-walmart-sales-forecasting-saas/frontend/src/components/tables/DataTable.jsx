import React, { useState, useMemo } from 'react';
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    Search,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal
} from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';

const DataTable = ({
    columns = [],
    data = [],
    sortable = true,
    searchable = true,
    pagination = true,
    selectable = false,
    onSelectionChange,
    actions,
    className = ''
}) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);

    // Filtering
    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const lowerQuery = searchQuery.toLowerCase();
        return data.filter(row =>
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(lowerQuery)
            )
        );
    }, [data, searchQuery]);

    // Sorting
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal === bVal) return 0;

            const comparison = aVal > bVal ? 1 : -1;
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortConfig]);

    // Pagination
    const paginatedData = useMemo(() => {
        if (!pagination) return sortedData;
        const startIndex = (currentPage - 1) * rowsPerPage;
        return sortedData.slice(startIndex, startIndex + rowsPerPage);
    }, [sortedData, currentPage, rowsPerPage, pagination]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // Handlers
    const handleSort = (key) => {
        if (!sortable) return;
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            const newSelected = paginatedData.map(row => row.id || JSON.stringify(row));
            setSelectedRows(newSelected);
            onSelectionChange?.(newSelected);
        } else {
            setSelectedRows([]);
            onSelectionChange?.([]);
        }
    };

    const handleSelectRow = (id, checked) => {
        let newSelected;
        if (checked) {
            newSelected = [...selectedRows, id];
        } else {
            newSelected = selectedRows.filter(rowId => rowId !== id);
        }
        setSelectedRows(newSelected);
        onSelectionChange?.(newSelected);
    };

    const getSortIcon = (columnKey) => {
        if (!sortable) return null;
        if (sortConfig.key === columnKey) {
            return sortConfig.direction === 'asc'
                ? <ChevronUp size={16} className="text-brand-600" />
                : <ChevronDown size={16} className="text-brand-600" />;
        }
        return <ChevronsUpDown size={16} className="text-text-tertiary" />;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Controls Header */}
            {(searchable || actions) && (
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                    {searchable && (
                        <div className="w-full sm:w-72">
                            <Input
                                icon={Search}
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                    {actions && (
                        <div className="flex gap-2">
                            {actions}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-border-default shadow-sm bg-bg-elevated">
                <table className="w-full">
                    <thead className="bg-bg-tertiary border-b border-border-default">
                        <tr>
                            {selectable && (
                                <th className="px-6 py-4 w-12">
                                    <Checkbox
                                        checked={paginatedData.length > 0 && selectedRows.length === paginatedData.length}
                                        indeterminate={selectedRows.length > 0 && selectedRows.length < paginatedData.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => handleSort(column.key)}
                                    className={`px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider ${sortable ? 'cursor-pointer hover:text-brand-600 transition-colors' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.label}</span>
                                        {getSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="px-6 py-4 w-12"></th>}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border-default">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                                    className="px-6 py-12 text-center text-text-tertiary"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-bg-tertiary">
                                            <Search className="w-6 h-6 text-text-tertiary" />
                                        </div>
                                        <p className="font-medium text-text-secondary">No data found</p>
                                        <p className="text-sm">Try adjusting your filters</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => {
                                const rowId = row.id || JSON.stringify(row);
                                const isSelected = selectedRows.includes(rowId);

                                return (
                                    <tr
                                        key={index}
                                        className={`
                                            transition-colors
                                            ${isSelected ? 'bg-brand-50/50' : 'hover:bg-bg-secondary'}
                                        `}
                                    >
                                        {selectable && (
                                            <td className="px-6 py-4">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={(checked) => handleSelectRow(rowId, checked)}
                                                />
                                            </td>
                                        )}
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap"
                                            >
                                                {column.render
                                                    ? column.render(row[column.key], row)
                                                    : row[column.key]
                                                }
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-1 hover:bg-bg-tertiary rounded text-text-tertiary hover:text-text-primary transition-colors">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-text-tertiary">
                        Showing <span className="font-medium text-text-primary">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-medium text-text-primary">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> of <span className="font-medium text-text-primary">{filteredData.length}</span> results
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-text-tertiary">Rows per page:</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="bg-bg-secondary border border-border-default rounded text-sm px-2 py-1 focus:outline-none focus:border-brand-500"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                icon={ChevronLeft}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                icon={ChevronRight}
                                iconPosition="right"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
