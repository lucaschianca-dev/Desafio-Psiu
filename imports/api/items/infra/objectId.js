
import { Mongo } from 'meteor/mongo';

/**
 * Gera um novo ObjectID do MongoDB como STRING
 * @returns {string} ObjectID em formato de string
 */
export function generateObjectId() {
    return new Mongo.ObjectID()._str; // ← Retorna STRING, não objeto
}

/**
 * Valida se uma string é um ObjectID válido
 * @param {string} id - ID para validar
 * @returns {boolean}
 */
export function validateObjectId(id) {
    if (!id || typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Converte string para ObjectID do MongoDB
 * @param {string} id - ID em formato string
 * @returns {Mongo.ObjectID}
 */
export function toObjectId(id) {
    if (!validateObjectId(id)) {
        throw new Error(`Invalid ObjectID format: ${id}`);
    }
    return new Mongo.ObjectID(id);
}

/**
 * Converte ObjectID para string
 * @param {Mongo.ObjectID|string} id - ObjectID ou string
 * @returns {string}
 */
export function toStringId(id) {
    if (typeof id === 'string') return id;
    if (id && id._str) return id._str;
    if (id && id.toString) return id.toString();
    return String(id);
}