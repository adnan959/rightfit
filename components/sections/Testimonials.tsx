"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimateOnScroll } from "@/components/ui/AnimateOnScroll";

interface Testimonial {
  name: string;
  avatar: string;
  time: string;
  message: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah K.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    time: "2 days ago",
    message:
      "Got 3 interview callbacks in the first week after the rewrite! I couldn't believe the difference.",
  },
  {
    name: "James O.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    time: "5 days ago",
    message:
      "I was mass-applying and hearing nothing. Two days after using my new CV, I had 2 recruiter calls booked.",
  },
  {
    name: "Priya M.",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    time: "1 week ago",
    message:
      "Honestly didn't expect this much difference for $30. My CV actually reads like me now, just sharper.",
  },
  {
    name: "Daniel R.",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    time: "3 days ago",
    message:
      "Naba completely restructured my CV and now hiring managers actually comment on how clear it is.",
  },
  {
    name: "Aisha T.",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    time: "1 week ago",
    message:
      "I'd been stuck for months. Got my rewritten CV back on Tuesday, had an interview by Thursday.",
  },
  {
    name: "Marcus L.",
    avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    time: "4 days ago",
    message:
      "Worth every penny. The before/after was embarrassing — I can't believe I was sending that old version out.",
  },
  {
    name: "Emma W.",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    time: "6 days ago",
    message:
      "Finally got a response from a company I'd applied to 3 times before. The only thing I changed was my CV.",
  },
  {
    name: "Raj P.",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    time: "2 days ago",
    message:
      "As a career changer, I had no idea how to position my experience. Naba nailed it. Recruiter said my CV stood out.",
  },
  {
    name: "Olivia S.",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    time: "1 week ago",
    message:
      "Super fast turnaround and it didn't feel like a template. It actually sounds like me, just way more polished.",
  },
  {
    name: "Tom H.",
    avatar: "https://randomuser.me/api/portraits/men/62.jpg",
    time: "5 days ago",
    message:
      "I was skeptical but the restructured bullets made my experience look so much stronger. Already got 2 interviews.",
  },
];

const TestimonialCard = ({ name, avatar, time, message }: Testimonial) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "bg-white border border-border shadow-soft"
      )}
    >
      <div className="flex flex-row items-start gap-3">
        <img
          className="h-10 w-10 rounded-full border-2 border-white flex-shrink-0"
          src={avatar}
          width={40}
          height={40}
          alt={name}
        />
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre">
            <span className="text-sm font-semibold text-navy">{name}</span>
            <span className="mx-1 text-navy-light">·</span>
            <span className="text-xs text-navy-light">{time}</span>
          </figcaption>
          <p className="text-sm text-navy-light mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </figure>
  );
};

export function Testimonials() {
  return (
    <section className="py-12 md:py-16 px-4">
      <AnimateOnScroll>
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold text-navy text-center leading-tight mb-4">
            What people are saying
          </h2>
          <p className="text-lg text-navy-light text-center mb-10">
            Real messages from real people after their CV rewrite.
          </p>

          <div className="relative flex justify-center">
            <AnimatedList className="max-h-[400px] w-full max-w-[420px]" delay={2000}>
              {testimonials.map((t, idx) => (
                <TestimonialCard key={idx} {...t} />
              ))}
            </AnimatedList>

            {/* Bottom fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background to-transparent" />
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
