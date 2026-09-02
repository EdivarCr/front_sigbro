import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { entradaInsumoSchema, type EntradaInsumoFormData } from "@/schemas/entradaInsumo.schema"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PackageIcon, CurrencyDollarIcon } from "@phosphor-icons/react"

interface EntradaInsumoFormProps {
  insumoNome: string
  unidadeMedida: string
  onSubmit: (data: EntradaInsumoFormData) => void
  onCancel: () => void
}

export function EntradaInsumoForm({ insumoNome, unidadeMedida, onSubmit, onCancel }: EntradaInsumoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<EntradaInsumoFormData>({
    resolver: zodResolver(entradaInsumoSchema),
    mode: "all",
  })

  const handleFormSubmit: SubmitHandler<EntradaInsumoFormData> = (data) => {
    onSubmit(data)
  }

  const unidadeFormatada = unidadeMedida.toUpperCase()

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      <div className="rounded-sm bg-brand/5 border border-brand/20 p-3">
        <p className="text-body-sm text-(--txt-secondary)">
          Registrando entrada para: <strong className="text-brand">{insumoNome}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={`Qtd. Comprada (${unidadeFormatada})`}
          placeholder="Ex: 5.000"
          type="number"
          step="0.001"
          iconLeft={<PackageIcon />}
          iconRight={<span className="text-body-sm font-bold text-(--txt-secondary) pr-2">{unidadeFormatada}</span>}
          error={errors.quantidade_comprada?.message}
          {...register("quantidade_comprada", { valueAsNumber: true })}
        />

        <Input
          label="Valor Total Pago (R$)"
          placeholder="Ex: 150.50"
          type="number"
          step="0.01"
          iconLeft={<CurrencyDollarIcon />}
          error={errors.valor_total_pago?.message}
          {...register("valor_total_pago", { valueAsNumber: true })}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button
          type="button"
          variant="outlined"
          className="flex-1"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="secondary"
          className="flex-1"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? "Registrando..." : "Confirmar Entrada"}
        </Button>
      </div>
    </form>
  )
}