"use client";
import { forwardRef } from "react";
import clsx from "clsx";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
};

export const GlowInput = forwardRef<HTMLInputElement, Props>(function GlowInput(
  { className, label, icon, trailing, ...rest },
  ref
) {
  return (
    <label className="block w-full">
      {label && <div className="mb-2 text-sm text-zinc-300">{label}</div>}
      <div className="yl-glow">
        <div className="pointer-events-none absolute pl-3 pt-[10px] text-zinc-400">{icon}</div>
        {trailing && (
          <div className="absolute right-3 top-2.5">{trailing}</div>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full rounded-xl bg-zinc-800/70 text-zinc-100 placeholder:text-zinc-500",
            "border border-zinc-700/60 focus:border-zinc-400/70 focus:outline-none",
            "px-11 py-3.5 shadow-inner shadow-black/30",
            className
          )}
          {...rest}
        />
      </div>
    </label>
  );
});
