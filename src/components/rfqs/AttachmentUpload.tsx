"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RfqFormValues, RfqAttachmentFormValues } from "@/lib/rfq-schema";

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/zip": [".zip"],
};

const MAX_SIZE = 10 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentUploadProps {
  rfqId?: string | null;
}

export function AttachmentUpload({ rfqId }: AttachmentUploadProps) {
  const { watch, setValue } = useFormContext<RfqFormValues>();
  const attachments = watch("attachments") ?? [];
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setError(null);
      setUploading(true);

      try {
        const uploaded: RfqAttachmentFormValues[] = [];

        for (const file of acceptedFiles) {
          const formData = new FormData();
          formData.append("file", file);
          if (rfqId) formData.append("rfqId", rfqId);

          const res = await fetch("/api/upload/rfq-attachment", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();

          if (!data.success) {
            setError(data.error ?? "Upload failed.");
            continue;
          }

          uploaded.push({
            id: data.attachment?.id,
            fileName: file.name,
            fileUrl: data.url,
            fileSize: file.size,
            mimeType: file.type,
          });
        }

        if (uploaded.length > 0) {
          setValue("attachments", [...attachments, ...uploaded], { shouldDirty: true });
        }
      } catch {
        setError("Network error during upload.");
      } finally {
        setUploading(false);
      }
    },
    [attachments, rfqId, setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: true,
    disabled: uploading,
  });

  const removeAttachment = async (index: number, attachment: RfqAttachmentFormValues) => {
    if (rfqId && attachment.id) {
      await fetch(`/api/rfqs/${rfqId}/attachments/${attachment.id}`, {
        method: "DELETE",
      });
    }
    setValue(
      "attachments",
      attachments.filter((_, i) => i !== index),
      { shouldDirty: true }
    );
  };

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
      <div className="px-6 py-4 border-b border-[hsl(var(--border))]">
        <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
          Attachments
        </h2>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
          PDF, DOC, DOCX, XLS, XLSX, ZIP — max 10MB each
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
              : "border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--accent))]/30",
            uploading && "opacity-60 pointer-events-none"
          )}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <Loader2 className="size-8 mx-auto text-[hsl(var(--primary))] animate-spin" />
          ) : (
            <Upload className="size-8 mx-auto text-[hsl(var(--muted-foreground))] mb-3" />
          )}
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            {isDragActive ? "Drop files here" : "Drag & drop files here, or click to browse"}
          </p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            Supported formats up to 10MB
          </p>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {attachments.length > 0 && (
          <ul className="space-y-2">
            {attachments.map((att, index) => (
              <li
                key={att.id ?? `${att.fileName}-${index}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20"
              >
                <FileText className="size-4 text-[hsl(var(--primary))] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{att.fileName}</p>
                  {att.fileSize != null && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatFileSize(att.fileSize)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index, att)}
                  className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
