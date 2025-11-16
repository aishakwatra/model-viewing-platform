"use client";

import { useState } from "react";
import bcrypt from "bcryptjs";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

export default function HashPasswordPage() {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateHash() {
    if (!password) {
      alert("Please enter a password");
      return;
    }

    setLoading(true);
    try {
      const generatedHash = await bcrypt.hash(password, 10);
      setHash(generatedHash);
    } catch (error) {
      console.error("Error generating hash:", error);
      alert("Failed to generate hash");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  }

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <h1 className="text-2xl font-bold text-brown mb-2">Password Hash Generator</h1>
        <p className="text-sm text-brown/70 mb-6">
          Generate bcrypt hashes for existing database users
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brown/80 mb-2">
              Enter Password (Plain Text)
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="e.g., password123"
              className="w-full rounded-lg border border-brown/20 bg-white px-4 py-2 text-sm text-brown placeholder-brown/50 outline-none focus:ring-2 focus:ring-gold/60"
            />
          </div>

          <Button
            variant="brown"
            onClick={generateHash}
            disabled={loading || !password}
            className="w-full"
          >
            {loading ? "Generating..." : "Generate Hash"}
          </Button>

          {hash && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brown/80 mb-2">
                  Generated Bcrypt Hash
                </label>
                <div className="relative">
                  <textarea
                    value={hash}
                    readOnly
                    rows={3}
                    className="w-full rounded-lg border border-brown/20 bg-brown/5 px-4 py-2 text-xs text-brown font-mono"
                  />
                  <Button
                    variant="gold"
                    onClick={() => copyToClipboard(hash)}
                    className="absolute top-2 right-2 text-xs px-3 py-1"
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  SQL Update Query
                </h3>
                <div className="relative">
                  <code className="block text-xs text-blue-800 bg-blue-100 p-3 rounded overflow-x-auto">
                    UPDATE users SET password_hash = '{hash}' WHERE email = 'client.johnson@corp.com';
                  </code>
                  <Button
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(
                        `UPDATE users SET password_hash = '${hash}' WHERE email = 'client.johnson@corp.com';`
                      )
                    }
                    className="absolute top-2 right-2 text-xs px-3 py-1"
                  >
                    Copy SQL
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-2">
                  📋 Instructions
                </h3>
                <ol className="text-xs text-green-800 space-y-1 list-decimal list-inside">
                  <li>Copy the SQL query above</li>
                  <li>Go to your Supabase SQL Editor</li>
                  <li>Paste and run the query</li>
                  <li>Now you can login with: <code className="bg-green-100 px-1 rounded">client.johnson@corp.com</code> and password: <code className="bg-green-100 px-1 rounded">{password}</code></li>
                </ol>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">
              ⚠️ Common Test Passwords
            </h3>
            <div className="text-xs text-yellow-800 space-y-2">
              <p>Click to auto-fill:</p>
              <div className="flex flex-wrap gap-2">
                {["password123", "test123", "admin123", "user123"].map((pwd) => (
                  <button
                    key={pwd}
                    onClick={() => setPassword(pwd)}
                    className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-yellow-900 font-mono"
                  >
                    {pwd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
