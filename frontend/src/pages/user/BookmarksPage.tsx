import { useState } from "react";
import { Bookmark, Search, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ResourceCard } from "@/components/ResourceCard";
import { ResourceDetailModal } from "@/components/ResourceDetailModal";
import { useBookmarks } from "@/hooks/useResources";

export default function BookmarksPage() {
  const { data: bookmarks = [], isLoading } = useBookmarks();
  const [search, setSearch] = useState("");
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);

  const filtered = bookmarks.filter((b) =>
    b.resource.title.toLowerCase().includes(search.toLowerCase()) ||
    b.resource.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Bookmark size={22} className="text-violet-400" />
            <h1 className="text-2xl font-bold text-white/90">Bookmarks</h1>
          </div>
          <p className="text-sm text-zinc-500">
            {bookmarks.length} saved resource{bookmarks.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookmarks…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 transition-all"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={24} className="animate-spin text-violet-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
              <Bookmark size={24} className="text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-400">
              {search ? "No bookmarks match your search" : "No bookmarks yet"}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              {search ? "Try a different search term" : "Browse the library and bookmark resources to access them quickly"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((b) => (
              <ResourceCard
                key={b.id}
                resource={{ ...b.resource, bookmarked: true }}
                onClick={() => setSelectedResourceId(b.resource.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedResourceId !== null && (
        <ResourceDetailModal
          resourceId={selectedResourceId}
          onClose={() => setSelectedResourceId(null)}
        />
      )}
    </AppLayout>
  );
}
