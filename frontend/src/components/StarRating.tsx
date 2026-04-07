import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  onChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export function StarRating({ value, max = 5, onChange, size = 16, readonly = false }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < display;
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(i + 1)}
            onMouseEnter={() => !readonly && setHovered(i + 1)}
            onMouseLeave={() => !readonly && setHovered(null)}
            className={cn(
              "transition-colors",
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"
            )}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-600"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
