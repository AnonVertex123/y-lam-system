"use client";
import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function PrimaryButton({ className, ...rest }: Props) {
  return (
    <button
      className={clsx(
        "yl-glow w-full rounded-xl bg-zinc-100 text-zinc-900",
        "hover:bg-white active:bg-zinc-200 transition-all",
        "px-5 py-3.5 font-medium shadow shadow-black/40",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale-[0.5]",
        className
      )}
      {...rest}
    />
  );
}
