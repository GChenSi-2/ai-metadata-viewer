"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type ToastKind = "neutral" | "success" | "error";

interface ToastState {
  id: number;
  text: string;
  kind: ToastKind;
}

interface ToastApi {
  show: (text: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(Ctx);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const counter = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, kind: ToastKind = "neutral") => {
    counter.current += 1;
    setToast({ id: counter.current, text, kind });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 1500);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const tone =
    toast?.kind === "error"
      ? "bg-rose-600 text-white"
      : toast?.kind === "success"
      ? "bg-emerald-600 text-white"
      : "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900";

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-6 flex justify-center px-4 z-50"
      >
        {toast && (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-md px-4 py-2 text-sm shadow-lg ${tone} toast-in`}
          >
            {toast.text}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
