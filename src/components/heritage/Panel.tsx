import { type ReactNode } from "react";

export function Panel({ title, right, children, className = "" }: { title?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`glass corner-frame rounded-md p-3 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-2">
          <div className="panel-title">{title}</div>
          <div className="text-[10px] text-muted-foreground">{right}</div>
        </div>
      )}
      {children}
    </div>
  );
}
