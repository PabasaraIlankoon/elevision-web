export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  
  let bgColor = "bg-red-500/20 text-red-300";
  if (confidence > 0.85) {
    bgColor = "bg-emerald-500/20 text-emerald-300";
  } else if (confidence > 0.7) {
    bgColor = "bg-amber-500/20 text-amber-300";
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-mono ${bgColor}`}>
      {percentage}%
    </span>
  );
}
