
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  label?: string;
}

const ProgressBar = ({
  value,
  max,
  className,
  barClassName,
  showLabel = false,
  label,
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1 text-sm">
          <span>{label || "Progress"}</span>
          <span className="text-muted-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
        <div
          className={cn("h-full transition-all duration-300 ease-out", barClassName || "bg-primary")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
