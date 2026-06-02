export function DeviceStatusBadge({ status }: { status: "online" | "offline" }) {
  const isOnline = status === "online";
  const dotColor = isOnline ? "bg-emerald-500" : "bg-gray-500";
  const textColor = isOnline ? "text-emerald-300" : "text-gray-400";

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${dotColor} ${isOnline ? "pulse-dot" : ""}`} />
      <span className={`text-xs font-medium ${textColor}`}>
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}
