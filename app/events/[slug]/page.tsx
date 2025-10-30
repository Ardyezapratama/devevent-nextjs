import BookEvent from "@/app/componenst/BookEvent";
import EventCard from "@/app/componenst/EventCard";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!BASE_URL) {
	throw new Error("NEXT_BASE_URL environment variable is required");
}

const EventDetailItem = ({
	icon,
	alt,
	label,
}: {
	icon: string;
	alt: string;
	label: string;
}) => (
	<div className="flex-row-gap-2 items-center">
		<Image src={icon} alt={alt} width={17} height={17} />
		<p>{label}</p>
	</div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
	<div className="agenda">
		<h2>Agenda</h2>
		<ul>
			{agendaItems.map((item) => (
				<li key={item}> {item}</li>
			))}
		</ul>
	</div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
	<div className="flex flex-row gap-1.5 flex-wrap">
		{tags.map((tag) => (
			<div className="pill" key={tag}>
				{tag}
			</div>
		))}
	</div>
);

const EventDetailsPage = async ({
	params,
}: {
	params: Promise<{ slug: string }>;
}) => {
	"use cache";
	const { slug } = await params;
	let request;

	try {
		request = await fetch(`${BASE_URL}/api/events/${slug}`);
	} catch (error) {
		console.log("Error fetching event:", error);
		notFound();
	}
	const data = await request.json();
	if (!data || !data.event) {
		console.error("Invalid API response:", data);
		notFound();
	}
	const {
		title,
		description,
		image,
		overview,
		venue,
		location,
		date,
		time,
		mode,
		audience,
		agenda,
		organizer,
		tags,
	} = data.event;
	const booking = 10;

	const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

	if (!title) return notFound();
	return (
		<section id="event">
			<div className="header">
				<h1>{title}</h1>
				<p className="">{description}</p>
			</div>
			<div className="details">
				{/* Left Side - Event content */}
				<div className="content">
					<Image
						src={image}
						alt="Event Banner"
						width={600}
						height={600}
						className="banner"
					/>

					<section className="flex-col-gap-2">
						<h2>overview</h2>
						<p>{overview}</p>
					</section>

					<section className="flex-col-gap-2">
						<h2>Event Details</h2>
						<EventDetailItem
							icon="/icons/calendar.svg"
							alt="calendar"
							label={date}
						/>
						<EventDetailItem icon="/icons/clock.svg" alt="time" label={time} />
						<EventDetailItem
							icon="/icons/pin.svg"
							alt="venew"
							label={`${venue}, ${location}`}
						/>
						<EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
						<EventDetailItem
							icon="/icons/audience.svg"
							alt="audience"
							label={audience}
						/>
					</section>
					<section>
						<EventAgenda agendaItems={agenda} />
					</section>
					<section>
						<h2>About the Organizer</h2>
						<p>{organizer}</p>
					</section>
					<EventTags tags={tags} />
				</div>
				{/* Right Side - Booking Form */}
				<aside className="booking">
					<div className="signup-card">
						<h2>Book Your Spot</h2>
						{booking > 0 ? (
							<p className="text-sm">
								Join {booking} people who have already booked their spot!
							</p>
						) : (
							<p className="text-sm">Be the first to book your spot!</p>
						)}

						<BookEvent />
					</div>
				</aside>
			</div>

			<div className="flex w-full flex-col gap-4 pt-20">
				<h2>Similar Events</h2>
				<div className="events">
					{similarEvents.length > 0 &&
						similarEvents.map((similarEvent: IEvent) => (
							<EventCard key={similarEvent.title} {...similarEvent} />
						))}
				</div>
			</div>
		</section>
	);
};

export default EventDetailsPage;
