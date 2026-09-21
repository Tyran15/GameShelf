import logoImg from "@/assets/icon.png";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logoImg}
      alt="GameShelf"
      className={className}
    />
  );
}