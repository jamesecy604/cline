import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
	}

	const body = await req.json()

	// Proxy logic to LLM providers
	const response = await fetch("https://llm-provider.com/api", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			// Add any necessary headers here
		},
		body: JSON.stringify(body),
	})

	const data = await response.json()
	return NextResponse.json(data, { status: response.status })
}
