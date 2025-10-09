
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getUsers } from '@/app/actions';

export async function GET() {
  const session = await getSession();

  if (!session || !session.userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  
  // Now fetching from DB via server action
  const allUsers = await getUsers();
  const user = allUsers.find(u => u.id === session.userId);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 404 });
  }
  
  const { password, ...userWithoutPassword } = user;

  return NextResponse.json({ user: userWithoutPassword });
}

    