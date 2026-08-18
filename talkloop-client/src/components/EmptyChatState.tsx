import React from "react";

const EmptyChatState: React.FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-slate-400">
      <svg
        className="h-16 w-16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
        />
      </svg>
      <p className="mt-4 text-lg font-medium text-slate-500">
        Select a user to start chatting
      </p>
    </div>
  );
};

export default EmptyChatState;
