import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const DataTable = ({
    columns,
    data,
    loading,
    pagination,
    onPageChange,
    emptyTitle,
    emptyMessage
}) => {
    if (loading && (!data || data.length === 0)) {
        return (
            <div className="h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100">
                <LoadingSpinner size={40} />
                <p className="mt-4 text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Compiling Data Assets...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <EmptyState
                title={emptyTitle || "No records found"}
                message={emptyMessage || "Your search results are currently empty."}
            />
        );
    }

    return (
        <div className="space-y-4">
            <div className="table-container shadow-sm shadow-indigo-900/5">
                <table>
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className={col.className || ''}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row, rowIdx) => (
                            <tr key={rowIdx} className="transition-colors hover:bg-gray-50/50">
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className={col.className || ''}>
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <LoadingSpinner />
                    </div>
                )}
            </div>

            {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Page {pagination.page} of {pagination.pages} <span className="mx-2 opacity-50">•</span> Total: {pagination.total}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.page === 1 || loading}
                            onClick={() => onPageChange(pagination.page - 1)}
                            className="p-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:hover:border-gray-100 disabled:hover:text-gray-600 transition-all font-bold"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            disabled={pagination.page === pagination.pages || loading}
                            onClick={() => onPageChange(pagination.page + 1)}
                            className="p-2 rounded-xl bg-white border border-gray-100 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:hover:border-gray-100 disabled:hover:text-gray-600 transition-all font-bold"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
