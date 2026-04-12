"use client"

import { useRef, useCallback } from "react"
import { ImageIcon, X, Upload } from "lucide-react"

interface ImageUploadProps {
  images: File[]
  previews: string[]
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
  maxImages?: number
}

export function ImageUpload({ images, previews, onAdd, onRemove, maxImages = 5 }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const remaining = maxImages - images.length
      const toAdd = Array.from(files).slice(0, remaining)
      onAdd(toAdd)
    },
    [images.length, maxImages, onAdd]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-4">
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all duration-150 group"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop images here or <span className="text-accent">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP up to 10MB · {images.length}/{maxImages} uploaded
              </p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                aria-label={`Remove image ${i + 1}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-xs font-medium bg-black/60 text-white px-1.5 py-0.5 rounded-md">
                  Cover
                </span>
              )}
            </div>
          ))}
          {canAddMore && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-accent hover:bg-accent/5 transition-all text-muted-foreground hover:text-accent"
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-xs font-medium">Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
