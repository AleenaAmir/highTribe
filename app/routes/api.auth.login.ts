import { json } from "@remix-run/node"
import type { ActionFunction } from "@remix-run/node"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { getDb } from "~/lib/db"
import { appConfig } from "../config"
import { users } from "../lib/schema"

// Login validation schema
const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
})

export const action: ActionFunction = async ({ request }) => {
	try {
		const body = await request.json()
		const { email, password } = loginSchema.parse(body)

		const db = getDb()

		// ✅ Only select the actual fields that exist in your table
		const result = await db
			.select({
				id: users.id,
				email: users.email,
				password: users.password,
				fullName: users.fullName, // ✅ not `name`
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1)
			.execute()

		const user = result[0]

		if (!user) {
			return json({ success: false, error: "Invalid credentials" }, { status: 401 })
		}

		const isValid = await bcrypt.compare(password, user.password)
		if (!isValid) {
			return json({ success: false, error: "Invalid credentials" }, { status: 401 })
		}

		const token = jwt.sign({ userId: user.id, email: user.email }, appConfig.JWT_SECRET, { expiresIn: "7d" })

		return json(
			{
				success: true,
				data: {
					token,
					user: {
						id: user.id,
						email: user.email,
						fullName: user.fullName,
					},
				},
			},
			{
				status: 200,
				headers: {
					"Set-Cookie": `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
				},
			}
		)
	} catch (error) {
		if (error instanceof z.ZodError) {
			return json({ success: false, error: "Invalid input", details: error.errors }, { status: 400 })
		}

		console.error("Login error:", error)
		return json({ success: false, error: "Authentication failed" }, { status: 500 })
	}
}
