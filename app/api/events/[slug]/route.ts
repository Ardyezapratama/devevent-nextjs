import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database";
import connectDB from "@/lib/mongodb";

// Define route params type
type RouterParams = {
	params: Promise<{
		slug: string;
	}>;
};

/**
 * Get /api/events/[slug]
 * Fetched a single event by its slug
 */

export async function GET(reg: NextRequest, { params }: RouterParams) {
	try {
		// Connecting to mongoDB
		await connectDB();

		// Await extract slug from params
		const { slug } = await params;

		// Validate slug params
		if (!slug || typeof slug !== "string" || slug.trim() === "") {
			return NextResponse.json(
				{ message: "Invalid or missing slug parameter!" },
				{ status: 400 }
			);
		}

		// Sanitaize slug (remove any potential malicious input)
		const sanitizedSLug = slug.trim().toLowerCase();

		// Query event by slug
		const event = await Event.findOne({ slug: sanitizedSLug }).lean();

		// Handle event not found
		if (!event) {
			return NextResponse.json(
				{ message: `Event with slug '${sanitizedSLug}' not found!` },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ message: "Event fetched successfully!", event },
			{ status: 200 }
		);
	} catch (e) {
		// Log error debuging (only for development)
		if (process.env.NODE_ENV === "development") {
			console.error("Error fetching events by slug: ", e);
		}

		// Handle spesific error types
		if (e instanceof Error) {
			// Handle database connection error
			if (e.message.includes("MONGODB_URI")) {
				return NextResponse.json(
					{ message: "Database configuration error!" },
					{ status: 500 }
				);
			}

			// Return generic error with error message
			return NextResponse.json(
				{
					message: "Failed fetched events!",
					error: e.message,
				},
				{ status: 500 }
			);
		}

		// Handle unknown errors
		return NextResponse.json(
			{ message: "An unexpected error occured!" },
			{ status: 500 }
		);
	}
}
