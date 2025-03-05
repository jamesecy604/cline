import { NextRequest } from 'next/server';
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: NextRequest) {
  return NextAuth(authOptions)(req);
}

export async function POST(req: NextRequest) {
  return NextAuth(authOptions)(req);
}
