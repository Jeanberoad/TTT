import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Upload, FileText, X } from "lucide-react";
import type { TicketData } from "@/types/ticket";

interface CsvUploaderProps {
  onTicketsLoaded: (tickets: TicketData[]) => void;
}

export function CsvUploader({ onTicketsLoaded }: CsvUploaderProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setError(null);

      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const tickets: TicketData[] = results.data.map((row) => ({
            username: row.username || row.name || row.user || "",
            password: row.password || row.pass || undefined,
            profile: row.profile || row.plan || row.type || "default",
            limit_uptime: row.limit_uptime || row.uptime || row.duration || undefined,
            qr_url: row.qr_url || row.url || undefined,
          }));
          onTicketsLoaded(tickets);
        },
        error: (err) => {
          setError("Failed to parse CSV: " + err.message);
        },
      });
    },
    [onTicketsLoaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "text/plain": [".csv", ".txt"] },
    multiple: false,
  });

  const clearFile = () => {
    setFileName(null);
    setError(null);
    onTicketsLoaded([]);
  };

  return (
    <div className="space-y-3">
      {!fileName ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="bg-primary/10 p-4 rounded-full">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {isDragActive ? "Drop your CSV here" : "Upload CSV File"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Expected columns: username, password, profile, limit_uptime, qr_url
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="bg-green-100 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-green-800 truncate">{fileName}</p>
            <p className="text-xs text-green-600">CSV loaded successfully</p>
          </div>
          <button
            onClick={clearFile}
            className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
