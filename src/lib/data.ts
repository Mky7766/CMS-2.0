import usersData from './users.json';
import postsData from './posts.json';

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

let posts: Post[] = postsData;

let users: User[] = usersData;

export function setUsers(newUsers: User[]) {
  users = newUsers;
}

export function setPosts(newPosts: Post[]) {
    posts = newPosts;
}

export { users, posts };


export const dashboardStats = [
    { title: "Total Posts", value: "28", icon: "FileText" },
    { title: "Published Posts", value: "22", icon: "CheckCircle" },
    { title: "Draft Posts", value: "6", icon: "Edit3" },
    { title: "Site Views", value: "12,580", icon: "BarChart2" },
]
