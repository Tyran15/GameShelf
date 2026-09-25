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
      className="pointer-events-none absolute inset-0 z-0 m-0! overflow-hidden"
      aria-hidden
    >
      <img
        src={url}
        alt=""
        className="size-full object-cover blur-sm"
        onError={onError}
        onLoad={onLoad}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-0% via-background/60 via-70% to-background/95 to-100%" />
    </div>
  );
}