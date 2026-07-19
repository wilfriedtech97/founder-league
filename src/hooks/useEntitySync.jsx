import { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export function useEntitySync(entityName, options = {}) {
  const { sort = '-score_overall', limit = 100, filter = {}, onError } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const items = await base44.entities[entityName].filter(filter, sort, limit);
      setData(items);
    } catch (err) {
      onErrorRef.current?.(err);
    } finally {
      setLoading(false);
    }
  }, [entityName, sort, limit, JSON.stringify(filter)]);

  useEffect(() => {
    refresh();

    const unsubscribe = base44.entities[entityName].subscribe((event) => {
      setData(prev => {
        if (event.type === 'create') {
          return prev.some(item => item.id === event.data.id) ? prev : [event.data, ...prev];
        }
        if (event.type === 'update') {
          return prev.map(item => item.id === event.data.id ? { ...item, ...event.data } : item);
        }
        if (event.type === 'delete') {
          return prev.filter(item => item.id !== event.data.id);
        }
        return prev;
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [refresh]);

  return { data, loading, refresh, setData };
}