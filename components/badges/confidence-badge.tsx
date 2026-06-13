interface ConfidenceBadgeProps {
  confidence: number; // 0-1
  className?: string;
}

/**
 * High-contrast confidence pill. Color-coded by severity:
 * - >= 0.9: red (high confidence threat)
 * - >= 0.7: amber (moderate)
 * - below: slate (low)
 *
 * Uses solid backgrounds + readable text colors (not low-opacity tints)
 * so the percentage is legible on both light and dark surfaces.
 */
export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);

  let colorClasses: string;
  if (confidence >= 0.9) {
    colorClasses = "bg-red-500/15 text-red-500 border-red-500/30";
  } else if (confidence >= 0.7) {
    colorClasses = "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400";
  } else {
    colorClasses = "bg-slate-500/15 text-slate-600 border-slate-500/30 dark:text-slate-300";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${colorClasses} ${className ?? ""}`}
    >
      {pct}%
    </span>
  );
}
