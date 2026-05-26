'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { ArtworkImage } from '@/types/database'

interface ImageUploadProps {
  artworkId: string
  existingImages: ArtworkImage[]
  onImagesChange: (images: ArtworkImage[]) => void
  /** For new (unsaved) artworks: skip DB insert and just track storage paths */
  isNew?: boolean
  onPendingPathsChange?: (paths: string[]) => void
}

export function ImageUpload({
  artworkId,
  existingImages,
  onImagesChange,
  isNew = false,
  onPendingPathsChange,
}: ImageUploadProps) {
  const [images, setImages] = useState<ArtworkImage[]>(existingImages)
  const [pendingPaths, setPendingPaths] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files?.length) return

      setUploading(true)
      setError(null)

      try {
        const uploads = Array.from(files)
        const newImages: ArtworkImage[] = []

        for (const file of uploads) {
          const ext = file.name.split('.').pop()
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const path = `${artworkId}/${filename}`

          const { error: uploadError } = await supabase.storage
            .from('artwork-images')
            .upload(path, file, { upsert: false })

          if (uploadError) throw uploadError

          if (isNew) {
            // Artwork doesn't exist in DB yet — defer the artwork_images insert
            // until the form is submitted. Build a display-only object for the UI.
            const displayImage: ArtworkImage = {
              id: `pending-${crypto.randomUUID()}`,
              artwork_id: artworkId,
              storage_path: path,
              alt_text: null,
              sort_order: images.length + newImages.length,
              is_primary: images.length === 0 && newImages.length === 0,
            }
            newImages.push(displayImage)
          } else {
            const { data: dbData, error: dbError } = await supabase
              .from('artwork_images')
              .insert({
                artwork_id: artworkId,
                storage_path: path,
                alt_text: '',
                sort_order: images.length + newImages.length,
                is_primary: images.length === 0 && newImages.length === 0,
              })
              .select()
              .single()

            if (dbError) throw new Error(dbError.message)
            newImages.push(dbData)
          }
        }

        const updated = [...images, ...newImages]
        setImages(updated)
        onImagesChange(updated)

        if (isNew) {
          const newPending = [...pendingPaths, ...newImages.map(i => i.storage_path)]
          setPendingPaths(newPending)
          onPendingPathsChange?.(newPending)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : (err as { message?: string })?.message ?? 'Upload failed'
        setError(msg)
      } finally {
        setUploading(false)
        e.target.value = ''
      }
    },
    [artworkId, images, pendingPaths, isNew, supabase, onImagesChange, onPendingPathsChange]
  )

  async function removeImage(image: ArtworkImage) {
    await supabase.storage.from('artwork-images').remove([image.storage_path])

    const isPending = image.id.startsWith('pending-')
    if (!isPending) {
      await supabase.from('artwork_images').delete().eq('id', image.id)
    }

    const updated = images.filter(i => i.id !== image.id)
    setImages(updated)
    onImagesChange(updated)

    if (isNew) {
      const newPending = pendingPaths.filter(p => p !== image.storage_path)
      setPendingPaths(newPending)
      onPendingPathsChange?.(newPending)
    }
  }

  async function setPrimary(image: ArtworkImage) {
    await supabase
      .from('artwork_images')
      .update({ is_primary: false })
      .eq('artwork_id', artworkId)
    await supabase
      .from('artwork_images')
      .update({ is_primary: true })
      .eq('id', image.id)

    const updated = images.map(i => ({ ...i, is_primary: i.id === image.id }))
    setImages(updated)
    onImagesChange(updated)
  }

  const getImageUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artwork-images/${path}`

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-stone-700">Images</label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map(img => (
            <div key={img.id} className="relative group aspect-square bg-stone-100">
              <Image
                src={getImageUrl(img.storage_path)}
                alt={img.alt_text ?? ''}
                fill
                className="object-cover"
                sizes="150px"
              />
              {img.is_primary && (
                <span className="absolute top-1 left-1 bg-stone-900 text-white text-[10px] px-1.5 py-0.5">
                  Primary
                </span>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(img)}
                    className="text-[10px] text-white underline"
                  >
                    Set primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(img)}
                  className="text-[10px] text-red-300 underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <label className="cursor-pointer inline-flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById('image-upload-input')?.click()}
          >
            {uploading ? 'Uploading…' : 'Add images'}
          </Button>
          <input
            id="image-upload-input"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
        <p className="mt-1.5 text-xs text-stone-400">JPEG, PNG, or WebP. Max 10MB each.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
