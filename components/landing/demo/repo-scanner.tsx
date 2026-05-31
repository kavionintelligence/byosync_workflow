"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { FileCode, Folder, AlertTriangle } from "lucide-react";
import { DEMO } from "@/lib/landing-demo-theme";

const REPO_TREE = [
  { path: "src/auth/login.ts", risk: false },
  { path: "src/auth/otp.ts", risk: false },
  { path: "src/api/users.ts", risk: true },
  { path: "src/api/payments.ts", risk: true },
  { path: "src/db/schema.ts", risk: true },
  { path: "src/consent/forms.tsx", risk: true },
  { path: "src/logs/audit.ts", risk: false },
];

interface RepoScannerProps {
  scanning: boolean;
  risksFound: number;
}

export function RepoScanner({ scanning, risksFound }: RepoScannerProps) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!scanning) {
      setRevealed(0);
      return;
    }
    setRevealed(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setRevealed(i);
      if (i >= REPO_TREE.length) clearInterval(timer);
    }, 380);
    return () => clearInterval(timer);
  }, [scanning]);

  return (
    <div
      className="relative min-h-[200px] overflow-hidden rounded-xl p-4"
      style={{ background: DEMO.panel, border: `1px solid ${DEMO.border}` }}
      aria-label="Repository scanner"
    >
      <div className="mb-3 flex items-center gap-2 border-b pb-3" style={{ borderColor: DEMO.borderLight }}>
        <Folder size={14} style={{ color: DEMO.primary }} aria-hidden />
        <span className="font-mono text-xs text-blue-700">byosync-partner-app</span>
        {scanning && (
          <motion.span
            className="ml-auto font-mono text-xs"
            style={{ color: DEMO.primary }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            scanning...
          </motion.span>
        )}
      </div>

      <div className="space-y-1.5" role="list">
        <AnimatePresence>
          {REPO_TREE.slice(0, revealed).map((file) => (
            <motion.div
              key={file.path}
              role="listitem"
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <FileCode
                size={11}
                style={{ color: file.risk ? DEMO.risk : DEMO.muted, flexShrink: 0 }}
                aria-hidden
              />
              <span className="flex-1 font-mono text-xs" style={{ color: file.risk ? DEMO.risk : DEMO.muted }}>
                {file.path}
              </span>
              {file.risk && scanning && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                  <AlertTriangle size={10} style={{ color: DEMO.risk }} aria-label="Risk detected" />
                  <span className="font-mono text-[10px]" style={{ color: DEMO.risk }}>
                    risk
                  </span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {scanning && revealed < REPO_TREE.length && (
        <motion.div
          className="pointer-events-none absolute left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${DEMO.primary}80 50%, transparent 100%)`,
          }}
          animate={{ top: ["10%", "90%"] }}
          transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          aria-hidden
        />
      )}

      {risksFound > 0 && (
        <motion.div
          className="mt-3 flex items-center gap-2 border-t pt-3"
          style={{ borderColor: "rgba(220,38,38,0.2)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertTriangle size={12} style={{ color: DEMO.risk }} aria-hidden />
          <span className="font-mono text-xs" style={{ color: DEMO.risk }}>
            {risksFound} risky files detected
          </span>
        </motion.div>
      )}
    </div>
  );
}
