import React from "react";

const Spinner: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"
      />
    </div>
  );
};

export default Spinner;
