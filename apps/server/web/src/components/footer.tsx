import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex flex-row items-center justify-between px-2 py-2 border-t-2 bg-th-background border-th-muted text-th-foreground/80">
      <div className="mb-4 sm:mb-0">
        <Link href="/" className="text-lg font-bold text-th-primary">
          <img src="/favicon.ico" alt="Resumemk" className="w-8 h-8" />
        </Link>
      </div>
      <div>
        &copy; {new Date().getFullYear()} Resumemk. All rights reserved.
      </div>
      <div>
        <Link href="https://github.com/diegorezm/resumemk" target="_blank">
          Github
        </Link>
      </div>
    </footer>
  );
}
