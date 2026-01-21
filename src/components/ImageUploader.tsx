import { useCallback, useState, useRef } from "react";
import { cn } from "../lib/utils";
import { Camera, Loader2, Check, AlertCircle, ImagePlus } from "lucide-react";

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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full aspect-[4/3] rounded-xl transition-all overflow-hidden",
          isDragging
            ? "ring-2 ring-emerald-400 bg-emerald-500/20"
            : "bg-black/20",
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
          <div className="flex items-center justify-evenly w-full">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Camera className="w-7 h-7" />
              <span className="text-[10px] font-medium">Camera</span>
            </button>
            <div className="w-px h-10 bg-white/20" />
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ImagePlus className="w-7 h-7" />
              <span className="text-[10px] font-medium">Gallery</span>
            </button>
          </div>
        )}

        {/* Tap to change when preview exists */}
        {preview && !status.match(/loading/) && (
          <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center gap-1 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            >
              <Camera className="w-5 h-5" />
              <span className="text-[10px]">Camera</span>
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="flex flex-col items-center gap-1 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px]">Gallery</span>
            </button>
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

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {/* Error message */}
      {status === "error" && error && (
        <p className="text-xs text-red-300 px-1 line-clamp-2">{error}</p>
      )}
    </div>
  );
}
