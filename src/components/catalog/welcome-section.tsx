"use client";

import { WelcomeModal } from "./welcome-modal";
import type { WelcomeImage } from "@/lib/types";

interface WelcomeSectionProps {
  title: string;
  message: string;
  images: WelcomeImage[];
}

export function WelcomeSection({ title, message, images }: WelcomeSectionProps) {
  return (
    <WelcomeModal
      title={title}
      message={message}
      images={images}
    />
  );
}
