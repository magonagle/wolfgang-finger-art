'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { artworkSchema, type ArtworkFormData } from '@/lib/validations'
import { slugify } from '@/lib/utils'
import { MEDIUMS } from '@/lib/mediums'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/admin/image-upload'
import type { ArtworkWithImages, ArtworkImage } from '@/types/database'

interface ArtworkFormProps {
  artwork?: ArtworkWithImages
}

export function ArtworkForm({ artwork }: ArtworkFormProps) {
  const router = useRouter()
  const isEdit = !!artwork
  const [serverError, setServerError] = useState<string | null>(null)
  const [images, setImages] = useState<ArtworkImage[]>(artwork?.artwork_images ?? [])
  const [pendingImagePaths, setPendingImagePaths] = useState<string[]>([])
  // For new artworks we need an ID before upload
  const [artworkId] = useState<string>(artwork?.id ?? crypto.randomUUID())

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ArtworkFormData>({
    resolver: zodResolver(artworkSchema),
    defaultValues: artwork
      ? {
          title: artwork.title,
          slug: artwork.slug,
          description: artwork.description ?? '',
          medium: artwork.medium,
          price: artwork.price,
          dimensions: artwork.dimensions ?? '',
          year_created: artwork.year_created ?? undefined,
          is_featured: artwork.is_featured,
          is_hero: artwork.is_hero,
          is_sold: artwork.is_sold,
        }
      : { medium: 'painting', is_featured: false, is_hero: false, is_sold: false },
  })

  const title = watch('title')

  // Auto-generate slug from title (only for new artworks)
  useEffect(() => {
    if (!isEdit && title) {
      setValue('slug', slugify(title))
    }
  }, [title, isEdit, setValue])

  async function onSubmit(data: ArtworkFormData) {
    setServerError(null)
    try {
      const url = isEdit ? `/api/admin/artworks/${artwork!.id}` : '/api/admin/artworks'
      const method = isEdit ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          id: isEdit ? artwork!.id : artworkId,
          ...(isEdit ? {} : { imagePaths: pendingImagePaths }),
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Failed to save artwork')
      }

      router.push('/admin/artworks')
      router.refresh()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unexpected error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="title"
          label="Title *"
          error={errors.title?.message}
          {...register('title')}
        />
        <Input
          id="slug"
          label="Slug *"
          error={errors.slug?.message}
          {...register('slug')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-stone-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="w-full border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
          {...register('description')}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="medium" className="text-sm font-medium text-stone-700">
            Medium *
          </label>
          <select
            id="medium"
            className="h-10 border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
            {...register('medium')}
          >
            {MEDIUMS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <Input
          id="price"
          type="number"
          step="0.01"
          label="Price (USD) *"
          error={errors.price?.message}
          {...register('price', { valueAsNumber: true })}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          id="dimensions"
          label="Dimensions"
          placeholder='e.g. 24" × 36"'
          {...register('dimensions')}
        />
        <Input
          id="year_created"
          type="number"
          label="Year Created"
          error={errors.year_created?.message}
          {...register('year_created', { valueAsNumber: true })}
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" className="h-4 w-4 accent-stone-900" {...register('is_featured')} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" className="h-4 w-4 accent-stone-900" {...register('is_hero')} />
          Hero image
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" className="h-4 w-4 accent-stone-900" {...register('is_sold')} />
          Sold
        </label>
      </div>
      <p className="text-xs text-stone-400 -mt-3">
        <strong>Featured</strong> — appears in the Selected Works grid on the homepage.&nbsp;
        <strong>Hero image</strong> — used as the full-bleed banner (only one work should be hero at a time).
      </p>

      <ImageUpload
        artworkId={artworkId}
        existingImages={images}
        onImagesChange={setImages}
        isNew={!isEdit}
        onPendingPathsChange={setPendingImagePaths}
      />

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Update Artwork' : 'Create Artwork'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/artworks')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
