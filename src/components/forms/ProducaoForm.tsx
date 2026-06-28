import { useForm, Controller, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { FloppyDiskIcon } from "@phosphor-icons/react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SelectField } from "@/components/ui/select-field"

import {
  producaoCreateSchema,
  producaoEditSchema,
  type ProducaoCreateData,
  type ProducaoEditData,
} from "@/schemas/producao.schema"

// Tipo dos produtos disponíveis para seleção
interface ProdutoOption {
  label: string
  value: string
}

// Props para o modo criação
interface ProducaoFormCreateProps {
  mode: "create"
  onSubmit: (data: ProducaoCreateData) => Promise<void>
  produtos: ProdutoOption[]
}

// Props para o modo edição
interface ProducaoFormEditProps {
  mode: "edit"
  onSubmit: (data: ProducaoEditData) => Promise<void>
  defaultValues: ProducaoEditData
  loteInfo: { codigo: string; produto: string }
}

type ProducaoFormProps = ProducaoFormCreateProps | ProducaoFormEditProps

function ProducaoCreateForm({ onSubmit, produtos }: ProducaoFormCreateProps) {
  const navigate = useNavigate()

  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProducaoCreateData>({
    resolver: zodResolver(producaoCreateSchema) as Resolver<ProducaoCreateData>,
    mode: "onBlur",
  })

    // Correção do off-by-one: adiciona T00:00:00 para forçar horário local
  return (
    <form onSubmit={handleSubmit((data) => {
      onSubmit({ ...data, validade: data.validade ? `${data.validade}T00:00:00` : data.validade })
      })} className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-col gap-4 rounded-sm border border-(--bg-sidebar) bg-(--bg-primary) p-6 shadow-sm">
  <div className="flex w-full flex-col gap-1">
    <Controller
      name="produto_id"
      control={control}
      render={({ field }) => (
        <SelectField
          label="Produto"
          placeholder="Selecione o produto fabricado"
          options={produtos}
          value={field.value ? String(field.value) : ""}
          onValueChange={field.onChange}
        />
      )}
    />
    {errors.produto_id && (
      <span className="text-xs text-(--color-red)">{errors.produto_id.message}</span>
    )}
  </div>

  <div className="flex w-full flex-col gap-1">
    <Input
      label="Quantidade (Unidades)"
      type="number"
      placeholder="Ex: 50"
      error={errors.quantidade?.message}
      {...register("quantidade")}
    />
  </div>

  {/* ← campo novo */}
  <div className="flex w-full flex-col gap-1">
    <Input
      label="Data de Validade"
      type="date"
      error={errors.validade?.message}
      {...register("validade")}
      min={today}
    />
  </div>
</div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outlined"
          size="lg"
          onClick={() => navigate("/estoque")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Lote"}
          <FloppyDiskIcon />
        </Button>
      </div>
    </form>
  )
}

function ProducaoEditForm({ onSubmit, defaultValues, loteInfo }: ProducaoFormEditProps) {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProducaoEditData>({
    resolver: zodResolver(producaoEditSchema) as Resolver<ProducaoEditData>,
    defaultValues,
    mode: "onBlur",
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
      <div className="flex w-full flex-col gap-6 rounded-sm border border-(--bg-sidebar) bg-(--bg-primary) p-6 shadow-sm">
        {/* Informação Read-Only */}
        <div className="flex flex-col gap-1 rounded-sm bg-(--bg-sidebar)/50 p-4 border border-(--bg-sidebar)">
          <span className="text-label text-(--txt-secondary) uppercase font-bold">Produto Vinculado</span>
          <span className="text-body font-medium text-(--txt-primary)">{loteInfo.produto}</span>
          <span className="text-sm text-(--txt-secondary) mt-1">
            O produto de um lote de produção já registrado não pode ser alterado.
          </span>
        </div>

        <div className="flex w-full flex-col gap-1">
          <Input
            label="Quantidade Atual (Frascos)"
            type="number"
            error={errors.quantidade?.message}
            {...register("quantidade")}
          />
        </div>

        <div className="flex w-full flex-col gap-1">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Status do Lote"
                placeholder="Selecione o status"
                options={[
                  { label: "Ativo", value: "ATIVO" },
                  { label: "Esgotado", value: "ESGOTADO" },
                  { label: "Vencido", value: "VENCIDO" },
                  { label: "Cancelado", value: "CANCELADO" },
                ]}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          {errors.status && (
            <span className="text-xs text-(--color-red)">{errors.status.message}</span>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outlined"
          size="lg"
          onClick={() => navigate("/estoque")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          <FloppyDiskIcon />
        </Button>
      </div>
    </form>
  )
}

export function ProducaoForm(props: ProducaoFormProps) {
  if (props.mode === "create") return <ProducaoCreateForm {...props} />
  return <ProducaoEditForm {...props} />
}