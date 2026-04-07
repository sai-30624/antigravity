import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { AdminStats, AdminUser, Feedback, Resource, PageResponse } from '@/types';

// ── Admin Stats ────────────────────────────────────────────
export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });
}

// ── Admin Users ───────────────────────────────────────────
export function useAdminUsers(params: { search?: string; page?: number; size?: number }) {
  return useQuery<PageResponse<AdminUser>>({
    queryKey: ['admin', 'users', params],
    queryFn: async () => (await api.get('/admin/users', { params: { ...params, size: params.size ?? 15 } })).data,
    placeholderData: (prev) => prev,
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => api.put(`/admin/users/${userId}/toggle-status`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

// ── Admin Resources ───────────────────────────────────────
export function useAdminResources(params: { search?: string; page?: number; size?: number }) {
  return useQuery<PageResponse<Resource>>({
    queryKey: ['admin', 'resources', params],
    queryFn: async () => (await api.get('/resources', { params: { ...params, size: params.size ?? 15 } })).data,
    placeholderData: (prev) => prev,
  });
}

export function useDeleteResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/resources/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      qc.invalidateQueries({ queryKey: ['admin', 'resources'] });
    },
  });
}

export function useUploadResource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => (await api.post('/resources', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['resources'] });
      qc.invalidateQueries({ queryKey: ['admin', 'resources'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ── Admin Categories ──────────────────────────────────────
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => api.post('/categories', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });
}

// ── Admin Tags ────────────────────────────────────────────
export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => api.post('/tags', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/tags/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  });
}

// ── Admin Feedback ────────────────────────────────────────
export function useAdminFeedback(params: { status?: string; page?: number }) {
  return useQuery<PageResponse<Feedback>>({
    queryKey: ['admin', 'feedback', params],
    queryFn: async () => (await api.get('/admin/feedback', { params: { ...params, size: 15 } })).data,
    placeholderData: (prev) => prev,
  });
}

export function useUpdateFeedbackStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/admin/feedback/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'feedback'] }),
  });
}
