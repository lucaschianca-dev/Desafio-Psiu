import React, { useState } from 'react';
import { useHttpItems } from '../hooks/useItems.js';
import { ItemCard } from '../components/ItemCard.jsx';
import { ItemForm } from '../components/ItemForm.jsx';
import { ItemFilters } from '../components/ItemFilters.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';

export const ItemsPage = () => {
    const [filters, setFiltersLocal] = useState({ search: '', status: undefined, limit: 10 });

    const { items, page, limit, total, hasMore, loading, error, setPage, setFilters, refetch } =
        useHttpItems({
            page: 1,
            limit: filters.limit,
            status: filters.status,
            search: filters.search
        });

    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleFilterChange = (next) => {
        const nextFilters = { ...filters, ...next };
        setFiltersLocal(nextFilters);
        setFilters(nextFilters); // volta para page 1 e refaz GET
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingItem(null);
    };

    // Após create/update no modal
    const handleSuccess = () => {
        // forcar recarregar mantendo a página e filtros atuais
        refetch();
    };

    // Após update/delete no card
    const handleChanged = () => {
        // forcar recarregar mantendo a página e filtros atuais
        refetch();
    };

    const goPrev = () => page > 1 && setPage(page - 1);
    const goNext = () => hasMore && setPage(page + 1);

    if (loading && items.length === 0) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="items-page">
            <header className="items-page__header">
                <div className="items-page__header-container">
                    <div className="items-page__header-content">
                        <div className="items-page__header-text">
                            <h1>Lucas Chianca</h1>
                            <p>Gerenciamento de Itens com Meteor + React</p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="items-page__new-btn"
                        >
                            <svg className="items-page__btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Novo Item
                        </button>
                    </div>
                </div>
            </header>

            <main className="items-page__main">
                <ItemFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    itemCount={items.length}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <button onClick={goPrev} disabled={page <= 1} className="item-card__status-btn item-card__status-btn--todo">← Anterior</button>
                    <span style={{ fontSize: '0.9rem' }}>Página {page} • {items.length} / {limit} • Total: {total}</span>
                    <button onClick={goNext} disabled={!hasMore} className="item-card__status-btn item-card__status-btn--doing">Próxima →</button>
                </div>

                {loading && items.length > 0 && (
                    <div className="items-page__loading">
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                {error && (
                    <div className="error-message" style={{ marginBottom: 12 }}>
                        <div className="error-message__content">
                            <span className="error-message__text">{error}</span>
                        </div>
                    </div>
                )}

                {!loading && items.length === 0 && (
                    <div className="items-page__empty">
                        <svg className="items-page__empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="items-page__empty-title">Nenhum item encontrado</h3>
                        <p className="items-page__empty-text">Ajuste os filtros ou crie um novo item.</p>
                    </div>
                )}

                {items.length > 0 && (
                    <div className="items-page__grid">
                        {items.map((item) => (
                            <ItemCard
                                key={item._id}
                                item={item}
                                onEdit={handleEdit}
                                onChanged={handleChanged}
                            />
                        ))}
                    </div>
                )}

                {items.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                        <button onClick={goPrev} disabled={page <= 1} className="item-card__status-btn item-card__status-btn--todo">← Anterior</button>
                        <span style={{ fontSize: '0.9rem' }}>Página {page}</span>
                        <button onClick={goNext} disabled={!hasMore} className="item-card__status-btn item-card__status-btn--doing">Próxima →</button>
                    </div>
                )}
            </main>

            {showForm && (
                <ItemForm item={editingItem} onClose={handleCloseForm} onSuccess={handleSuccess} />
            )}
        </div>
    );
};