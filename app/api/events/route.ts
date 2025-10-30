import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Event } from "@/database";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRETE,
});

if (!cloudinary.config().cloud_name) {
	throw new Error("Cloudinary credentials are not confiugred");
}

export async function POST(req: NextRequest) {
	try {
		await connectDB();

		const formData = await req.formData();

		let event;

		try {
			event = Object.fromEntries(formData.entries());
		} catch (e) {
			return NextResponse.json(
				{ message: "Invalid form data format" },
				{ status: 400 }
			);
		}
		const file = formData.get("image") as File;
		if (!file) {
			return NextResponse.json(
				{ message: "Image file is required!" },
				{ status: 400 }
			);
		}

		// let tags = JSON.parse(formData.get("tags") as string);
		// let agenda = JSON.parse(formData.get("agenda") as string);

		// Parse and validae tags
		const tagsRaw = formData.get("tags");
		if (!tagsRaw) {
			return NextResponse.json(
				{
					message: "Tags field is required!",
				},
				{ status: 400 }
			);
		}

		const agendaRaw = formData.get("agenda");
		if (!agendaRaw) {
			return NextResponse.json(
				{ message: "Agenda field is required!" },
				{ status: 400 }
			);
		}

		let tags, agenda;
		try {
			tags = JSON.parse(tagsRaw as string);
			agenda = JSON.parse(agendaRaw as string);
		} catch (error) {
			return NextResponse.json(
				{ message: "Invalid data format fro tags or agenda" },
				{ status: 400 }
			);
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const uploadResult = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{
						resource_type: "image",
						folder: "DevEvent",
					},
					(error, result) => {
						if (error) return reject(error);

						resolve(result);
					}
				)
				.end(buffer);
		});

		if (
			!uploadResult ||
			typeof uploadResult !== "object" ||
			!("secure_url" in uploadResult)
		) {
			return NextResponse.json(
				{ message: "Image upload failed - invalid response from Cloudinary" },
				{ status: 500 }
			);
		}

		event.image = (uploadResult as { secure_url: string }).secure_url;

		const createdEvent = await Event.create({
			...event,
			tags: tags,
			agenda: agenda,
		});
		return NextResponse.json(
			{
				message: "Event created successfully.",
				event: createdEvent,
			},
			{ status: 201 }
		);
	} catch (e) {
		console.log(e);
		return NextResponse.json(
			{
				message: "Event Creation Failed",
				error: e instanceof Error ? e.message : "Unknown",
			},
			{ status: 500 }
		);
	}
}

export async function GET() {
	try {
		await connectDB();
		const events = await Event.find().sort({ createdAt: -1 });
		return NextResponse.json(
			{ message: "Event fetched successfully", events },
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{ message: "Event fetching failed", error: error },
			{ status: 500 }
		);
	}
}

// A route that accept a slug as input and return the event details.
