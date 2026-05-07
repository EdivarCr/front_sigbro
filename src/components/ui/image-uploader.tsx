import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { PlusIcon, XIcon, UploadSimpleIcon, InfoIcon } from "@phosphor-icons/react"

interface ImageUploaderProps {
  value?: string | null // URL pra preview
  onChange?: (file: File | null) => void
  className?: string
}

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const mainInputRef = useRef<HTMLInputElement>(null)
  const [mainPreview, setMainPreview] = useState<string | null>(value ?? null)

  const [extraPreviews, setExtraPreviews] = useState<(string | null)[]>([null, null, null, null])
  const extraInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleMainSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setMainPreview(localUrl)
    onChange?.(file)
  }

  const handleMainRemove = () => {
    setMainPreview(null)
    onChange?.(null)
    if (mainInputRef.current) mainInputRef.current.value = ""
  }

  const handleExtraSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const localUrl = URL.createObjectURL(file)
    setExtraPreviews((prev) => {
      const updated = [...prev]
      updated[index] = localUrl
      return updated
    })
  }

  const handleExtraRemove = (index: number) => {
    setExtraPreviews((prev) => {
      const updated = [...prev]
      updated[index] = null
      return updated
    })
    if (extraInputRefs.current[index]) {
      extraInputRefs.current[index]!.value = ""
    }
  }

  return (
    <div className={cn("flex flex-col md:flex-row gap-4 rounded-sm bg-(--bg-surface) items-center md:items-start", className)}>

      {/* Imagem principal */}
      <div className="flex flex-col gap-2 w-full max-w-fit">
        <span className="text-table-header text-(--txt-link) uppercase tracking-wider">
          Capa
        </span>

        {/* Quadrado principal */}
        <div className="relative w-fit">
          <input
            ref={mainInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleMainSelect}
          />

          <div
            className={cn(
              "flex size-54 md:size-70 items-center justify-center rounded-sm transition-all",
              mainPreview
                ? "border-2 border-solid border-(--border-input)"
                : "border-2 border-dashed border-(--border-input) cursor-pointer hover:border-(--border-active) hover:bg-(--bg-sidebar)"
            )}
            onClick={() => !mainPreview && mainInputRef.current?.click()}
          >
            {mainPreview ? (
              <img
                src={mainPreview}
                alt="Imagem principal"
                className="h-full w-full rounded-sm object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-(--txt-secondary) pointer-events-none">
                <PlusIcon size={24} />
                <span className="text-body-sm font-medium">Adicionar foto</span>
              </div>
            )}
          </div>

          {/* Botão remover */}
          {mainPreview && (
            <button
              type="button"
              onClick={handleMainRemove}
              className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-(--bg-surface) shadow-sm text-(--txt-secondary) hover:text-(--color-red) cursor-pointer"
            >
              <XIcon size={16} weight="bold"/>
            </button>
          )}
        </div>

        {/* Dica */}
        <div className="flex items-start gap-1 max-w-56 md:max-w-70">
          <InfoIcon size={14} className="shrink-0 text-(--txt-link) mt-0.5" />
          <p className="text-label text-(--txt-secondary)">
            Dica: Fotos com fundo neutro e boa iluminação valorizam o seu produto no catálogo.
          </p>
        </div>
      </div>

      {/* Outras fotos — opcional */}
      <div className="flex flex-col gap-3 items-center w-full md:w-auto">
        <span className="text-table-header text-(--txt-link)">
          Outras fotos
        </span>
        <div className="flex flex-row md:flex-col gap-2 flex-wrap">
          {extraPreviews.map((preview, index) => (
            <div key={index} className="relative w-fit">
              <input
                ref={(el) => { extraInputRefs.current[index] = el }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleExtraSelect(index, e)}
              />

              <div
                className={cn(
                  "flex size-12 md:size-15 items-center justify-center rounded-sm",
                  preview
                    ? "border-2 border-solid border-(--border-input)"
                    : "border-2 border-dashed border-(--border-input) cursor-pointer hover:border-(--border-active) hover:bg-(--bg-sidebar)"
                )}
                onClick={() => !preview && extraInputRefs.current[index]?.click()}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt={`Foto extra ${index + 1}`}
                    className="h-full w-full rounded-sm object-cover"
                  />
                ) : (
                  <UploadSimpleIcon size={16} className="text-(--txt-secondary)" />
                )}
              </div>

              {preview && (
                <button
                  type="button"
                  onClick={() => handleExtraRemove(index)}
                  className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-(--bg-surface) shadow-sm text-(--txt-secondary) hover:text-(--color-red) cursor-pointer"
                >
                  <XIcon size={12} weight="bold"/>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}