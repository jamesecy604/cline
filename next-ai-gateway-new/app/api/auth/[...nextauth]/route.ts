//import { NextRequest } from 'next/server';
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);