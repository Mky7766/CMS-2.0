import usersData from './users.json';

export type Post = {
  id: string;
  title: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  createdAt: string;
  author: {
    name: string;
    avatarUrl: string;
  };
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

export const posts: Post[] = [
  {
    id: '1',
    title: 'The Future of Web Development with Static Site Generators',
    status: 'Published',
    createdAt: '2024-07-20',
    author: {
      name: 'Jane Doe',
      avatarUrl: 'https://picsum.photos/seed/a1/32/32',
    },
  },
  {
    id: '2',
    title: 'A Deep Dive into Headless CMS Architectures',
    status: 'Published',
    createdAt: '2024-07-18',
    author: {
      name: 'John Smith',
      avatarUrl: 'https://picsum.photos/seed/b2/32/32',
    },
  },
  {
    id: '3',
    title: 'Getting Started with Nebula CMS: A Beginner\'s Guide',
    status: 'Draft',
    createdAt: '2024-07-21',
    author: {
      name: 'Alice Johnson',
      avatarUrl: 'https://picsum.photos/seed/c3/32/32',
    },
  },
  {
    id: '4',
    title: 'Optimizing Images for the Web',
    status: 'Published',
    createdAt: '2024-07-15',
    author: {
      name: 'Bob Brown',
      avatarUrl: 'https://picsum.photos/seed/d4/32/32',
    },
  },
  {
    id: '5',
    title: 'The Power of Markdown in Content Creation',
    status: 'Scheduled',
    createdAt: '2024-07-25',
    author: {
      name: 'Charlie Davis',
      avatarUrl: 'https://picsum.photos/seed/e5/32/32',
    },
  },
];


let users: User[] = usersData;

export function setUsers(newUsers: User[]) {
  users = newUsers;
}

export { users };


export const dashboardStats = [
    { title: "Total Posts", value: "28", icon: "FileText" },
    { title: "Published Posts", value: "22", icon: "CheckCircle" },
    { title: "Draft Posts", value: "6", icon: "Edit3" },
    { title: "Site Views", value: "12,580", icon: "BarChart2" },
]
