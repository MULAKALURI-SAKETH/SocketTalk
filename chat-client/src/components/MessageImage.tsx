import { useState } from "react";

export const MessageImage: React.FC<{ url: string }> = ({ url }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <p className="text-sm text-slate-400">Image couldn't be loaded.</p>;
  }

  return (
    <img
      src={url}
      loading="lazy"
      onError={() => setFailed(true)}
      className="max-h-72 max-w-full rounded-lg object-cover"
    />
  );
};
