import { useState, useCallback } from 'react';

interface PaginationState {
  current: number;
  pageSize: number;
  total: number;
}

interface UsePaginationOptions {
  initialPageSize?: number;
  initialPage?: number;
}

interface UsePaginationReturn {
  pagination: PaginationState;
  setPagination: (pagination: Partial<PaginationState>) => void;
  handlePageChange: (page: number, pageSize: number) => void;
  resetPagination: () => void;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPageSize = 10,
    initialPage = 1
  } = options;

  const [pagination, setPaginationState] = useState<PaginationState>({
    current: initialPage,
    pageSize: initialPageSize,
    total: 0
  });

  const setPagination = useCallback((newPagination: Partial<PaginationState>) => {
    setPaginationState(prev => ({
      ...prev,
      ...newPagination
    }));
  }, []);

  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setPaginationState(prev => ({
      ...prev,
      current: page,
      pageSize
    }));
  }, []);

  const resetPagination = useCallback(() => {
    setPaginationState({
      current: initialPage,
      pageSize: initialPageSize,
      total: 0
    });
  }, [initialPage, initialPageSize]);

  return {
    pagination,
    setPagination,
    handlePageChange,
    resetPagination
  };
}
