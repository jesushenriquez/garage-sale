import { Clock } from "lucide-react";
import type { PickupScheduleBlock } from "@/lib/types";

interface PickupScheduleDisplayProps {
  schedule: PickupScheduleBlock[];
  className?: string;
}

export function PickupScheduleDisplay({ schedule, className }: PickupScheduleDisplayProps) {
  if (schedule.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-start gap-1.5">
        <Clock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          {schedule.map((block, index) => (
            <p key={index} className="text-xs">
              {block.days}: {block.start_time} - {block.end_time}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
