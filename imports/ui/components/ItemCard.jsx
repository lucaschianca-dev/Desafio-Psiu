import React, { useState } from 'react';
import { useDeleteItem, useUpdateItem } from '../hooks/useItems';

const STATUS_CONFIG = {
    todo: { label: 'A Fazer', badgeClass: 'item-card__badge--todo', icon: '⏳' },
    doing: { label: 'Em Progresso', badgeClass: 'item-card__badge--doing', icon: '🔄' },
    done: { label: 'Concluído', badgeClass: 'item-card__badge--done', icon: '✅' }
};

export const ItemCard = ({ item, onEdit, onChanged }) => {
    const { deleteItem, loading: deleting } = useDeleteItem();
    const { updateItem, loading: updating } = useUpdateItem();
    const [showConfirm, setShowConfirm] = useState(false);

    const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.todo;

    const handleDelete = async () => {
        try {
            await deleteItem(item._id);
            setShowConfirm(false);
            onChanged?.();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert(error.reason || error.message || 'Erro ao deletar');
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await updateItem(item._id, { status: newStatus });
            onChanged?.();
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.reason || error.message || 'Erro ao atualizar');
        }
    };

    const priorityClass = `item-card__priority-star--${item.priority}`;

    return (
        <div className="item-card">
            <div className="item-card__header">
                <div className="item-card__header-top">
                    <h3 className="item-card__title">{item.title}</h3>
                    <div className="item-card__actions">
                        <button
                            onClick={() => onEdit(item)}
                            className="item-card__icon-btn item-card__icon-btn--edit"
                            title="Editar"
                        >
                            <svg className="item-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="item-card__icon-btn item-card__icon-btn--delete"
                            title="Deletar"
                            disabled={deleting}
                        >
                            <svg className="item-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {item.description && (
                    <p className="item-card__description">{item.description}</p>
                )}
            </div>

            <div className="item-card__footer">
                <div className="item-card__footer-top">
          <span className={`item-card__badge ${statusConfig.badgeClass}`}>
            {statusConfig.icon} {statusConfig.label}
          </span>

                    <div className="item-card__priority">
                        {Array.from({ length: item.priority }).map((_, i) => (
                            <svg key={i} className={`item-card__priority-star ${priorityClass}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                </div>

                <div className="item-card__status-buttons">
                    <button
                        onClick={() => handleStatusChange('todo')}
                        disabled={updating || item.status === 'todo'}
                        className="item-card__status-btn item-card__status-btn--todo"
                    >
                        ⏳ A Fazer
                    </button>
                    <button
                        onClick={() => handleStatusChange('doing')}
                        disabled={updating || item.status === 'doing'}
                        className="item-card__status-btn item-card__status-btn--doing"
                    >
                        🔄 Fazendo
                    </button>
                    <button
                        onClick={() => handleStatusChange('done')}
                        disabled={updating || item.status === 'done'}
                        className="item-card__status-btn item-card__status-btn--done"
                    >
                        ✅ Feito
                    </button>
                </div>

                <div className="item-card__date">
                    Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </div>
            </div>

            {showConfirm && (
                <div className="modal">
                    <div className="modal__content">
                        <h3 className="modal__title">Confirmar exclusão</h3>
                        <p className="modal__text">
                            Tem certeza que deseja deletar "{item.title}"?
                        </p>
                        <div className="modal__actions">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="modal__btn modal__btn--cancel"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="modal__btn modal__btn--confirm"
                            >
                                {deleting ? 'Deletando...' : 'Deletar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};