
import { Meteor } from 'meteor/meteor';
import { Items } from '/imports/api/items/infra/collection.js';

function escapeRegExp(s = '') {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

Meteor.publish('items.list', function (filters = {}) {
  // Defensive: ensure filters is an object
  const f = (filters && typeof filters === 'object') ? filters : {};

  // limite validate e normalize
  let limit = Number(f.limit);
  if (!Number.isInteger(limit) || limit <= 0) limit = 50;
  limit = Math.max(1, Math.min(100, limit));

  // Validate status
  const STATUS = ['todo', 'doing', 'done'];
  let status;
  if (typeof f.status === 'string' && STATUS.includes(f.status)) {
    status = f.status;
  }

  // Sanitize a pesquisa por regex
  let search;
  if (typeof f.search === 'string' && f.search.trim()) {
    search = f.search.trim();
  }

  // Build query
  const query = { $or: [{ available: true }, { available: { $exists: false } }] };
  if (status) query.status = status;
  if (search) {
    const rx = new RegExp(escapeRegExp(search), 'i');
    query.$or = [
      { title: { $regex: rx } },
      { description: { $regex: rx } },
      { available: true },
      { available: { $exists: false } }
    ];
  }

  // Publish apenas os campos necessarios
  const fields = {
    title: 1,
    description: 1,
    status: 1,
    priority: 1,
    available: 1,
    createdAt: 1,
  };

  return Items.find(query, {
    sort: { createdAt: -1 },
    limit,
    fields,
  });
});