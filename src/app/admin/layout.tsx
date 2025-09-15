import { redirect } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userLoggedIn = false; 

  if (!userLoggedIn) {
    redirect('/login');
  }

  return <>{children}</>;
}
