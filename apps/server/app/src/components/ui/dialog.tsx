import React from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({open, onOpenChange, children}) => {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 animate-fadeIn"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Dialog Content */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${open ? "animate-fadeInScale" : "hidden"
          }`}
        aria-hidden={!open}
      >
        <div
          className="relative w-full max-w-lg p-6 rounded-lg shadow-lg bg-th-background text-th-foreground"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
        >
          {/* Close Button */}
          <button
            className="absolute top-3 right-3 focus:outline-none hover:text-th-secondary"
            onClick={() => onOpenChange(false)}
          >
            <span className="sr-only">Close</span>
            ✖
          </button>

          {/* Content */}
          {children}
        </div>
      </div>
    </>
  );
};
