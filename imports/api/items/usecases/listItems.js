export class ListItemsUseCase {
  constructor(repo) {
    this.repo = repo;
  }

  async execute({ page = 1, limit = 10, status, search } = {}) {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Math.min(100, Number(limit) || 10));
    const skip = (p - 1) * l;
    const { items, total } = await this.repo.list({ status, search, skip, limit: l });
    const hasMore = skip + items.length < total;
    return { items, page: p, limit: l, total, hasMore };
  }
}