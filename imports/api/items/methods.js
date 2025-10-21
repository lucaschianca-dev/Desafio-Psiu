
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { MongoItemsRepository } from '/imports/api/items/adapters/mongoItemsRepository.js';
import { CreateItemUseCase } from '/imports/api/items/usecases/createItem.js';
import { ListItemsUseCase } from '/imports/api/items/usecases/listItems.js';
import { UpdateItemUseCase } from '/imports/api/items/usecases/updateItem.js';
import { sanitizeCreateItem, sanitizeUpdateItem } from '/imports/api/items/dto.js';
import { ValidationError, NotFoundError } from '/imports/api/items/domain/errors.js';

// INJECAO DE DEPENDENCIA
const repo = new MongoItemsRepository();
const createUC = new CreateItemUseCase(repo);
const listUC = new ListItemsUseCase(repo);
const updateUC = new UpdateItemUseCase(repo);

// Helper para converter erros de domínio em Meteor.Error
function handleError(error) {
    if (error instanceof ValidationError) {
        throw new Meteor.Error('validation-error', error.message);
    }
    if (error instanceof NotFoundError) {
        throw new Meteor.Error('not-found', error.message);
    }
    console.error('Unexpected error in Meteor method:', error);
    throw new Meteor.Error('server-error', error.message || 'Internal server error');
}

Meteor.methods({
    /**
     * Criar um novo item
     * @param {Object} payload - Dados do item
     * @returns {Object} Item criado com _id
     */
    async 'items.insert'(payload) {
        check(payload, Object);

        try {
            const safe = sanitizeCreateItem(payload);
            return await createUC.execute(safe);
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Listar items com filtros e paginação
     * @param {Object} filters - Filtros de busca (page, limit, status, search)
     * @returns {Object} Lista de items com metadados de paginação
     */
    async 'items.list'(filters = {}) {
        check(filters, Match.Optional(Object));

        try {
            return await listUC.execute(filters);
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Buscar um item por ID
     * @param {String} id - ID do item
     * @returns {Object} Item encontrado
     */
    async 'items.findById'(id) {
        check(id, String);

        try {
            const item = await updateUC.findById(id);
            if (!item) {
                throw new NotFoundError(`Item ${id} not found`);
            }
            return item;
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Atualizar um item
     * @param {String} id - ID do item
     * @param {Object} patch - Campos a atualizar
     * @returns {Object} Item atualizado
     */
    async 'items.update'(id, patch) {
        check(id, String);
        check(patch, Object);

        try {
            const safe = sanitizeUpdateItem(patch);
            return await updateUC.execute(id, safe);
        } catch (error) {
            handleError(error);
        }
    },

    /**
     * Deletar um item (soft delete)
     * @param {String} id - ID do item
     * @returns {Object} Item marcado como indisponível
     */
    async 'items.delete'(id) {
        check(id, String);

        try {
            return await updateUC.execute(id, { available: false });
        } catch (error) {
            handleError(error);
        }
    },
});