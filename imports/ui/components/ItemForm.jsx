import React, { useState, useEffect } from 'react';
import { useCreateItem, useUpdateItem } from '../hooks/useItems';
import { ErrorMessage } from './ErrorMessage';

export const ItemForm = ({ item, onClose, onSuccess }) => {
    const isEditing = !!item;
    const { createItem, loading: creating, error: createError } = useCreateItem();
    const { updateItem, loading: updating, error: updateError } = useUpdateItem();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        priority: 3
    });

    useEffect(() => {
        if (item) {
            setFormData({
                title: item.title || '',
                description: item.description || '',
                status: item.status || 'todo',
                priority: item.priority || 3
            });
        }
    }, [item]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateItem(item._id, formData);
            } else {
                await createItem(formData);
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    const loading = creating || updating;
    const error = createError || updateError;

    return (
        <div className="item-form-overlay">
            <div className="item-form">
                <h2 className="item-form__title">
                    {isEditing ? 'Editar Item' : 'Novo Item'}
                </h2>

                {error && (
                    <div className="item-form__error">
                        <ErrorMessage message={error} />
                    </div>
                )}

                <form onSubmit={handleSubmit} className="item-form__fields">
                    <div className="item-form__field">
                        <label className="item-form__label item-form__label--required">
                            Título
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={200}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="item-form__input"
                            placeholder="Ex: Comprar Macbook M5"
                        />
                    </div>

                    <div className="item-form__field">
                        <label className="item-form__label">Descrição</label>
                        <textarea
                            maxLength={1000}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="item-form__textarea"
                            placeholder="Descreva os detalhes do item..."
                        />
                    </div>

                    <div className="item-form__field">
                        <label className="item-form__label">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="item-form__select"
                        >
                            <option value="todo">⏳ A Fazer</option>
                            <option value="doing">🔄 Em Progresso</option>
                            <option value="done">✅ Concluído</option>
                        </select>
                    </div>

                    <div className="item-form__field">
                        <label className="item-form__label">
                            Prioridade: {formData.priority}
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                            className="item-form__slider"
                        />
                        <div className="item-form__priority-labels">
                            <span>Muito Baixa</span>
                            <span>Baixa</span>
                            <span>Média</span>
                            <span>Alta</span>
                            <span>Urgente</span>
                        </div>
                    </div>

                    <div className="item-form__actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="item-form__btn item-form__btn--cancel"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="item-form__btn item-form__btn--submit"
                        >
                            {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};