import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Info,
  Loader2,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type ToastTone = "success" | "warning" | "error" | "info" | "loading";

type ToastAction = {
  label: string;
  onClick?: () => void;
  emphasis?: "primary" | "secondary";
};

type ToastInput = {
  id?: string;
  tone: ToastTone;
  title: string;
  description?: string;
  duration?: number | null;
  action?: ToastAction;
  secondaryAction?: ToastAction;
  dismissible?: boolean;
};

type ToastRecord = Omit<ToastInput, "id"> & {
  id: string;
  createdAt: number;
  duration: number | null;
  dismissible: boolean;
};

type ToastUpdate = Partial<Omit<ToastInput, "id">>;

type ToastContextValue = {
  toasts: ToastRecord[];
  showToast: (input: ToastInput) => string;
  updateToast: (id: string, update: ToastUpdate) => void;
  dismissToast: (id: string) => void;
  success: (input: Omit<ToastInput, "tone">) => string;
  warning: (input: Omit<ToastInput, "tone">) => string;
  error: (input: Omit<ToastInput, "tone">) => string;
  info: (input: Omit<ToastInput, "tone">) => string;
  loading: (input: Omit<ToastInput, "tone">) => string;
};

const defaultDurations: Record<ToastTone, number | null> = {
  success: 4200,
  warning: 5600,
  error: 0,
  info: 4800,
  loading: 0,
};

const toastStyles: Record<
  ToastTone,
  {
    icon: LucideIcon;
    iconClassName: string;
    cardClassName: string;
    eyebrow: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClassName: "text-success",
    eyebrow: "Completed",
    cardClassName:
      "border-[rgba(142,234,69,0.26)] bg-[linear-gradient(180deg,rgba(142,234,69,0.12),rgba(13,23,30,0.92)_55%)]",
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: "text-warning",
    eyebrow: "Needs Review",
    cardClassName:
      "border-[rgba(245,165,36,0.26)] bg-[linear-gradient(180deg,rgba(245,165,36,0.12),rgba(13,23,30,0.92)_55%)]",
  },
  error: {
    icon: XCircle,
    iconClassName: "text-danger",
    eyebrow: "Failed",
    cardClassName:
      "border-[rgba(255,77,69,0.26)] bg-[linear-gradient(180deg,rgba(255,77,69,0.12),rgba(13,23,30,0.92)_55%)]",
  },
  info: {
    icon: Info,
    iconClassName: "text-info",
    eyebrow: "System Update",
    cardClassName:
      "border-[rgba(77,157,255,0.26)] bg-[linear-gradient(180deg,rgba(77,157,255,0.12),rgba(13,23,30,0.92)_55%)]",
  },
  loading: {
    icon: Loader2,
    iconClassName: "text-info",
    eyebrow: "In Progress",
    cardClassName:
      "border-[rgba(77,157,255,0.26)] bg-[linear-gradient(180deg,rgba(77,157,255,0.12),rgba(13,23,30,0.92)_55%)]",
  },
};

const ToastContext = createContext<ToastContextValue | null>(null);

function makeToastId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeToast(input: ToastInput | (ToastRecord & { id: string })): ToastRecord {
  return {
    id: input.id ?? makeToastId(),
    tone: input.tone,
    title: input.title,
    description: input.description,
    duration:
      input.duration === undefined
        ? defaultDurations[input.tone]
        : input.duration === 0
          ? null
          : input.duration,
    action: input.action,
    secondaryAction: input.secondaryAction,
    dismissible: input.dismissible ?? input.tone !== "loading",
    createdAt: "createdAt" in input ? input.createdAt : Date.now(),
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissToast = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((current) => current.filter((toast) => toast.id !== id));
    },
    [clearTimer],
  );

  const scheduleDismiss = useCallback(
    (toast: ToastRecord) => {
      clearTimer(toast.id);
      if (!toast.duration || typeof window === "undefined") return;

      const timer = window.setTimeout(() => {
        dismissToast(toast.id);
      }, toast.duration);

      timersRef.current.set(toast.id, timer);
    },
    [clearTimer, dismissToast],
  );

  const showToast = useCallback(
    (input: ToastInput) => {
      const toast = normalizeToast(input);
      setToasts((current) => [...current.filter((item) => item.id !== toast.id), toast].slice(-6));
      scheduleDismiss(toast);
      return toast.id;
    },
    [scheduleDismiss],
  );

  const updateToast = useCallback(
    (id: string, update: ToastUpdate) => {
      setToasts((current) =>
        current.map((toast) => {
          if (toast.id !== id) return toast;

          const next = normalizeToast({
            ...toast,
            ...update,
            id,
            createdAt: toast.createdAt,
          });
          scheduleDismiss(next);
          return next;
        }),
      );
    },
    [scheduleDismiss],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const withTone = useCallback(
    (tone: ToastTone, input: Omit<ToastInput, "tone">) => showToast({ ...input, tone }),
    [showToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      showToast,
      updateToast,
      dismissToast,
      success: (input) => withTone("success", input),
      warning: (input) => withTone("warning", input),
      error: (input) => withTone("error", input),
      info: (input) => withTone("info", input),
      loading: (input) => withTone("loading", input),
    }),
    [dismissToast, showToast, toasts, updateToast, withTone],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 sm:px-5 sm:pb-4 lg:justify-end lg:px-6 lg:pb-5">
      <div className="flex w-full max-w-full flex-col gap-3 lg:w-auto lg:flex-row lg:flex-wrap">
        {toasts.map((toast) => {
          const style = toastStyles[toast.tone];
          const Icon = style.icon;
          const isLoading = toast.tone === "loading";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full rounded-xl border px-4 py-3 shadow-[0_20px_55px_rgba(0,0,0,0.32)] backdrop-blur-sm sm:max-w-[360px] lg:w-[292px] ${style.cardClassName}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-black/10 ${style.iconClassName}`}
                >
                  <Icon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
                    {style.eyebrow}
                  </div>
                  <div className="mt-1 text-[12px] font-semibold leading-tight text-text-primary">
                    {toast.title}
                  </div>
                  {toast.description && (
                    <div className="mt-1 text-[10.5px] leading-relaxed text-text-secondary">
                      {toast.description}
                    </div>
                  )}
                  {(toast.action || toast.secondaryAction) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {toast.action && (
                        <button
                          type="button"
                          onClick={toast.action.onClick}
                          className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[10.5px] font-medium transition-colors ${
                            toast.action.emphasis === "secondary"
                              ? "border border-hairline bg-surface-2 text-text-primary hover:bg-surface-hover"
                              : "border border-lime/45 bg-lime/[0.14] text-lime hover:bg-lime/[0.22]"
                          }`}
                        >
                          {toast.action.label}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {toast.secondaryAction && (
                        <button
                          type="button"
                          onClick={toast.secondaryAction.onClick}
                          className="inline-flex h-8 items-center rounded-md border border-hairline bg-surface-2 px-3 text-[10.5px] text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                        >
                          {toast.secondaryAction.label}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {toast.dismissible && (
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    aria-label="Dismiss notification"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-transparent text-text-muted transition-colors hover:border-hairline hover:bg-surface-2 hover:text-text-primary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
