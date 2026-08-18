import { formatFileSize, resolveMediaUrl } from "../utils/media";

export const FileAttachment: React.FC<{
  url: string;
  fileName: string;
  fileSize: number;
}> = ({ url, fileName, fileSize }) => {
  return (
    <a
      href={resolveMediaUrl(url)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 hover:bg-slate-100"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-slate-700">
          {fileName}
        </span>
        <span className="block text-xs text-slate-400">
          {formatFileSize(fileSize)}
        </span>
      </span>
    </a>
  );
};
