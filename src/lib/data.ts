
import usersData from './users.json';
import postsData from './posts.json';
import pagesData from './pages.json';


export type Post = {
  id: string;
  title: string;
  content: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  createdAt: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  authorId: string;
  tags?: string[];
  featuredImage?: {
    url: string;
    alt: string;
  };
};

export type Page = {
  id: string;
  title: string;
  content: string;
  status: 'Published' | 'Draft';
  createdAt: string;
  authorId: string;
};


export type User = {
    id: string;
    name: string;
    email: string;
    password?: string; // Should be handled securely, not stored plaintext
    avatarUrl: string;
    role: 'Admin' | 'Editor' | 'Author';
    createdAt: string;
}

export type MenuItem = {
    label: string;
    url: string;
};

export type Menu = {
    id: string;
    name: string;
    items: MenuItem[];
};

export type Template = {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
}

export type SiteSettings = {
  siteName: string;
  tagline: string;
  logo: string;
  faviconUrl?: string;
  headerMenuId?: string;
  footerMenuId?: string;
  footerText?: string;
  blogTemplate?: string;
  adsTxt?: string;
  robotsTxt?: string;
};


let posts: Post[] = postsData;

let pages: Page[] = pagesData;

let users: User[] = usersData;

export function setUsers(newUsers: User[]) {
  users = newUsers;
}

export function setPosts(newPosts: Post[]) {
    posts = newPosts;
}

export function setPages(newPages: Page[]) {
    pages = newPages;
}


export { users, posts, pages };
