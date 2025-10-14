export function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();
  return (
    <div className="size-8 rounded-full bg-brown/10 text-brown grid place-items-center text-xs font-semibold">
      {initials}
    </div>
  );
}
