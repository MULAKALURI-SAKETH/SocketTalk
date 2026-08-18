import React, { useMemo, useState } from "react";
import { EmojiPickerProps } from "../interfaces/IChat";
import { EMOJIS } from "../constants/chat";

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState("");

  const filteredEmojis = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return EMOJIS;
    return EMOJIS.filter((item) => item.label.includes(normalized));
  }, [query]);

  return (
    <div
      onMouseDown={(event) => event.stopPropagation()}
      className="absolute bottom-14 left-0 z-20 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
      role="dialog"
      aria-label="Emoji picker"
    >
      <div className="border-b border-slate-200 p-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search emojis..."
          autoFocus
          className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
      </div>
      <div className="max-h-56 overflow-y-auto p-2">
        {filteredEmojis.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">
            No emojis found.
          </p>
        ) : (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((item) => (
              <button
                key={item.emoji}
                type="button"
                onClick={() => onSelect(item.emoji)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-xl hover:bg-slate-100"
                title={item.label}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="block w-full border-t border-slate-200 py-2 text-center text-sm font-medium text-slate-500 hover:bg-slate-50"
      >
        Close
      </button>
    </div>
  );
};

export default EmojiPicker;
