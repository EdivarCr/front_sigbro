import { 
  useForm, 
  Controller, 
  type SubmitHandler, 
  type Resolver 
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { insumoSchema, type InsumoFormData } from "@/schemas/insumos.schema"
import { 
  PackageIcon, 
  CurrencyDollarIcon, 
} from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SelectField } from "@/components/ui/select-field"
import { Switch } from "../ui/switch"

interface InsumoFormProps {
  onSubmit: (data: InsumoFormData) => void
  defaultValues?: InsumoFormData
  mode: 'create' | 'edit'
  onCancel: () => void
}

export function InsumoForm({ onSubmit, defaultValues, mode, onCancel }: InsumoFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<InsumoFormData>({
    resolver: zodResolver(insumoSchema) as Resolver<InsumoFormData>,
    defaultValues: {
      nome: "",
      tipo: "",
      unidade_de_medida: "",
      quantidade_estoque: 0,
      estoque_minimo: 0,
      custo_unitario: 0,
      ativo: true,
      ...defaultValues,
    },
    mode: "all", // Executa a validação em tempo real em todas as interações
  })

  const handleFormSubmit: SubmitHandler<InsumoFormData> = (data) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      {/* Bloco de Status exclusivo para o modo de Edição */}
      {mode === 'edit' && (
        <div className="flex items-center justify-between rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-4">
          <div className="flex flex-col">
            <label className="text-label font-bold text-(--txt-primary)">
              Status do Insumo
            </label>
            <span className="text-[11px] text-(--txt-secondary)">
              Inative para ocultar este item das ordens de produção futuras.
            </span>
          </div>

          <Controller
            name="ativo"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                label={field.value ? "Ativo" : "Inativo"}
              />
            )}
          />
        </div>
      )}

      {/* Seção 1: Identificação Básica */}
      <div className="flex flex-col gap-4">
        <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary)">
          Identificação Básica
        </h3>
        
        <Input
          label="Nome do Insumo"
          placeholder="Ex: Pimenta Malagueta Orgânica"
          required
          error={errors.nome?.message}
          {...register("nome")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="tipo"
            control={control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Tipo de Insumo"
                required
                placeholder="Selecione um tipo"
                options={[
                  { value: "MP", label: "Matéria-Prima" },
                  { value: "EMBALAGEM", label: "Embalagem" },
                  { value: "OUTRO", label: "Outros" }
                ]}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val)
                  field.onBlur()
                }}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="unidade_de_medida"
            control={control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Unidade de Medida"
                required
                placeholder="Selecione uma unidade"
                options={[
                  { value: "KG", label: "Quilograma (KG)" },
                  { value: "G", label: "Grama (G)" },
                  { value: "L", label: "Litro (L)" },
                  { value: "ML", label: "Mililitro (ML)" },
                  { value: "UN", label: "Unidade (UN)" }
                ]}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val)
                  field.onBlur()
                }}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Seção 2: Estoque e Custos */}
      <div className="flex flex-col gap-4">
        <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary)">
          Estoque e Custos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Estoque Inicial"
            type="number"
            step="0.001"
            iconLeft={<PackageIcon />}
            error={errors.quantidade_estoque?.message}
            {...register("quantidade_estoque")}
            required
          />
          
          <Input
            label="Estoque Mínimo"
            type="number"
            step="0.001"
            iconLeft={<PackageIcon />}
            error={errors.estoque_minimo?.message}
            {...register("estoque_minimo")}
            required
          />

          <Input
            label="Custo Unitário"
            type="number"
            step="0.01"
            iconLeft={<CurrencyDollarIcon />}
            error={errors.custo_unitario?.message}
            {...register("custo_unitario")}
            required
          />
        </div>
      </div>

      {/* Botões de Ação do Formulário */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 ">
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
          {isSubmitting 
            ? "Salvando..." 
            : mode === 'create' ? "Salvar Insumo" : "Atualizar Insumo"
          }
        </Button>
      </div>
    </form>
  )
}