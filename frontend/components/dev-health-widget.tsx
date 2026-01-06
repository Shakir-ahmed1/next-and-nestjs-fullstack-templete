import { useState } from "react";
import { Code2, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export type CornerPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";

interface DevHealthWidgetProps {
    defaultPosition?: CornerPosition;
}

interface HealthState {
    api: "ok" | "error" | "loading";
    db: "ok" | "error" | "loading";
}

const positionClasses: Record<CornerPosition, string> = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
};

export default function DevHealthWidget({
    defaultPosition = "top-right",
}: DevHealthWidgetProps) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<CornerPosition>(defaultPosition);

    // Use React Query to check health status every 5 seconds
    const { data: health } = useQuery({
        queryKey: ["health-check"],
        queryFn: async (): Promise<HealthState> => {
            // Check each endpoint independently to avoid one failure affecting the other
            const checkApi = async (): Promise<"ok" | "error"> => {
                try {
                    const res = await api.get(`/health`);
                    return res.data.status === "ok" ? "ok" : "error";
                } catch {
                    return "error";
                }
            };

            const checkDb = async (): Promise<"ok" | "error"> => {
                try {
                    const res = await api.get(`/health/db`);
                    return res.data.status === "ok" ? "ok" : "error";
                } catch {
                    return "error";
                }
            };

            // Run both checks in parallel but handle errors independently
            const [apiStatus, dbStatus] = await Promise.all([
                checkApi(),
                checkDb(),
            ]);

            return {
                api: apiStatus,
                db: dbStatus,
            };
        },
        refetchInterval: 5000, // Poll every 5 seconds
        refetchIntervalInBackground: true, // Continue polling even when tab is not focused
        initialData: { api: "loading", db: "loading" } as HealthState,
    });

    // Determine if there's any failure
    const hasFailure = health.api === "error" || health.db === "error";

    return (
        <div className={`fixed z-50 ${positionClasses[position]}`}>
            {/* Panel */}
            {open && (
                <div className="mb-3 w-64 rounded-2xl bg-white shadow-xl border p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold">Dev Health</h3>
                        <button onClick={() => setOpen(false)}>
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <StatusRow label="API" state={health.api} />
                    <StatusRow label="Database" state={health.db} />

                    <div className="mt-4">
                        <p className="text-xs font-medium mb-1">Position</p>
                        <div className="grid grid-cols-2 gap-1">
                            {Object.keys(positionClasses).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPosition(p as CornerPosition)}
                                    className={`text-xs rounded-md border px-2 py-1 hover:bg-gray-50 ${position === p ? "bg-gray-100 font-semibold" : ""
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setOpen(!open)}
                className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-colors ${hasFailure
                    ? "bg-red-500 border-red-600 border-2"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                    }`}
                aria-label="Developer health widget"
            >
                <Code2 className={`h-6 w-6 ${hasFailure ? "text-white" : ""}`} />
            </button>
        </div>
    );
}

function StatusRow({
    label,
    state,
}: {
    label: string;
    state: "ok" | "error" | "loading";
}) {
    return (
        <div className="flex items-center justify-between text-sm mb-2">
            <span>{label}</span>
            {state === "loading" && <span className="text-gray-400">Checking…</span>}
            {state === "ok" && (
                <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs">OK</span>
            )}
            {state === "error" && (
                <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-xs">Error</span>
            )}
        </div>
    );
}
