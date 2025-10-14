import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "brown" | "gold" | "outline" | "ghost";
};

export function Button({ variant = "brown", className, ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
  const styles = {
    brown:  "bg-brown text-white hover:opacity-90",
    gold:   "bg-gold text-brown hover:opacity-90",
    outline:"border border-brown/20 text-brown hover:bg-brown/5",
    ghost:  "text-brown hover:bg-brown/5",
  }[variant];
  return <button className={clsx(base, styles, className)} {...props} />;
}
