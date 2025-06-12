import bcrypt from "bcryptjs"
import { eq, or } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { cacheHeader } from "pretty-cache-header"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { z } from "zod"
import { appConfig } from "../config"
import { getDb } from "../lib/db"
import { users } from "../lib/schema"

// JWT secret key - in production, this should be in environment variables
const JWT_SECRET = appConfig.JWT_SECRET

// Register schema
const registerUserSchema = z
	.object({
		fullName: z.string().min(1),
		email: z.string().email(),
		password: z.string().min(6),
		confirmPassword: z.string().min(6),
		phone: z.string().min(10),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	})

// Update schema (without confirmPassword)
const updateUserSchema = z.object({
	fullName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(6).optional(),
	phone: z.string().min(10),
})

// Helper to generate JWT
const generateToken = (userId: number, email: string) => {
	return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "24h" })
}

// GET: List users
export async function loader({ request, context }: LoaderFunctionArgs) {
	const { isProductionDeployment } = context
	const url = new URL(request.url)
	const search = url.searchParams.get("search")
	const limit = url.searchParams.get("limit")
	const db = getDb()

	// Build the query
	let filteredData = await db.select().from(users).execute()

	// Apply search filter if provided
	if (search) {
		filteredData = filteredData.filter(
			(user) =>
				user.fullName.toLowerCase().includes(search.toLowerCase()) ||
				user.email.toLowerCase().includes(search.toLowerCase())
		)
	}

	// Apply limit if provided
	if (limit) {
		const limitNum = Number.parseInt(limit, 10)
		if (!Number.isNaN(limitNum) && limitNum > 0) {
			filteredData = filteredData.slice(0, limitNum)
		}
	}

	const headers = new Headers()
	if (isProductionDeployment) {
		headers.set(
			"Cache-Control",
			cacheHeader({
				maxAge: "1m",
				sMaxage: "5m",
				staleWhileRevalidate: "1h",
			})
		)
	}

	return Response.json(
		{
			success: true,
			data: filteredData.map(({ password, ...rest }) => rest),
			total: filteredData.length,
			message: "Users retrieved successfully",
		},
		{ headers }
	)
}

// POST, PUT, DELETE handler
export async function action({ request }: ActionFunctionArgs) {
	try {
		const db = getDb()
		const method = request.method

		if (!["POST", "PUT", "DELETE"].includes(method)) {
			return Response.json({ success: false, error: "Method not allowed" }, { status: 405 })
		}

		const body = await request.json()

		// CREATE USER
		if (method === "POST") {
			try {
				const validatedData = registerUserSchema.parse(body)
				console.log("Validated data:", { ...validatedData, password: "[REDACTED]" })

				// Check email or phone uniqueness
				const [existingUser] = await db
					.select()
					.from(users)
					.where(or(eq(users.email, validatedData.email), eq(users.phone, validatedData.phone)))
					.limit(1)
					.execute()

				if (existingUser?.email === validatedData.email) {
					return Response.json({ success: false, error: "Email already exists" }, { status: 400 })
				}
				if (existingUser?.phone === validatedData.phone) {
					return Response.json({ success: false, error: "Phone number already exists" }, { status: 400 })
				}

				const hashedPassword = await bcrypt.hash(validatedData.password, 10)
				console.log("Password hashed successfully")

				const [newUser] = await db
					.insert(users)
					.values({
						fullName: validatedData.fullName,
						email: validatedData.email,
						password: hashedPassword,
						phone: validatedData.phone,
						createdAt: new Date(),
					})
					.returning()
					.execute()

				console.log("User created successfully:", { id: newUser.id, email: newUser.email })

				const token = generateToken(newUser.id, newUser.email)
				console.log("Token generated successfully")

				return Response.json(
					{
						success: true,
						data: { ...newUser, password: undefined },
						token,
						message: "User created successfully",
					},
					{ status: 201 }
				)
			} catch (error) {
				console.error("Error in user creation:", error)
				throw error // Re-throw to be caught by outer try-catch
			}
		}

		// UPDATE USER
		if (method === "PUT") {
			const { id, ...updateData } = body

			if (!id || typeof id !== "number") {
				return Response.json({ success: false, error: "Valid ID is required" }, { status: 400 })
			}

			const [existingUser] = await db.select().from(users).where(eq(users.id, id)).limit(1).execute()

			if (!existingUser) {
				return Response.json({ success: false, error: "User not found" }, { status: 404 })
			}

			if (updateData.password) {
				updateData.password = await bcrypt.hash(updateData.password, 10)
			}

			const validatedData = updateUserSchema.parse(updateData)

			const [updatedUser] = await db
				.update(users)
				.set({
					...validatedData,
					updatedAt: new Date(),
				})
				.where(eq(users.id, id))
				.returning()
				.execute()

			const token = generateToken(updatedUser.id, updatedUser.email)

			return Response.json({
				success: true,
				data: { ...updatedUser, password: undefined },
				token,
				message: "User updated successfully",
			})
		}

		// DELETE USER
		if (method === "DELETE") {
			const { id } = body
			if (!id || typeof id !== "number") {
				return Response.json({ success: false, error: "Valid ID is required" }, { status: 400 })
			}

			const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning().execute()

			if (!deletedUser) {
				return Response.json({ success: false, error: "User not found" }, { status: 404 })
			}

			return Response.json({
				success: true,
				data: { ...deletedUser, password: undefined },
				message: "User deleted successfully",
			})
		}
	} catch (error) {
		console.error("API Error Details:", {
			name: error instanceof Error ? error.name : "Unknown",
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
		})

		if (error instanceof z.ZodError) {
			return Response.json(
				{
					success: false,
					error: "Validation failed",
					details: error.errors,
				},
				{ status: 400 }
			)
		}
		if (error instanceof SyntaxError) {
			return Response.json(
				{
					success: false,
					error: "Invalid JSON format",
				},
				{ status: 400 }
			)
		}
		if (error instanceof Error) {
			return Response.json(
				{
					success: false,
					error: error.message || "Internal server error",
					details: appConfig.NODE_ENV === "development" ? error.stack : undefined,
				},
				{ status: 500 }
			)
		}
		return Response.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 }
		)
	}
}
