"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Heart, MessageCircle, ArrowUpRight, Camera } from "lucide-react";

interface InstagramPost {
  id: string;
  image: string;
  likes: string;
  comments: string;
  url: string;
  span?: "row" | "col";
}

const POSTS: InstagramPost[] = [
  {
    id: "ig1",
    image:
      "https://images.unsplash.com/photo-1614023342667-6f060e9d1e04?q=80&w=900&auto=format&fit=crop",
    likes: "2,481",
    comments: "63",
    url: "https://instagram.com/p/placeholder1",
    span: "col",
  },
  {
    id: "ig2",
    image:
      "https://images.unsplash.com/photo-1620932934088-fbdb2920e484?q=80&w=900&auto=format&fit=crop",
    likes: "1,904",
    comments: "41",
    url: "https://instagram.com/p/placeholder2",
  },
  {
    id: "ig3",
    image:
      "https://images.unsplash.com/photo-1616805765352-beedbad46b2a?q=80&w=900&auto=format&fit=crop",
    likes: "3,120",
    comments: "88",
    url: "https://instagram.com/p/placeholder3",
  },
  {
    id: "ig4",
    image:
      "https://images.unsplash.com/photo-1533108344127-a586d2b02479?q=80&w=900&auto=format&fit=crop",
    likes: "2,760",
    comments: "52",
    url: "https://instagram.com/p/placeholder4",
  },
  {
    id: "ig5",
    image:
      "https://images.unsplash.com/photo-1612214070442-3c806a722f0b?q=80&w=900&auto=format&fit=crop",
    likes: "1,532",
    comments: "29",
    url: "https://instagram.com/p/placeholder5",
    span: "col",
  },
  {
    id: "ig6",
    image:
      "https://images.unsplash.com/photo-1546525848-3ce03ca516f6?q=80&w=900&auto=format&fit=crop",
    likes: "4,015",
    comments: "104",
    url: "https://instagram.com/p/placeholder6",
  },
];

function GalleryTile({ post, index }: { post: InstagramPost; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 ${
        post.span === "col" ? "row-span-2" : ""
      }`}
    >
      <Link
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View post on Instagram, ${post.likes} likes, ${post.comments} comments`}
        className="group relative block h-full min-h-[220px] w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
      >
        <Image
          src={post.image}
          alt="Benkasa Collection on Instagram"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0B0B0B]/0 opacity-0 backdrop-blur-0 transition-all duration-400 group-hover:bg-[#0B0B0B]/70 group-hover:opacity-100 group-hover:backdrop-blur-sm">
          <div className="flex items-center gap-5 text-white">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <Heart size={16} className="fill-[#D4AF37] text-[#D4AF37]" aria-hidden="true" />
              {post.likes}
            </span>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <MessageCircle size={16} aria-hidden="true" />
              {post.comments}
            </span>
          </div>
          <ArrowUpRight size={18} className="text-[#D4AF37]" aria-hidden="true" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function InstagramGallery() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-100px" });

  return (
    <section
      aria-labelledby="instagram-gallery-heading"
      className="relative w-full overflow-hidden bg-[#0B0B0B] px-6 py-24 sm:px-10 lg:px-16"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-[#D4AF37]/[0.06] blur-[150px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <div
          ref={headingRef}
          className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
              <Camera size={14} aria-hidden="true" />
              @benkasacollection
            </span>
            <motion.h2
              id="instagram-gallery-heading"
              initial={{ opacity: 0, y: 16 }}
              animate={headingInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="font-serif text-4xl leading-tight text-white sm:text-5xl"
            >
              Styled by Our Community
            </motion.h2>
          </div>

          <Link
            href="https://instagram.com/benkasacollection"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors duration-300 hover:border-[#D4AF37] hover:text-[#D4AF37] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
          >
            Follow on Instagram
            <ArrowUpRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <div className="grid auto-rows-[220px] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {POSTS.map((post, index) => (
            <GalleryTile key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}