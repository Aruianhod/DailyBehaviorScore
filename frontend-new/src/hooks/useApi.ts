import { useState, useEffect } from 'react';
import { message } from 'antd';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T, P extends any[]>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (...params: P): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...params);
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('未知错误');
      setError(error);
      
      if (options.onError) {
        options.onError(error);
      } else {
        message.error(error.message);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };  // 如果设置了 immediate 为 true，则立即执行（仅适用于无参数的 API）
  useEffect(() => {
    if (options.immediate && apiFunction.length === 0) {
      (execute as any)();
    }
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
}
