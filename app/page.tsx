// app/page.tsx
import Link from "next/link";

export default async function Home() {

  return (
    <main className="p-8">      

      <div className="mt-6 flex gap-4">
        <Link href="/P_ClientDashboard">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Go to Client Dashboard
          </button>
        </Link>
        
        <Link href="/P_AdminDashboard">
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
            Go to Admin Dashboard
          </button>
        </Link>

        {/* --- NEW BUTTONS ADDED BELOW --- */}

        <Link href="/creator/dashboard">
          <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
            Creator Dashboard
          </button>
        </Link>

        <Link href="/auth">
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            Auth Page
          </button>
        </Link>
        
        <Link href="/models">
          <button className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors">
            Model Viewer
          </button>
        </Link>
      </div>
      
    </main>
  );
}