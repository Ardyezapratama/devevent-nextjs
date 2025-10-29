import { events } from "@/lib/constants";
import EventCard from "./componenst/EventCard";
import ExploreBtn from "./componenst/ExploreBtn";

function Page() {
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
						{events.map((event) => (
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
