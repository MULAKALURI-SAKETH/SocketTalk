import React from "react";
import MessageTicks from "./MessageTicks";

const ChatMockup: React.FC = () => {
  return (
    <div className="relative mx-auto w-full max-w-md animate-float-slow">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-indigo-500/10 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/80">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
            A
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              Aanya
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              online
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 bg-slate-50 p-4 dark:bg-slate-800/50">
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-white px-3.5 py-2 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:ring-slate-600">
              Hey! Have you seen the new update? 👀
            </div>
          </div>

          <div className="flex justify-end">
            <div className="rounded-2xl rounded-tr-sm bg-indigo-600 px-3.5 py-2 text-sm text-white shadow-sm">
              Not yet, what's new?
            </div>
          </div>

          <div className="flex justify-end">
            <div className="max-w-[70%] overflow-hidden rounded-2xl rounded-tr-sm bg-indigo-600 shadow-sm">
              <div className="h-28 bg-gradient-to-br from-indigo-400 to-violet-500" />
              <div className="flex items-center justify-end gap-1 bg-indigo-600 px-3.5 py-1.5">
                <span className="text-[10px] leading-none text-white/80">
                  10:24
                </span>
                <MessageTicks read className="text-sky-300" />
              </div>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-700 dark:ring-slate-600">
              <span className="h-2 w-2 animate-typing rounded-full bg-slate-400" />
              <span className="h-2 w-2 animate-typing rounded-full bg-slate-400 [animation-delay:0.15s]" />
              <span className="h-2 w-2 animate-typing rounded-full bg-slate-400 [animation-delay:0.3s]" />
            </div>
          </div>

          <div className="flex justify-end">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tr-sm bg-indigo-600 px-3.5 py-2 text-sm text-white shadow-sm">
              It's all about edits & deletes now ✨
              <span className="flex items-center gap-1 text-[10px] leading-none text-white/80">
                10:25
                <MessageTicks read className="text-sky-300" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMockup;
