"use server";

import { Event, IEvent } from "@/database";
import connectDB from "../mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
	try {
		await connectDB();
		const event = await Event.findOne({ slug });
		if (!event) {
			return [];
		}
		const events = await Event.find({
			_id: { $ne: event._id },
			tags: { $in: event.tags },
		}).lean();

		return JSON.parse(JSON.stringify(events)) as IEvent[];
	} catch (e) {
		return [];
	}
};
