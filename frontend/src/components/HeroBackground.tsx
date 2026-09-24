export function HeroBackground({ url }: { url: string | null }) {
  if (!url) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <img
        src={url}
        alt=""
        className="size-full scale-105 object-cover blur-sm"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background/90" />
    </div>
  );
}