import { Button } from "@/app/components/ui/Button";

export function LoginForm() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-brown">Welcome back</h2>
      <p className="text-sm text-brown/70 mt-1">Sign in to your account</p>

      <form className="mt-6 space-y-4">
        <div>
          <label htmlFor="email-login" className="block text-sm font-medium text-brown/80 mb-1">Email</label>
          <input
            id="email-login"
            type="email"
            placeholder="Enter your email"
            className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
          />
        </div>
        <div>
          <label htmlFor="password-login" className="block text-sm font-medium text-brown/80 mb-1">Password</label>
          <input
            id="password-login"
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <input id="remember-me" type="checkbox" className="rounded border-brown/30 text-brown focus:ring-gold/60" />
            <label htmlFor="remember-me" className="text-brown/80">Remember me</label>
          </div>
          <a href="#" className="font-medium text-brown hover:underline">Forgot password?</a>
        </div>
        <Button variant="brown" className="w-full !mt-6">Sign In</Button>
      </form>
    </div>
  );
}
