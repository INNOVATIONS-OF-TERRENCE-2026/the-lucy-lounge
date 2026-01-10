import React from "react";
import type { CinematicJob } from "../types/cinematic.types";

export const LucyQueuePanel: React.FC<{
  queued: CinematicJob[];
  running: CinematicJob[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
}> = ({ queued, running, onCancel, onRetry }) => {
  return (
    <div className="space-y-4">
      {[{ label: "Running", items: running }, { label: "Queued", items: queued }].map(
        (group) => (
          <div key={group.label}>
            <h3 className="text-white/70 text-sm mb-2">{group.label}</h3>
            <div className="space-y-2">
              {group.items.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 p-4"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{job.title}</p>
                    <p className="text-white/50 text-xs">{job.status}</p>
                  </div>
                  <div className="flex gap-2">
                    {job.status === "failed" && (
                      <button
                        onClick={() => onRetry(job.id)}
                        className="px-3 py-1 text-xs rounded bg-yellow-600 text-black"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      onClick={() => onCancel(job.id)}
                      className="px-3 py-1 text-xs rounded bg-red-600 text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};
