import Link from "next/link";

type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm text-brown/70">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-brown/30">›</span>}
            {c.href ? (
              <Link className="hover:underline" href={c.href}>
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-brown">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}