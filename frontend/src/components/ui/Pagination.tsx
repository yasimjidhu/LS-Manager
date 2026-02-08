import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(totalPages, start + maxVisible - 1);

            if (end === totalPages) {
                start = Math.max(1, end - maxVisible + 1);
            }

            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    };

    return (
        <div className={cn("flex items-center justify-between px-4 py-3 sm:px-6", className)}>
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-[#1F2937] bg-[#151A21] px-4 py-2 text-sm font-medium text-gray-400 hover:bg-[#1F2937] disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-[#1F2937] bg-[#151A21] px-4 py-2 text-sm font-medium text-gray-400 hover:bg-[#1F2937] disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-400">
                        Page <span className="font-medium text-white">{currentPage}</span> of{' '}
                        <span className="font-medium text-white">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-[#1F2937] hover:bg-[#1F2937] focus:z-20 focus:outline-offset-0 disabled:opacity-30"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-[#1F2937] hover:bg-[#1F2937] focus:z-20 focus:outline-offset-0 disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {getPageNumbers().map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={cn(
                                    "relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ring-1 ring-inset ring-[#1F2937]",
                                    currentPage === page
                                        ? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                        : "text-gray-400 hover:bg-[#1F2937]"
                                )}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-[#1F2937] hover:bg-[#1F2937] focus:z-20 focus:outline-offset-0 disabled:opacity-30"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-[#1F2937] hover:bg-[#1F2937] focus:z-20 focus:outline-offset-0 disabled:opacity-30"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
