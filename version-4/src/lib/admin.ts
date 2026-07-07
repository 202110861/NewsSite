import { api } from "./api";
import type { AdminArticle, BodyBlockInput } from "../types/news";

export interface UploadResult {
  id: string;
  filePath: string;
  url: string;
  mimeType: string;
  originalName: string;
}

export function fetchReviewArticles() {
  return api.get<AdminArticle[]>("/admin/articles?status=PENDING_REVIEW");
}

export function fetchAdminArticle(id: string) {
  return api.get<AdminArticle>(`/admin/articles/${id}`);
}

export function createAdminArticle(data: {
  title: string;
  sectionId: string;
  blocks: BodyBlockInput[];
  excerpt?: string;
}) {
  return api.post<AdminArticle>("/admin/articles", data);
}

export function updateAdminArticle(
  id: string,
  data: {
    title?: string;
    sectionId?: string;
    blocks?: BodyBlockInput[];
    excerpt?: string;
  },
) {
  return api.patch<AdminArticle>(`/admin/articles/${id}`, data);
}

export function deleteAdminArticle(id: string) {
  return api.delete(`/admin/articles/${id}`);
}

export function bulkDeleteAdminArticles(ids: string[]) {
  return api.post("/admin/articles/bulk-delete", { ids });
}

export function approveAdminArticle(id: string) {
  return api.patch(`/admin/articles/${id}/approve`);
}

export function uploadMedia(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return api.upload<UploadResult>("/admin/uploads", formData);
}
