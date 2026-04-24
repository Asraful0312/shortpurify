"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "pending" | "in_progress" | "complete" | "failed";

interface Step {
  label: string;
  description: string;
  status: StepStatus;
}

const stepIcon = (status: StepStatus) => {
  switch (status) {
    case "complete":
      return <CheckCircle2 size={20} className="text-green-600" />;
    case "in_progress":
      return <Loader2 size={20} className="text-primary animate-spin" />;
    case "failed":
      return <XCircle size={20} className="text-red-500" />;
    default:
      return <Circle size={20} className="text-border" />;
  }
};

interface ProcessingStatusProps {
  steps?: Step[];
}

const DEFAULT_STEPS: Step[] = [
  {
    label: "Transcription",
    description: "Speech-to-text with timestamps",
    status: "in_progress",
  },
  {
    label: "AI Analysis",
    description: "Claude extracts viral moments & captions",
    status: "pending",
  },
  {
    label: "Smart Clips",
    description: "AI face-tracking crop & encoding",
    status: "pending",
  },
];

export function ProcessingStatus({ steps = DEFAULT_STEPS }: ProcessingStatusProps) {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="font-extrabold text-base mb-5">Processing Pipeline</h3>
      <ol className="relative">
        {steps.map((step, i) => (
          <li key={step.label} className="flex gap-4 relative">
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-[9px] top-7 w-0.5 h-full -mb-2",
                  step.status === "complete" ? "bg-green-200" : "bg-border"
                )}
              />
            )}

            <div className="shrink-0 mt-0.5 bg-white size-5 rounded-full">{stepIcon(step.status)}</div>
            <div className={cn("pb-6", i === steps.length - 1 && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-bold",
                  step.status === "pending" && "text-muted-foreground",
                  step.status === "in_progress" && "text-primary",
                  step.status === "complete" && "text-foreground",
                  step.status === "failed" && "text-red-600"
                )}
              >
                {step.label}
                {step.status === "in_progress" && (
                  <span className="ml-2 text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    Running
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
