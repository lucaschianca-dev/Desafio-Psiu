import { useState, useEffect, useMemo } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Items } from '/imports/api/items/infra/collection.js';

/**
 * Reactive subscription hook (para atualizacoes ao vivo via DDP)
 *
export function useItemsSub(initial = { status: undefined, search: '', limit: 50 }) {
  const [filters, setFilters] = useState({
    status: initial.status,
    search: initial.search || '',
    limit: initial.limit || 50,
  });

  const { items, loading } = useTracker(() => {
    const handle = Meteor.subscribe('items.list', filters);
    const isLoading = !handle.ready();

    const query = { $or: [{ available: true }, { available: { $exists: false } }] };
    if (filters.status) query.status = filters.status;
    if (filters.search) {
      const rx = new RegExp(filters.search, 'i');
      query.$or = [
        { title: { $regex: rx } },
        { description: { $regex: rx } },
        { available: true },
        { available: { $exists: false } },
      ];
    }

    const cursor = Items.find(query, {
      sort: { createdAt: -1 },
      limit: filters.limit || 50,
    });

    return {
      items: cursor.fetch(),
      loading: isLoading,
    };
  }, [filters.status, filters.search, filters.limit]);

  return {
    items,
    loading,
    filters,
    setFilters,
  };
}
 *
 */

/**
 * Novo hook: paginação via HTTP (usa seu controller REST).
 * Retorna: items, page, limit, total, hasMore, loading, error, setPage, setFilters
 */
export function useHttpItems(initial = { page: 1, limit: 10, status: undefined, search: '' }) {
    const [page, setPage] = useState(initial.page || 1);
    const [limit, setLimit] = useState(initial.limit || 10);
    const [status, setStatus] = useState(initial.status);
    const [search, setSearch] = useState(initial.search || '');
    const [data, setData] = useState({ items: [], page: 1, limit: 10, total: 0, hasMore: false });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // tick para forçar recarregamento sem mudar filtros
    const [refreshTick, setRefreshTick] = useState(0);

    const queryString = useMemo(() => {
        const q = new URLSearchParams();
        q.set('page', String(page));
        q.set('limit', String(limit));
        if (status) q.set('status', status);
        if (search) q.set('search', search);
        // adiciona um parâmetro descartável apenas para invalidar cache/requisição
        if (refreshTick) q.set('_', String(refreshTick));
        return q.toString();
    }, [page, limit, status, search, refreshTick]);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/items?${queryString}`);
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err?.error || `HTTP ${res.status}`);
                }
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch (e) {
                if (!cancelled) setError(e.message || 'Erro ao carregar itens');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [queryString]);

    // API para atualizar filtros e resetar a página automaticamente
    function setFilters(next = {}) {
        if ('status' in next) setStatus(next.status || undefined);
        if ('search' in next) setSearch(next.search || '');
        if ('limit' in next) setLimit(next.limit || 10);
        // Se for especificado 'page', respeita-o. Caso contrário, volta para 1.
        if ('page' in next && Number(next.page) > 0) {
            setPage(Number(next.page));
        } else {
            setPage(1);
        }
    }

    // força refetch mantendo página/filtros atuais
    function refetch() {
        setRefreshTick((t) => (t + 1) % Number.MAX_SAFE_INTEGER);
    }

    return {
        items: data.items || [],
        page: data.page || page,
        limit: data.limit || limit,
        total: data.total || 0,
        hasMore: Boolean(data.hasMore),
        loading,
        error,
        setPage,
        setFilters,
        refetch,
    };
}

// Hooks de mutate (mantidos como estão, via Methods)
export function useCreateItem() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const createItem = async (itemData) => {
        setLoading(true); setError(null);
        try {
            const result = await new Promise((resolve, reject) => {
                Meteor.call('items.insert', itemData, (err, res) => err ? reject(err) : resolve(res));
            });
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.reason || err.message); setLoading(false); throw err;
        }
    };
    return { createItem, loading, error };
}

export function useUpdateItem() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const updateItem = async (id, patch) => {
        setLoading(true); setError(null);
        try {
            const result = await new Promise((resolve, reject) => {
                Meteor.call('items.update', id, patch, (err, res) => err ? reject(err) : resolve(res));
            });
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.reason || err.message); setLoading(false); throw err;
        }
    };
    return { updateItem, loading, error };
}

export function useDeleteItem() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const deleteItem = async (id) => {
        setLoading(true); setError(null);
        try {
            const result = await new Promise((resolve, reject) => {
                Meteor.call('items.delete', id, (err, res) => err ? reject(err) : resolve(res));
            });
            setLoading(false);
            return result;
        } catch (err) {
            setError(err.reason || err.message); setLoading(false); throw err;
        }
    };
    return { deleteItem, loading, error };
}