import { useState } from "react";
import { Bookmark, Download, FileText, Film, Music, Archive, Code, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Resource } from "@/types";
import { useToggleBookmark, downloadResource } from "@/hooks/useResources";

interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
}

const fileTypeConfig: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  PDF: { icon: FileText, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  DOCX: { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  DOC: { icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  VIDEO: { icon: Film, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  MP4: { icon: Film, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  MP3: { icon: Music, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  ZIP: { icon: Archive, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  CODE: { icon: Code, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
};

function getTypeConfig(fileType: string) {
  const upper = fileType?.toUpperCase() ?? "PDF";
  return fileTypeConfig[upper] ?? { icon: FileText, color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" };
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const { mutate: toggleBookmark, isPending: bookmarkPending } = useToggleBookmark();
  const [downloading, setDownloading] = useState(false);
  const config = getTypeConfig(resource.fileType);
  const Icon = config.icon;

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark({ resourceId: resource.id, bookmarked: !!resource.bookmarked });
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      await downloadResource(resource.id, resource.title);
    } catch {
      // fallback silently
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/30 hover:bg-white/[0.05] rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-violet-900/10"
    >
      {/* File type badge */}
      <div className={cn("self-start flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold mb-3", config.bg, config.color)}>
        <Icon size={12} />
        {resource.fileType?.toUpperCase()}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white/90 leading-snug mb-1.5 line-clamp-2 group-hover:text-violet-200 transition-colors">
        {resource.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed flex-1">
        {resource.description}
      </p>

      {/* Category tag */}
      <span className="self-start text-[10px] font-medium text-violet-400 bg-violet-500/10 border border-violet-500/15 rounded-full px-2 py-0.5 mb-3">
        {resource.category?.name}
      </span>

      {/* Rating & meta */}
      <div className="flex items-center gap-1 mb-3">
        <Star size={11} className="fill-amber-400 text-amber-400" />
        <span className="text-xs text-amber-400 font-medium">
          {resource.averageRating ? resource.averageRating.toFixed(1) : "—"}
        </span>
        <span className="text-[10px] text-zinc-600 ml-1">({resource.reviewCount} reviews)</span>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-[10px] text-zinc-600">
          {resource.downloadCount} downloads · {resource.fileSizeMb?.toFixed(1)} MB
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleBookmark}
            disabled={bookmarkPending}
            className={cn(
              "p-1.5 rounded-lg transition-all",
              resource.bookmarked
                ? "text-violet-400 bg-violet-500/15 hover:bg-violet-500/25"
                : "text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10"
            )}
            title={resource.bookmarked ? "Remove bookmark" : "Bookmark"}
          >
            <Bookmark size={13} className={cn(resource.bookmarked && "fill-violet-400")} />
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            title="Download"
          >
            <Download size={13} className={cn(downloading && "animate-bounce")} />
          </button>
        </div>
      </div>
    </div>
  );
}
