import { Items } from '/imports/api/items/infra/collection.js';
import { generateObjectId, toObjectId, toStringId } from '/imports/api/items/infra/objectId.js';

export class MongoItemsRepository {
  async insert(itemPayload) {
    const _id = generateObjectId();
    const doc = {
      ...itemPayload,
      _id,
      // Assegura que available seja TRUE por padrao ao criar novo Item
      available: itemPayload.available === undefined ? true : itemPayload.available,
    };
    await Items.rawCollection().insertOne(doc);
    return toStringId(_id);
  }

  async findById(id) {
    const availableClause = { $or: [{ available: true }, { available: { $exists: false } }] };

    try {
      const oid = toObjectId(id);
      if (oid) {
        const byOid = await Items.rawCollection().findOne({ _id: oid, ...availableClause });
        if (byOid) return { ...byOid, _id: toStringId(byOid._id) };
      }
    } catch (e) {
      // ignore
    }

    // fallback para string id
    const byStr = await Items.rawCollection().findOne({ _id: id, ...availableClause });
    if (!byStr) return null;
    return { ...byStr, _id: toStringId(byStr._id) };
  }

  async update(id, patch) {
    // Os IDs sao salvos como String. Atualizar por String primeiro,
    // entao fallback para ObjectID se for aplicavel.
    let matched = 0;

    // 1) Por string _id
    matched = (await Items.rawCollection().updateOne({ _id: id }, { $set: patch })).matchedCount;

    // 2) Fallback: Tentar por ObjectID quando nao houver correspondencia e o id for um ObjectID valido
    let oid = null;
    if (matched === 0) {
      try {
        oid = toObjectId(id);
        matched = (await Items.rawCollection().updateOne({ _id: oid }, { $set: patch })).matchedCount;
      } catch (e) {
        // ignore invalid ObjectID
      }
    }

    // Fetch(obter) documento atualizado (preferir por ID de string)
    let updated = await Items.rawCollection().findOne({ _id: id });
    if (!updated && oid) updated = await Items.rawCollection().findOne({ _id: oid });
    if (!updated) return null;1
    return { ...updated, _id: toStringId(updated._id) };
  }

  async list({ status, search, skip = 0, limit = 20 } = {}) {
    const qBase = {};
    if (status) qBase.status = status;

    const availableClause = { $or: [{ available: true }, { available: { $exists: false } }] };

    const options = {
      sort: { createdAt: -1 },
      skip: Number(skip) || 0,
      limit: Number(limit) || 20,
    };

    const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let total = 0;
    let rawItems = [];

    const s = search && String(search).trim();

    if (s) {
      // Tentar por pesquisa de texto primeiro (se o índice existir)
      try {
        const qText = { ...qBase, $text: { $search: s }, ...availableClause };
        total = await Items.rawCollection().countDocuments(qText);
        if (total > 0) {
          rawItems = await Items.rawCollection().find(qText, options).toArray();
        }
      } catch (e) {
        // ignore text search errors
      }

      if (total === 0) {
        const rx = new RegExp(escapeRegExp(s), 'i');
        const qRegex = { ...qBase, $or: [{ title: { $regex: rx } }, { description: { $regex: rx } }], ...availableClause };
        total = await Items.rawCollection().countDocuments(qRegex);
        rawItems = await Items.rawCollection().find(qRegex, options).toArray();
      }
    } else {
      const q = Object.keys(qBase).length ? { ...qBase, ...availableClause } : availableClause;
      total = await Items.rawCollection().countDocuments(q);
      rawItems = await Items.rawCollection().find(q, options).toArray();
    }

    return {
      items: rawItems.map(i => ({ ...i, _id: toStringId(i._id) })),
      total,
    };
  }
}