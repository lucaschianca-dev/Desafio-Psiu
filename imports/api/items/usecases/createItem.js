import { buildItemPayload } from '/imports/api/items/domain/item.js';

export class CreateItemUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute(payload) {
    // domain validation/normalization
    const item = buildItemPayload(payload, false);
    const id = await this.repo.insert(item);
    // return uniform shape
    return { _id: id, item: { ...item, _id: id } };
  }
}