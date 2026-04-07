import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Resource, Category, Tag, Review, Bookmark, PageResponse } from '@/types';

// ── Resources ─────────────────────────────────────────────
export function useResources(params: {
  search?: string;
  categoryId?: number;
  tagId?: number;
  page?: number;
  size?: number;
}) {
  return useQuery<PageResponse<Resource>>({
    queryKey: ['resources', params],
    queryFn: async () => {
      const res = await api.get('/resources', { params: { ...params, size: params.size ?? 12 } });
      return res.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useResource(id: number) {
  return useQuery<Resource>({
    queryKey: ['resource', id],
    queryFn: async () => (await api.get(`/resources/${id}`)).data,
    enabled: !!id,
  });
}

// ── Categories ─────────────────────────────────────────────
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data,
  });
}

// ── Tags ─────────────────────────────────────────────────
export function useTags() {
  return useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: async () => (await api.get('/tags')).data,
  });
}

// ── Reviews ───────────────────────────────────────────────
export function useReviews(resourceId: number) {
  return useQuery<Review[]>({
    queryKey: ['reviews', resourceId],
    queryFn: async () => (await api.get(`/resources/${resourceId}/reviews`)).data,
    enabled: !!resourceId,
  });
}

export function useAddReview(resourceId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { rating: number; comment: string }) =>
      api.post(`/resources/${resourceId}/reviews`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', resourceId] });
      qc.invalidateQueries({ queryKey: ['resource', resourceId] });
    },
  });
}

// ── Bookmarks ─────────────────────────────────────────────
export function useBookmarks() {
  return useQuery<Bookmark[]>({
    queryKey: ['bookmarks'],
    queryFn: async () => (await api.get('/users/me/bookmarks')).data,
  });
}

export function useToggleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ resourceId, bookmarked }: { resourceId: number; bookmarked: boolean }) => {
      if (bookmarked) {
        return api.delete(`/users/me/bookmarks/${resourceId}`);
      } else {
        return api.post(`/users/me/bookmarks/${resourceId}`);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookmarks'] });
      qc.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

// ── Download ──────────────────────────────────────────────
export async function downloadResource(id: number, filename: string) {
  const res = await api.get(`/files/download/${id}`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
