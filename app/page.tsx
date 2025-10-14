// app/page.tsx
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default async function Home() {
  const { data, error } = await supabase.from("projects").select("id").limit(9999);

  return (
    <main className="p-8">
      <h1>Supabase Connection Test</h1>
      {error ? (
        <p style={{ color: "red" }}>❌ Connection failed: {error.message}</p>
      ) : (
        <p style={{ color: "green" }}>✅ Connected! Found {data?.length ?? 0} rows in Projects table.</p>
      )}

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
      </div>
      
    </main>
  );
}

