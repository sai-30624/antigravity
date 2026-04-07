import { useState } from "react";
import { X, Download, Bookmark, FileText, Star, User, Calendar } from "lucide-react";
import { useResource, useReviews, useAddReview, useToggleBookmark, downloadResource } from "@/hooks/useResources";
import { StarRating } from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ResourceDetailModalProps {
  resourceId: number;
  onClose: () => void;
}

export function ResourceDetailModal({ resourceId, onClose }: ResourceDetailModalProps) {
  const { data: resource, isLoading } = useResource(resourceId);
  const { data: reviews = [] } = useReviews(resourceId);
  const { mutate: addReview, isPending: submitting } = useAddReview(resourceId);
  const { mutate: toggleBookmark } = useToggleBookmark();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setReviewError("Please select a rating."); return; }
    setReviewError("");
    addReview({ rating, comment }, { onSuccess: () => { setRating(0); setComment(""); } });
  };

  const handleDownload = async () => {
    if (!resource) return;
    setDownloading(true);
    try { await downloadResource(resource.id, resource.title); }
    finally { setDownloading(false); }
  };

  const isPdf = resource?.fileType?.toLowerCase() === "pdf";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0d0e1a] border border-white/10 rounded-2xl shadow-2xl shadow-violet-950/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0d0e1a]/95 backdrop-blur-xl">
          <h2 className="text-base font-semibold text-white/90 truncate pr-4">
            {isLoading ? "Loading…" : resource?.title}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resource ? (
          <div className="p-6 space-y-6">
            {/* Meta row */}
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-xs font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">
                {resource.category?.name}
              </span>
              <span className="text-xs font-mono text-zinc-500 bg-white/5 rounded-full px-3 py-1">
                {resource.fileType?.toUpperCase()} · {resource.fileSizeMb?.toFixed(1)} MB
              </span>
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Download size={11} /> {resource.downloadCount} downloads
              </span>
              <div className="flex items-center gap-1.5 ml-auto">
                <StarRating value={resource.averageRating ?? 0} readonly size={14} />
                <span className="text-xs text-amber-400 font-medium">
                  {resource.averageRating ? resource.averageRating.toFixed(1) : "No ratings"}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-zinc-400 leading-relaxed">{resource.description}</p>

            {/* Tags */}
            {resource.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((t) => (
                  <span key={t.id} className="text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 rounded-full px-2.5 py-0.5">
                    #{t.name}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] transition-all"
              >
                <Download size={15} className="mr-2" />
                {downloading ? "Downloading…" : "Download"}
              </Button>
              <Button
                variant="outline"
                onClick={() => toggleBookmark({ resourceId: resource.id, bookmarked: !!resource.bookmarked })}
                className={cn(
                  "border-white/10 bg-white/5 hover:bg-white/10 transition-all",
                  resource.bookmarked ? "text-violet-400 border-violet-500/30" : "text-zinc-400"
                )}
              >
                <Bookmark size={15} className={cn(resource.bookmarked && "fill-violet-400")} />
              </Button>
              {isPdf && resource.fileUrl && (
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 transition-all"
                >
                  <FileText size={15} className="mr-2" />
                  {showPreview ? "Hide Preview" : "Preview"}
                </Button>
              )}
            </div>

            {/* PDF Preview */}
            {showPreview && isPdf && resource.fileUrl && (
              <div className="rounded-xl overflow-hidden border border-white/5 h-96">
                <iframe
                  src={`http://localhost:8081${resource.fileUrl}`}
                  className="w-full h-full bg-white"
                  title="PDF Preview"
                />
              </div>
            )}

            {/* Uploader info */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white/[0.02] rounded-lg px-4 py-3 border border-white/5">
              <User size={12} />
              <span>Uploaded by <span className="text-zinc-300 font-medium">{resource.uploader?.name}</span></span>
              <span className="mx-1">·</span>
              <Calendar size={12} />
              <span>{resource.createdAt ? format(new Date(resource.createdAt), "MMM d, yyyy") : "—"}</span>
            </div>

            {/* Reviews section */}
            <div>
              <h3 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
                <Star size={14} className="text-amber-400" />
                Reviews & Ratings
                <span className="text-xs text-zinc-600 font-normal">({reviews.length})</span>
              </h3>

              {/* Add Review Form */}
              <form onSubmit={handleReviewSubmit} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-5 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">Your rating:</span>
                  <StarRating value={rating} onChange={setRating} size={18} />
                </div>
                {reviewError && <p className="text-xs text-red-400">{reviewError}</p>}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this resource…"
                  rows={3}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none transition-colors"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                  className="bg-violet-600/80 hover:bg-violet-600 text-white w-full"
                >
                  {submitting ? "Submitting…" : "Submit Review"}
                </Button>
              </form>

              {/* Review list */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {reviews.length === 0 ? (
                  <p className="text-xs text-zinc-600 text-center py-4">No reviews yet. Be the first!</p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                            {r.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-zinc-300">{r.user?.name}</span>
                        </div>
                        <StarRating value={r.rating} readonly size={12} />
                      </div>
                      {r.comment && <p className="text-xs text-zinc-500 leading-relaxed">{r.comment}</p>}
                      <p className="text-[10px] text-zinc-700 mt-2">
                        {r.createdAt ? format(new Date(r.createdAt), "MMM d, yyyy") : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-zinc-500 py-12">Resource not found.</p>
        )}
      </div>
    </div>
  );
}
