/**
 * Product service — business logic layer.
 *
 * Coordinates the repository and mappers. Throws notFound errors when
 * appropriate; the function/controller layer maps those to responses.
 */
import { ProductRepository } from "./product.repository";
import {
  mapProductDetail,
  mapProductSummary,
} from "./product.mapper";
import type {
  ListProductsQuery,
  ListProductsResultDto,
  ProductDetailDto,
  RelatedProductsQuery,
  RelatedProductsResultDto,
  SearchProductsQuery,
  SearchProductsResultDto,
} from "./product.dto";

export class ProductNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Product not found: ${identifier}`);
    this.name = "ProductNotFoundError";
  }
}

export class ProductService {
  constructor(private readonly repo: ProductRepository = new ProductRepository()) {}

  async getBySlug(slug: string): Promise<ProductDetailDto> {
    const row = await this.repo.findBySlug(slug);
    if (!row) throw new ProductNotFoundError(slug);
    return mapProductDetail(row);
  }

  async list(query: ListProductsQuery): Promise<ListProductsResultDto> {
    const { rows, total } = await this.repo.list(query);
    return { items: rows.map(mapProductSummary), total };
  }

  /**
   * Release 1.1 — Search & Discovery (FEATURE-0002 / RFC-0001).
   *
   * Delegates to the repository so the search storage technology stays
   * swappable. An empty query short-circuits with zero results — the UI
   * uses that to render the idle "type to search" empty state.
   */
  async search(query: SearchProductsQuery): Promise<SearchProductsResultDto> {
    const q = (query.q ?? "").trim();
    if (!q) return { query: "", items: [], total: 0 };
    const { rows, total } = await this.repo.search({ ...query, q });
    return { query: q, items: rows.map(mapProductSummary), total };
  }
}