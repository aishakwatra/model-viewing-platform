// app/profile/page.tsx (Modified)
import { Suspense } from "react";
import { ProfileClientPage } from "./ProfileClientPage";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-brown/5">
      {/* The useSearchParams hook inside ProfileClientPage 
        must be wrapped in Suspense to prevent build errors 
        during static rendering. 
      */}
      <Suspense fallback={
        <div className="mx-auto max-w-4xl px-4 py-6 md:py-10 text-center text-brown">
          Loading Profile...
        </div>
      }>
        <ProfileClientPage />
      </Suspense>
    </div>
  );
}