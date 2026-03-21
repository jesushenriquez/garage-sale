interface HeaderProps {
  storeName: string;
}

export function Header({ storeName }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-brand-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-800 text-center">
          {storeName}
        </h1>
      </div>
    </header>
  );
}
