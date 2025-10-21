import { buildItemPayload } from '/imports/api/items/domain/item.js';
import { NotFoundError } from '/imports/api/items/domain/errors.js';

export class UpdateItemUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(id, patch = {}) {
    const payload = buildItemPayload(patch, true);
    const updated = await this.repo.update(id, payload);
    if (!updated) throw new NotFoundError('Item not found');
    return updated;
  }

  async findById(id) {
    return this.repo.findById(id);
  }
}