import { api } from "./api";
import type { Article } from "../types/news";

export interface LikeStatus {
  likeCount: number;
  liked: boolean;
}

export interface ArticleComment {
  id: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
}

export interface MyLikeItem {
  id: string;
  createdAt: string;
  article: Article;
}

export interface MyCommentItem {
  id: string;
  body: string;
  createdAt: string;
  article: {
    id: string;
    title: string;
    section: string;
    publishedAt: string;
  };
}

export function fetchLikeStatus(articleId: string) {
  return api.get<LikeStatus>(`/articles/${articleId}/likes`);
}

export function toggleArticleLike(articleId: string) {
  return api.post<LikeStatus>(`/articles/${articleId}/likes`);
}

export function fetchComments(articleId: string) {
  return api.get<ArticleComment[]>(`/articles/${articleId}/comments`);
}

export function createComment(articleId: string, body: string) {
  return api.post<ArticleComment>(`/articles/${articleId}/comments`, { body });
}

export function updateComment(articleId: string, commentId: string, body: string) {
  return api.patch<ArticleComment>(
    `/articles/${articleId}/comments/${commentId}`,
    { body },
  );
}

export function deleteComment(articleId: string, commentId: string) {
  return api.delete<{ ok: boolean }>(
    `/articles/${articleId}/comments/${commentId}`,
  );
}

export function fetchMyLikes() {
  return api.get<MyLikeItem[]>("/users/me/likes");
}

export function fetchMyComments() {
  return api.get<MyCommentItem[]>("/users/me/comments");
}
