export const ITEM_STATUS = ['todo', 'doing', 'done'];

/**
 * Build an Item DTO that matches domain contract.
 * @param {Object} payload
 * @param {boolean} isUpdate - if true, relax validation (for partial updates)
 */
export function buildItemPayload(payload = {}, isUpdate = false) {
  const errors = [];

  const titleRaw = payload.title;
  const title = titleRaw !== undefined ? String(titleRaw).trim() : undefined;
  if (!isUpdate) {
    if (!title) errors.push('titulo e obrigatorio');
  }
  if (title !== undefined) {
    if (title.length < 3 || title.length > 80) errors.push('titulo precisa estar entre 3 e 80 caracteres');
  }

  const descriptionRaw = payload.description;
  const description = descriptionRaw !== undefined ? String(descriptionRaw).trim() : undefined;

  if (description !== undefined && description.length > 500) errors.push('descricao precisa estar ate 500 caracteres');

  const statusRaw = payload.status;
  const status = statusRaw !== undefined ? String(statusRaw) : undefined;
  if (status !== undefined && !ITEM_STATUS.includes(status)) {
    errors.push(`status precisa ser algum desses ${ITEM_STATUS.join(', ')}`);
  }

  const priorityRaw = payload.priority;
  const priority = priorityRaw !== undefined ? Number(priorityRaw) : undefined;
  if (priority !== undefined) {
    if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
      errors.push('prioridade precisa ser um inteiro entre 1 e 5');
    }
  }

  // disallow client setting available on create
  if (!isUpdate && payload.available !== undefined) {
    errors.push('available nao pode ser setado ao criar');
  }
  const availableRaw = payload.available;
  const available = availableRaw !== undefined ? Boolean(availableRaw) : undefined;

  if (errors.length > 0) {
    const err = new Error(errors.join('; '));
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const out = {};
  if (title !== undefined) out.title = title;
  if (description !== undefined) {
    // Na atualização, incluir somente a descricao fornecida; na criacao, o padrao e uma string vazia
    out.description = description;
  } else if (!isUpdate) {
    out.description = '';
  }
  out.status = status !== undefined ? status : (isUpdate ? undefined : 'todo');
  out.priority = priority !== undefined ? priority : (isUpdate ? undefined : 3);
  if (!isUpdate) out.createdAt = payload.createdAt ? new Date(payload.createdAt) : new Date();
  if (available !== undefined && isUpdate) out.available = available;

  return out;
}