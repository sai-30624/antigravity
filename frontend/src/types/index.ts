export interface Resource {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string; // PDF, DOCX, VIDEO, etc.
  fileSizeMb: number;
  downloadCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  uploader: { id: number; name: string };
  category: Category;
  tags: Tag[];
  bookmarked?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  resourceCount?: number;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: number; name: string };
}

export interface Bookmark {
  id: number;
  resource: Resource;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  downloadCount: number;
  bookmarkCount: number;
  reviewCount: number;
}

export interface AdminStats {
  totalResources: number;
  totalUsers: number;
  totalDownloads: number;
  totalReviews: number;
  resourcesByCategory: { name: string; count: number }[];
  downloadsByDay: { date: string; count: number }[];
  topResources: { title: string; downloads: number }[];
  newUsersThisMonth: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  downloadCount: number;
  lastViewedResource?: string;
  active: boolean;
}

export interface Feedback {
  id: number;
  type: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: { id: number; name: string; email: string };
  resource?: { id: number; title: string };
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
