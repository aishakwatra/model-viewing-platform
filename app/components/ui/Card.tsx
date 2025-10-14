import clsx from "clsx";
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-2xl border border-brown/10 bg-white shadow-[0_8px_30px_rgba(92,32,25,0.06)]", className)} {...props} />;
}
