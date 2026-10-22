"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

/**
 * Barra fina no topo que aparece ao clicar num link interno e some quando a
 * nova rota termina de carregar.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => setLoading(false), [pathname, search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      setLoading(true);
    };
    const onStart = () => setLoading(true);
    document.addEventListener("click", onClick);
    window.addEventListener("dash:navigate", onStart);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("dash:navigate", onStart);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-gradient-to-r from-[#ff6b2c] via-[#e10600] to-[#ff6b2c] shadow-[0_0_12px_#ff6b2c]"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.85, transition: { duration: 8, ease: [0.1, 0.8, 0.2, 1] } }}
          exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.35 } }}
        />
      )}
    </AnimatePresence>
  );
}
