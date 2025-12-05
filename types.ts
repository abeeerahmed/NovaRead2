
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type LibraryStatus = 'Reading' | 'Plan to Read' | 'Completed' | 'Dropped' | 'On Hold';

export interface LibraryEntry {
  novelId: string;
  status: LibraryStatus;
  addedAt: string;
}

export interface ReadingProgress {
  novelId: string;
  chapterId: string;
  chapterNumber: number;
  lastReadAt: string;
  scrollPercentage: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  library: LibraryEntry[]; 
  readingHistory: ReadingProgress[];
  avatarUrl?: string; 
  bio?: string;
  joinedAt: string;
  themePreference: 'dark' | 'light' | 'sepia' | 'auto';
  isBanned?: boolean;
}

export interface Vote {
  id: string;
  userId: string;
  novelId: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  targetId: string; // Chapter ID or Review ID
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy: string[]; // Array of User IDs
  parentId?: string; // For replies
}

export interface Review {
  id: string;
  novelId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  rating: number; // 1-5
  content: string;
  isSpoiler: boolean;
  createdAt: string;
  likes: number;
  likedBy: string[]; // Array of User IDs
}

export interface Chapter {
  id: string;
  novelId: string;
  title: string;
  content: string;
  chapterNumber: number;
  releaseDate: string;
  views: number;
  comments: number; 
}

export interface Novel {
  id: string;
  title: string;
  synopsis: string;
  author: string;
  coverUrl: string;
  genres: string[]; // Primary genres
  tags: string[]; // Descriptive tags
  status: 'Ongoing' | 'Completed' | 'Hiatus';
  
  // Stats
  views: number;
  rating: number; 
  ratingCount: number;
  
  // New Stats
  saves: number;
  dailyVotes: number;
  weeklyVotes: number;
  allTimeVotes: number;
  
  updatedAt: string;
  chapters?: Chapter[]; // Hydrated usually
  latestChapterNumber: number;
}

export interface NovelRequest {
  id: string;
  userId: string;
  username: string;
  title: string;
  additionalInfo?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
}

export interface SearchFilters {
  query?: string;
  genre?: string;
  tag?: string;
  sortBy?: 'latest' | 'popular' | 'rating' | 'saves' | 'votes' | 'reviews';
  status?: string;
}

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  textAlign: 'left' | 'justify';
  fontFamily: 'sans' | 'serif';
  theme: 'dark' | 'light' | 'sepia';
  maxWidth: number;
}

export interface GeminiSummaryResponse {
  summary: string;
  suggestedTags: string[];
}