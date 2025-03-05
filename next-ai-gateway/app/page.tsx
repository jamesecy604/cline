"use client"

import { signIn, signOut, useSession } from "next-auth/react"

export default function Home() {
	const { data: session } = useSession()

	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2">
			<h1 className="text-4xl font-bold">Next.js AI Gateway</h1>
			{!session ? (
				<button onClick={() => signIn()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
					Sign in
				</button>
			) : (
				<>
					<p className="mt-4">Welcome, {session.user?.name}</p>
					<button onClick={() => signOut()} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
						Sign out
					</button>
				</>
			)}
		</div>
	)
}
