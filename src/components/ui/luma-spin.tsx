import { cn } from "@/lib/utils";

interface LumaSpinProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const frameClass = {
  sm: "h-5 w-5",
  md: "h-[65px] w-[65px]",
  lg: "h-20 w-20",
};

const scaleClass = {
  sm: "scale-[0.31]",
  md: "scale-100",
  lg: "scale-[1.23]",
};

export const Component = ({ className, size = "md" }: LumaSpinProps) => {
  return (
    <div
      className={cn("relative shrink-0", frameClass[size], className)}
      role="status"
      aria-label="Loading"
    >
      <div
        className={cn(
          "absolute left-1/2 top-1/2 w-[65px] aspect-square -translate-x-1/2 -translate-y-1/2",
          scaleClass[size]
        )}
      >
        <span className="absolute rounded-[50px] animate-loader-anim shadow-[inset_0_0_0_3px_hsl(var(--primary))]" />
        <span className="absolute rounded-[50px] animate-loader-anim-delayed shadow-[inset_0_0_0_3px_hsl(var(--primary))]" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
};

export const LumaSpin = Component;

export default Component;
