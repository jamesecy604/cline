import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  
  if (token) {
    return NextResponse.json({ user: token });
  } else {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
