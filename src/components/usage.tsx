import Link from "next/link";
import { LucideCrown } from "lucide-react";
import { formatDuration, intervalToDuration } from "date-fns";
import { Button } from "./ui/button";
import { useAuth } from "@clerk/nextjs";

type UsageProps = {
  points: number;
  msBeforeNext: number;
};

export function Usage({ points, msBeforeNext }: UsageProps) {
  const { has } = useAuth();
  const hasProAccess = has?.({ plan: "pro_user" });

  const duration = intervalToDuration({
    start: new Date(),
    end: new Date(Date.now() + msBeforeNext),
  });
  return (
    <div className="rounded-t-xl bg-background border border-b-0 p-2.5">
      <div className="flex items-center gap-x-2">
        <div>
          <p className="text-sm">
            {points} {hasProAccess ? "" : "free"} credits remaining
          </p>
          <p className="text-xs text-muted-foreground">
            Resets in{" "}
            {formatDuration(duration, {
              format: ["months", "days", "hours"],
            })}
          </p>
        </div>
        {!hasProAccess ? (
          <Button asChild size="sm" variant="tertiary" className="ml-auto">
            <Link href="/pricing">
              <LucideCrown /> Upgrade
            </Link>
          </Button>
        ) : (
          <span className="ml-auto border rounded-sm border-shade px-1 text-xs text-transparen">
            Pro
            <span className="align-super text-[0.6rem] pl-[1px] text-amber-500">
              +
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
