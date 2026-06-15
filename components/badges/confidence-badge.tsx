interface ConfidenceBadgeProps {
  confidence: number; // 0-1
  className?: string;
}

/**
 * High-contrast confidence pill. Color-coded by severity:
 * - >= 0.9: red (high confidence threat)
 * - >= 0.7: blue (moderate)
 * - below: slate (low)
 */
export function ConfidenceBadge({
  confidence,
  className,
}: ConfidenceBadgeProps) {
  const pct = Math.round(confidence * 100);

  let colorClasses: string;
  if (confidence >= 0.9) {
    colorClasses =
      "bg-red-500/15 text-red-600 border-red-500/30 dark:text-red-500";
  } else if (confidence >= 0.7) {
    colorClasses =
      "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-600";
  } else {
    colorClasses =
      "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-500";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${colorClasses} ${className ?? ""}`}
    >
      {pct}%
    </span>
  );
}
