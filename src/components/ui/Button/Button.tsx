import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = "px-6 py-3 rounded-full font-medium transition-all duration-300";

  const variants = {
    primary: "bg-[#3A6EA5] text-white hover:bg-[#2E5A8C] shadow-md",
    secondary: "bg-[#8BAAAD] text-white hover:bg-[#6E8E90] shadow-md",
    outline:
      "border border-[#3A6EA5] text-[#3A6EA5] hover:bg-[#3A6EA5] hover:text-white",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
