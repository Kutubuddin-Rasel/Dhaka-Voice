import axios from 'axios';
import { authStore } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:4000';

export const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Global 401 handler: soft-logout and redirect to login with next
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      // Only redirect if it's NOT an auth endpoint (login/signup)
      const isAuthEndpoint = err?.config?.url?.includes('/auth/');
      
      if (!isAuthEndpoint) {
        try { authStore.clear(); } catch {}
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?next=${next}`;
      }
    }
    return Promise.reject(err);
  }
);

export type AuthUser = { id: string; email: string; name: string; createdAt: string };
export type AuthResponse = { user: AuthUser; accessToken: string; refreshToken: string };

export const authApi = {
	signup: (data: { email: string; password: string; name: string }) => api.post<AuthResponse>('/auth/signup', data).then(r => r.data),
	login: (data: { email: string; password: string }) => api.post<AuthResponse>('/auth/login', data).then(r => r.data),
	logout: () => api.post<void>('/auth/logout').then(r => r.data),
	refresh: () => api.get<{ accessToken: string; refreshToken: string }>('/auth/refresh').then(r => r.data),
	changePassword: (data: { currentPassword: string; newPassword: string }) => api.post<void>('/auth/change-password', data).then(r => r.data),
};

export type Complaint = {
	id: string;
	title: string;
	description: string;
	type: 'ROADS' | 'ELECTRICITY' | 'WATER' | 'POLLUTION' | 'TRANSPORT' | 'OTHERS';
	status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
	createdAt: string;
	user: { id: string; name: string };
	thanaId?: number;
	wardId?: number;
	thana?: { id: number; name: string };
	ward?: { id: number; cityCorporation: 'DNCC' | 'DSCC'; wardNumber: number };
	images?: Array<{
		id: string;
		signedThumbUrl?: string;
		signedMediumUrl?: string;
		signedOriginalUrl?: string;
	}>;
	_count?: { upvotes: number; comments: number };
};

export const complaintsApi = {
	list: (params?: { page?: number; pageSize?: number; type?: string; search?: string; sort?: 'latest' | 'top' | 'oldest'; userId?: string }) => api.get<{ items: Complaint[]; total: number; page: number; pageSize: number }>(`/complaints`, { params }).then(r => r.data),
	get: (id: string) => api.get<Complaint>(`/complaints/${id}`).then(r => r.data),
	create: (data: { title: string; description: string; type: Complaint['type']; thanaId?: number; wardId?: number }) => api.post<Complaint>('/complaints', data).then(r => r.data),
	update: (id: string, data: Partial<{ title: string; description: string; type: Complaint['type']; thanaId?: number; wardId?: number }>) => api.patch<Complaint>(`/complaints/${id}`, data).then(r => r.data),
	remove: (id: string) => api.delete<{ success: boolean }>(`/complaints/${id}`).then(r => r.data),
	upvoteToggle: (id: string) => api.post<{ upvoted: boolean }>(`/complaints/${id}/upvote/toggle`).then(r => r.data),
	updateStatus: (id: string, status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') => api.patch<Complaint>(`/complaints/${id}/status`, { status }).then(r => r.data),
  uploadImages: (id: string, files: File[] | FileList) => {
    const form = new FormData();
    const arr = Array.from(files).slice(0, 3) as File[];
    arr.forEach(f => form.append('files', f));
    return api.post<{ images: Array<{ id: string; pathOriginal: string; pathMedium?: string; pathThumb?: string }> }>(`/complaints/${id}/images/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

export type CommentDto = { id: string; content: string; user: { id: string; name: string }; createdAt: string };
export const commentsApi = {
  list: (complaintId: string) => api.get<CommentDto[]>(`/complaints/${complaintId}/comments`).then(r => r.data),
  add: (complaintId: string, content: string) => api.post<CommentDto>(`/complaints/${complaintId}/comments`, { content }).then(r => r.data),
  remove: (complaintId: string, commentId: string) => api.delete<{ success: boolean }>(`/complaints/${complaintId}/comments/${commentId}`).then(r => r.data),
};

export type Thana = { id: number; name: string };
export type Ward = { id: number; cityCorporation: 'DNCC' | 'DSCC'; wardNumber: number };

export const locationsApi = {
  searchThanas: (q?: string) => api.get<{ items: Thana[] }>(`/locations/thanas`, { params: { q } }).then(r => r.data.items),
  listWards: (corp?: 'DNCC' | 'DSCC') => api.get<{ items: Ward[] }>(`/locations/wards`, { params: { corp } }).then(r => r.data.items),
};

export const usersApi = {
  updateProfile: (id: string, data: { name: string }) => api.patch<AuthUser>(`/users/profile`, data).then(r => r.data),
  getStats: () => api.get<{ complaintsSubmitted: number; commentsMade: number; upvotesGiven: number }>('/users/stats').then(r => r.data),
  exportData: () => api.get('/users/export-data').then(r => r.data),
  deleteAccount: () => api.delete<{ success: boolean; message: string }>('/users/account').then(r => r.data),
};

export type Notification = {
  id: string;
  type: 'COMPLAINT_STATUS_UPDATE' | 'COMPLAINT_COMMENT' | 'COMPLAINT_UPVOTE' | 'SYSTEM_ANNOUNCEMENT';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  complaint?: {
    id: string;
    title: string;
    status: string;
  };
  createdAt: string;
  readAt?: string;
  archivedAt?: string;
};

export const notificationsApi = {
  list: (params?: { page?: number; pageSize?: number }) => 
    api.get<{ items: Notification[]; total: number; page: number; pageSize: number; totalPages: number }>('/notifications', { params }).then(r => r.data),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count').then(r => r.data),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`).then(r => r.data),
  markAllAsRead: () => api.patch('/notifications/mark-all-read').then(r => r.data),
  archive: (id: string) => api.patch(`/notifications/${id}/archive`).then(r => r.data),
};
