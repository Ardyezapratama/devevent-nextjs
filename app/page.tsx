import { cacheLife } from "next/cache";
import EventCard from "./componenst/EventCard";
import ExploreBtn from "./componenst/ExploreBtn";
import { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function Page() {
	"use cache";
	cacheLife("hours");

	let events = [];

	try {
		if (!BASE_URL) {
			throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
		}
		const response = await fetch(`${BASE_URL}/api/events`);
		if (!response.ok) {
			throw new Error(`Failed to fetch events: ${response.statusText}`);
		}
		const data = await response.json();
		events = data.events || [];
	} catch (error) {
		console.log("Error fetching events:", error);
	}
	return (
		<>
			<section className="mt-20">
				<h1 className="text-center">
					The Hub for Every Dev <br /> Event You Can't Miss.
				</h1>
				<p className="text-center">
					Hackathons, Meetups, and Conferences, All in One Place
				</p>
				<ExploreBtn />
			</section>
			<section id="event">
				<div className="mt-20 space-y-7">
					<h3>Featured Event.</h3>

					<ul className="events">
						{events &&
							events.length > 0 &&
							events.map((event: IEvent) => (
								<li key={event.title} className="list-none">
									<EventCard {...event} />
								</li>
							))}
					</ul>
				</div>
			</section>
		</>
	);
}

export default Page;
