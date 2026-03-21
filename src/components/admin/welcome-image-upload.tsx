"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";
import type { WelcomeImage } from "@/lib/types";

interface WelcomeImageUploadProps {
  images: WelcomeImage[];
}

export function WelcomeImageUpload({ images }: WelcomeImageUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    await fetch("/api/admin/welcome-images", {
      method: "POST",
      body: formData,
    });

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  };

  const handleDelete = async (imageId: string) => {
    setDeleting(imageId);
    await fetch(`/api/admin/welcome-images/${imageId}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  };

  return (
    <div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={image.url}
                alt={`Imagen de bienvenida ${index + 1}`}
                fill
                className="object-cover"
                sizes="200px"
              />
              <button
                onClick={() => handleDelete(image.id)}
                disabled={deleting === image.id}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-gray-400 mb-4">
          <ImageIcon className="w-10 h-10 mb-2" />
          <p className="text-sm">No hay imágenes de bienvenida</p>
        </div>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleUpload}
          className="hidden"
          id="welcome-image-upload"
        />
        <label
          htmlFor="welcome-image-upload"
          className={`inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        >
          <Upload className="w-4 h-4" />
          {uploading ? "Subiendo..." : "Subir imágenes"}
        </label>
        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG o WebP. Máximo 5MB por imagen.
        </p>
      </div>
    </div>
  );
}
