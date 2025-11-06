// app/models/page.tsx
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { SnapshotCard } from "@/app/components/SnapshotCard";
import { ModelMeta } from "@/app/components/ModelMeta";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Avatar } from "@/app/components/Avatar";
import { FavouriteIcon } from "@/app/components/ui/Icons";
import { ModelViewer } from "@/app/components/ModelViewer";

export default function ModelsPage() {
  
  const modelPathFromDatabase = "/models/sample1/scene.gltf"; 

  return (
    <div className="bg-beige min-h-screen pb-12">
      {/* Full-width Nav Bar */}
      <div className="border-b border-brown/10 bg-white shadow-sm">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-6 md:px-8">
          <Breadcrumbs
            items={[
              { href: "/creator/dashboard", label: "Dashboard" },
              { label: "Royal Palace Wedding" },
            ]}
          />
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <label htmlFor="version-select" className="text-sm font-medium text-brown/80">
                Version:
              </label>
              <select
                id="version-select"
                className="rounded-xl border border-brown/20 bg-white px-4 py-2 text-sm text-brown outline-none focus:ring-2 focus:ring-gold/60"
              >
                <option>2.5 (Latest)</option>
                <option>2.4</option>
                <option>2.3</option>
              </select>
            </div>
            <button className="flex items-center gap-2 text-sm text-brown/70 hover:text-brown">
              <FavouriteIcon />
              Favourite
            </button>
          </div>
        </div>
      </div>

      {/* Centered Page Content */}
      <div className="mx-auto mt-6 w-full max-w-7xl space-y-6 px-6 md:px-8">
        <ModelViewer modelPath={modelPathFromDatabase} />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="p-5">
            <h2 className="text-sm font-medium text-brown mb-4">Snapshots</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SnapshotCard />
              <SnapshotCard />
              <SnapshotCard />
              <SnapshotCard />
            </div>
          </Card>
          {/* ModelMeta now uses its own static data again */}
          <ModelMeta />
        </div>
        <Card className="p-0 overflow-hidden">
           <div className="px-5 py-3 text-sm font-medium bg-brown text-white rounded-t-xl">Comments</div>
           <div className="p-5 space-y-6">
              <div className="flex gap-3">
                <Avatar name="Sarah Johnson" />
                <div className="flex-1">
                  <div className="text-sm text-brown/70">Sarah Johnson · <span>2 days ago</span></div>
                  <p className="mt-1 text-brown">
                    The mandap design looks absolutely stunning! I love the
                    intricate details on the pillars. Could we possibly adjust the
                    flower arrangements to include more marigolds?
                  </p>
                   <div className="mt-3 rounded-xl bg-brown/5 border border-brown/10 p-3">
                    <div className="text-sm text-brown/70">
                      Arjun Mehta
                      <span className="rounded-full bg-brown/10 px-2 py-0.5 text-xs ml-2">
                        Creator
                      </span>{" "}
                      · 1 day ago
                    </div>
                    <p className="mt-1 text-brown">
                      Thank you for the feedback! I&apos;ll definitely add more
                      marigolds. I&apos;ll update this in version 2.6 and notify
                      you once it&apos;s ready.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Avatar name="Rajesh Patel" />
                <div className="flex-1">
                  <div className="text-sm text-brown/70">
                    Rajesh Patel · <span>3 days ago</span>
                  </div>
                  <p className="mt-1 text-brown">
                    Perfect execution! The lighting setup creates such a beautiful
                    ambiance.
                  </p>
                </div>
              </div>

              {/* Composer */}
              <div className="flex items-start gap-3 pt-2">
                <div className="size-8 rounded-full bg-brown/10 grid place-items-center text-xs font-semibold">
                  U
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Share your thoughts about this model..."
                    className="w-full min-h-24 rounded-xl border border-brown/20 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gold/60"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button variant="brown">Post Comment</Button>
                  </div>
                </div>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}