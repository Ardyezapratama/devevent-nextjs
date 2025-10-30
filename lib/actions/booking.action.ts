"use server";
import { Booking } from "@/database";
import connectDB from "../mongodb";

export const createBooking = async ({
	eventId,
	slug,
	email,
}: {
	eventId: string;
	slug: string;
	email: string;
}) => {
	try {
		await connectDB();
		const booking = await Booking.create({ eventId, slug, email });

		return { success: true };
	} catch (error) {
		console.error("Create booking failed", error);
		return { success: false };
	}
};
