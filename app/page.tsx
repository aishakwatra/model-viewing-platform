// app/page.tsx
import { supabase } from "../lib/supabase";

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
    </main>
  );
}
