import React from "react";

interface MessageTicksProps {
  read: boolean;
  className?: string;
}

const MessageTicks: React.FC<MessageTicksProps> = ({ read, className }) => {
  const color = read ? "text-sky-300" : "text-slate-300";
  return (
    <svg
      viewBox="0 0 20 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={read ? "Read" : "Delivered"}
      className={`h-3.5 w-5 shrink-0 ${color} ${className ?? ""}`}
    >
      <path
        d="M1.5 4.5L5 7.5L11 1.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 4.5L10 7.5L16 1.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
};

export default MessageTicks;
