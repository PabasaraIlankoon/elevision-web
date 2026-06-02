import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: boolean;
}

export function StatCard({ icon: Icon, label, value, accent }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-2xl font-bold mt-2 ${accent ? "text-amber-400" : "text-foreground"}`}>
            {value}
          </p>
        </div>
        <Icon className={`w-5 h-5 ${accent ? "text-amber-400/60" : "text-muted-foreground"}`} />
      </div>
    </div>
  );
}
