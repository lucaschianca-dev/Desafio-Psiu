export function sanitizeCreateItem(payload = {}) {
  const { title, description, status, priority } = payload;
  return {
    title,
    description,
    status,
    priority,
  };
}

export function sanitizeUpdateItem(payload = {}) {
  const out = {};
  if ('title' in payload) out.title = payload.title;
  if ('description' in payload) out.description = payload.description;
  if ('status' in payload) out.status = payload.status;
  if ('priority' in payload) out.priority = payload.priority;
  return out;
}