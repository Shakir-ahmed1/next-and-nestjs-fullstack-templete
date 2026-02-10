import { useState } from "react";
import { Code2, RefreshCw, X } from "lucide-react";
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

  const { data: health, refetch } = useQuery({
    queryKey: ["health-check"],
    queryFn: async (): Promise<HealthState> => {
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

      const [apiStatus, dbStatus] = await Promise.all([checkApi(), checkDb()]);

      return { api: apiStatus, db: dbStatus };
    },
    refetchOnWindowFocus: "always",
    initialData: { api: "loading", db: "loading" } as HealthState,
  });

  const hasFailure = health.api === "error" || health.db === "error";

  const isBottom = position.includes("bottom");
  const isRight = position.includes("right");

  let popupClasses = "fixed z-50 ";
  if (isBottom) {
    popupClasses += "bottom-[88px] ";
  } else {
    popupClasses += "top-[88px] ";
  }
  if (isRight) {
    popupClasses += "right-4";
  } else {
    popupClasses += "left-4";
  }

  return (
    <>
      {open && (
        <div className={popupClasses}>
          <div
            className={`
              w-64 rounded-2xl shadow-xl border p-4
              bg-white dark:bg-gray-900
              border-gray-200 dark:border-gray-700
              text-gray-900 dark:text-gray-100
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Dev Health</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => refetch()}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <StatusRow label="API" state={health.api} />
            <StatusRow label="Database" state={health.db} />

            <div className="mt-4">
              <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                Position
              </p>
              <div className="grid grid-cols-2 gap-1">
                {Object.keys(positionClasses).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPosition(p as CornerPosition)}
                    className={`
                      text-xs rounded-md border px-2 py-1 transition-colors
                      border-gray-300 dark:border-gray-600
                      hover:bg-gray-100 dark:hover:bg-gray-800
                      ${position === p
                        ? "bg-gray-200 dark:bg-gray-700 font-semibold"
                        : "bg-white dark:bg-gray-800"}
                    `}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`
          fixed z-50 ${positionClasses[position]} 
          h-14 w-14 rounded-full shadow-lg flex items-center justify-center 
          transition-all hover:scale-105 active:scale-95 border-2 border-yellow dark:border-yellow-900
          ${hasFailure
            ? "bg-red-600 hover:bg-red-700 border-red-700 dark:bg-red-700 dark:hover:bg-red-800 dark:border-red-800 text-white"
            : "bg-white hover:bg-gray-50 border-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700 text-gray-800 dark:text-gray-200"
          }
        `}
        aria-label="Developer health widget"
      >
        <Code2 className="h-6 w-6" />
      </button>
    </>
  );
}

function StatusRow({
  label,
  state,
}: {
  label: string;
  state: "ok" | "error" | "loading";
}) {
  let badge = null;

  if (state === "loading") {
    badge = (
      <span className="text-gray-500 dark:text-gray-400">Checking…</span>
    );
  } else if (state === "ok") {
    badge = (
      <span
        className="
          px-2 py-0.5 rounded-full text-xs font-medium
          bg-green-100 text-green-800
          dark:bg-green-900/40 dark:text-green-300
        "
      >
        OK
      </span>
    );
  } else {
    badge = (
      <span
        className="
          px-2 py-0.5 rounded-full text-xs font-medium
          bg-red-100 text-red-800
          dark:bg-red-900/40 dark:text-red-300
        "
      >
        Error
      </span>
    );
  }

  return (
    <div className="flex items-center justify-between text-sm mb-2">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      {badge}
    </div>
  );
}