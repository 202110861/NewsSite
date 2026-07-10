import { api } from "./api";
import type { Article } from "../types/news";

export function fetchArticles(params?: { sectionId?: string; limit?: number }) {
  const search = new URLSearchParams();
  if (params?.sectionId) search.set("sectionId", params.sectionId);
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();
  return api.get<Article[]>(`/articles${query ? `?${query}` : ""}`);
}

export function fetchArticle(id: string) {
  return api.get<Article>(`/articles/${id}`);
}

export function searchArticles(query: string) {
  return api.get<Article[]>(`/articles/search?q=${encodeURIComponent(query)}`);
}
