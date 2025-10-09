
export type Post = {
  id: string;
  title: string;
  content: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  created_at: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  authorId: string;
  categoryId?: string;
  tags?: string[];
  featuredImage?: {
    url: string;
    alt: string;
  };
  format?: string;
  hideTitle?: boolean;
};

export type Page = {
  id: string;
  title: string;
  content: string;
  status: 'Published' | 'Draft';
  createdAt: string;
  authorId: string;
  hideTitle?: boolean;
};


export type User = {
    id: string;
    name: string;
    email: string;
    password?: string;
    avatarUrl: string;
    role: 'Admin' | 'Editor' | 'Author';
    createdAt: string;
    bio?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
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

export type Category = {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export type FirebaseConfig = {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
};


export type SiteSettings = {
  siteName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  headerMenuId?: string;
  footerMenuId?: string;
  footerText?: string;
  blogTemplate?: string;
  adsTxt?: string;
  robotsTxt?: string;
  defaultPostCategoryId?: string;
  defaultPostFormat?: string;
  customHeadCode?: string;
  customBodyCode?: string;
  homepagePageId?: string;
  postsPageId?: string;
  theme?: {
    primary?: string;
    accent?: string;
    background?: string;
  };
  showAuthorBio?: boolean;
  firebaseConfig?: FirebaseConfig;
};

export type PageView = {
    path: string;
    timestamp: string;
    referrer?: string;
    source?: 'Direct' | 'Social' | 'Google' | 'Other';
    country?: string;
}

    