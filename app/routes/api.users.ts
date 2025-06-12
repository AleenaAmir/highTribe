import { eq } from "drizzle-orm"
import { cacheHeader } from "pretty-cache-header"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router"
import { z } from "zod"
import { getDb } from "../lib/db"
import { type NewUser, users } from "../lib/schema"

// Schema for POST request validation
const createUserSchema = z.object({
	fullName: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	phone: z.string().min(1, "Phone number is required"),
})

// GET handler - retrieve all users or filter by query params
export async function loader({ request, context }: LoaderFunctionArgs) {
	try {
		const { isProductionDeployment } = context
		const url = new URL(request.url)

		// Support filtering by query parameters
		const search = url.searchParams.get("search")
		const limit = url.searchParams.get("limit")
		const id = url.searchParams.get("id")

		const db = getDb()

		// If ID is provided, get specific user
		if (id) {
			const userId = Number.parseInt(id, 10)
			if (Number.isNaN(userId)) {
				return Response.json(
					{
						success: false,
						error: "Invalid user ID",
					},
					{ status: 400 }
				)
			}

			const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)

			if (user.length === 0) {
				return Response.json(
					{
						success: false,
						error: "User not found",
					},
					{ status: 404 }
				)
			}

			return Response.json({
				success: true,
				data: user[0],
				message: "User retrieved successfully",
			})
		}

		// Get all users with optional filtering
		const query = db.select().from(users)

		// Note: For production apps, you'd want to implement proper search with SQL LIKE or full-text search
		// This is a simplified version
		let allUsers = await query

		// Filter by search term if provided (client-side filtering for simplicity)
		if (search) {
			allUsers = allUsers.filter(
				(user) =>
					user.fullName.toLowerCase().includes(search.toLowerCase()) ||
					user.email.toLowerCase().includes(search.toLowerCase())
			)
		}

		// Limit results if specified
		if (limit) {
			const limitNum = Number.parseInt(limit, 10)
			if (!Number.isNaN(limitNum) && limitNum > 0) {
				allUsers = allUsers.slice(0, limitNum)
			}
		}

		const headers = new Headers()

		// Add cache headers in production
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
				data: allUsers,
				total: allUsers.length,
				message: "Users retrieved successfully",
			},
			{ headers }
		)
	} catch (error) {
		console.error("Database error:", error)
		return Response.json(
			{
				success: false,
				error: "Failed to retrieve users",
			},
			{ status: 500 }
		)
	}
}

// POST handler - create new user
export async function action({ request }: ActionFunctionArgs) {
	try {
		if (request.method !== "POST") {
			return Response.json({ success: false, error: "Method not allowed" }, { status: 405 })
		}

		const body = await request.json()
		const validatedData = createUserSchema.parse(body)

		const db = getDb()

		// Check if user with email already exists
		const existingUser = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1)

		if (existingUser.length > 0) {
			return Response.json(
				{
					success: false,
					error: "User with this email already exists",
				},
				{ status: 409 }
			)
		}

		// Create new user
		const newUser: NewUser = {
			fullName: validatedData.fullName,
			email: validatedData.email,
			password: validatedData.password,
			phone: validatedData.phone,
			createdAt: new Date(),
		}

		const [createdUser] = await db.insert(users).values(newUser).returning()

		return Response.json(
			{
				success: true,
				data: createdUser,
				message: "User created successfully",
			},
			{ status: 201 }
		)
	} catch (error) {
		// Handle validation errors
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

		// Handle JSON parsing errors
		if (error instanceof SyntaxError) {
			return Response.json(
				{
					success: false,
					error: "Invalid JSON format",
				},
				{ status: 400 }
			)
		}

		console.error("Database error:", error)
		return Response.json(
			{
				success: false,
				error: "Failed to create user",
			},
			{ status: 500 }
		)
	}
}
