
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { users } from '@/lib/data';

export async function GET() {
  const session = await getSession();

  if (!session || !session.userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = users.find(u => u.id === session.userId);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 404 });
  }
  
  // Return user data without the password
  const { password, ...userWithoutPassword } = user;

  return NextResponse.json({ user: userWithoutPassword });
}
