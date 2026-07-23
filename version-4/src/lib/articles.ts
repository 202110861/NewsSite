import { api } from "./api";
import type { Article } from "../types/news";

export interface ArticlesPage {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function fetchArticles(params?: { sectionId?: string; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.sectionId) search.set("sectionId", params.sectionId);
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();
  return api.get<Article[]>(`/articles${query ? `?${query}` : ""}`);
}

export function fetchArticlesPage(params: {
  sectionId?: string;
  limit?: number;
  page: number;
}) {
  const search = new URLSearchParams();
  if (params.sectionId) search.set("sectionId", params.sectionId);
  if (params.limit) search.set("limit", String(params.limit));
  search.set("page", String(params.page));
  return api.get<ArticlesPage>(`/articles?${search.toString()}`);
}

export function fetchArticle(id: string) {
  return api.get<Article>(`/articles/${id}`);
}

export function searchArticles(query: string) {
  return api.get<Article[]>(`/articles/search?q=${encodeURIComponent(query)}`);
}
