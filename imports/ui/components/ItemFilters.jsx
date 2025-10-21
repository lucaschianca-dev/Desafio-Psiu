
import React from 'react';

export const ItemFilters = ({ filters, onFilterChange, itemCount }) => {
    return (
        <div className="item-filters">
            <div className="item-filters__grid">
                {/* Search */}
                <div className="item-filters__field">
                    <label className="item-filters__label">Buscar</label>
                    <input
                        type="text"
                        placeholder="Buscar por título ou descrição..."
                        value={filters.search || ''}
                        onChange={(e) => onFilterChange({ search: e.target.value })}
                        className="item-filters__input"
                    />
                </div>

                {/* Status Filter */}
                <div className="item-filters__field">
                    <label className="item-filters__label">Status</label>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => onFilterChange({ status: e.target.value || undefined })}
                        className="item-filters__select"
                    >
                        <option value="">Todos</option>
                        <option value="todo">⏳ A Fazer</option>
                        <option value="doing">🔄 Em Progresso</option>
                        <option value="done">✅ Concluído</option>
                    </select>
                </div>
            </div>

            {/* Results count */}
            <div className="item-filters__count">
                {itemCount} {itemCount === 1 ? 'item encontrado' : 'itens encontrados'}
            </div>
        </div>
    );
};