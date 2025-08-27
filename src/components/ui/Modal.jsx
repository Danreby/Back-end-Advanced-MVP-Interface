import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useLockBodyScroll from "../../Hooks/useLockBodyScroll";

export default function Modal({ isOpen, onClose, children, size = "md", ariaLabelledBy }) {
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const previousActive = document.activeElement;

    const timer = setTimeout(() => {
      if (dialogRef.current) dialogRef.current.focus();
    }, 0);

    function handleKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKey);
      try {
        previousActive && previousActive.focus();
      } catch (_) {}
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-xl",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onMouseDown={(e) => {
          if (e.target === overlayRef.current) onClose();
        }}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        className={`relative w-full mx-auto ${sizes[size] || sizes.md} bg-white dark:bg-gray-900 rounded-3xl shadow-xl`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
