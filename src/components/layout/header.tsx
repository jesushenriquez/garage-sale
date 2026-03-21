import { WelcomeIcon } from "./welcome-icon";
import type { WelcomeImage } from "@/lib/types";

interface HeaderProps {
  storeName: string;
  hasWelcome?: boolean;
  welcomeTitle?: string;
  welcomeMessage?: string;
  welcomeImages?: WelcomeImage[];
}

export function Header({ storeName, hasWelcome, welcomeTitle, welcomeMessage, welcomeImages }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-brand-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center relative">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-800 text-center">
          {storeName}
        </h1>
        {hasWelcome && (
          <div className="absolute right-4">
            <WelcomeIcon
              title={welcomeTitle || ""}
              message={welcomeMessage || ""}
              images={welcomeImages || []}
            />
          </div>
        )}
      </div>
    </header>
  );
}
