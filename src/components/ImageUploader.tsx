import { useCallback, useState } from "react";
import { cn } from "../lib/utils";
import { Camera, Loader2, Check, AlertCircle } from "lucide-react";

type ImageUploaderProps = {
  label: string;
  onImageSelect: (base64: string) => void;
  status: "idle" | "loading" | "success" | "error";
  resultText?: string;
  error?: string;
  className?: string;
};

export function ImageUploader({
  label,
  onImageSelect,
  status,
  resultText,
  error,
  className,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        onImageSelect(base64);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        className={cn(
          "relative flex flex-col items-center justify-center w-full aspect-[4/3] rounded-xl cursor-pointer transition-all overflow-hidden",
          isDragging
            ? "ring-2 ring-emerald-400 bg-emerald-500/20"
            : "bg-black/20 hover:bg-black/30",
          preview && "ring-2 ring-emerald-400"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white/70">
            <Camera className="w-8 h-8" />
            <span className="text-xs font-medium">Tap to capture</span>
          </div>
        )}

        {/* Status overlay */}
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}

        {/* Bottom label bar */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-medium text-white">{label}</span>
          <div className="flex items-center gap-1.5">
            {status === "success" && (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {resultText && (
                  <span className="text-xs text-emerald-300">{resultText}</span>
                )}
              </>
            )}
            {status === "error" && (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-300">Error</span>
              </>
            )}
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
      </label>

      {/* Error message */}
      {status === "error" && error && (
        <p className="text-xs text-red-300 px-1 line-clamp-2">{error}</p>
      )}
    </div>
  );
}
