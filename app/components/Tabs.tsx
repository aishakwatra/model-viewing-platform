"use client";
import { useState } from "react";

type Tab = { key: string; label: string };

export function Tabs({ tabs, defaultKey, onChange }: { tabs: Tab[]; defaultKey: string; onChange?: (k: string)=>void }) {
  const [active, setActive] = useState(defaultKey);
  return (
    <div className="w-full">
      <div className="flex items-center gap-6 border-b border-brown/20">
        {tabs.map(t => (
          <button
            key={t.key}
            className={[
              "py-3 text-sm font-medium",
              active === t.key ? "text-white bg-brown rounded-t-xl px-4 -mb-px" : "text-brown/70 hover:text-brown"
            ].join(" ")}
            onClick={() => { setActive(t.key); onChange?.(t.key); }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* expose active via onChange; page decides what to show */}
    </div>
  );
}
