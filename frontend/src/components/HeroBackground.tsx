export function HeroBackground({
  url,
  onError,
  onLoad,
}: {
  url: string | null;
  onError?: () => void;
  onLoad?: () => void;
}) {
  if (!url) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <img
        src={url}
        alt=""
        className="size-full object-cover blur-md"
        onError={onError}
        onLoad={onLoad}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-0% via-background/40 via-60% to-background/90 to-100%" />
    </div>
  );
}