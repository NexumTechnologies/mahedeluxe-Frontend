"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ScreenModalProps = {
  open: boolean;
  children: React.ReactNode;
};

export default function ScreenModal({ open, children }: ScreenModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [mounted, open]);

  if (!mounted || !open) return null;

  return createPortal(children, document.body);
}