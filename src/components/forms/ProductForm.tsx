import { 
  useForm,
  Controller,
  type SubmitHandler,
  type Resolver
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  produtoSchema, 
  type ProdutoFormData 
} from "@/schemas/produto.schema"
import { 
  FireIcon, 
  PackageIcon, 
  CurrencyDollarIcon, 
  ScalesIcon, 
  CalendarIcon, 
  NotePencilIcon 
} from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SelectField } from "@/components/ui/select-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "../ui/switch"
import { ImageUploader } from "../ui/image-uploader"

interface ProductFormProps {
  onSubmit: (data: ProdutoFormData) => void
  defaultValues?: ProdutoFormData
  mode: 'create' | 'edit'
}

export function ProductForm({ onSubmit, defaultValues, mode}: ProductFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema) as Resolver<ProdutoFormData>,
    defaultValues: {
      ...defaultValues,
      tipo: (defaultValues?.tipo || "") as any
    },
    mode: "all",
  })

  const handleFormSubmit: SubmitHandler<ProdutoFormData> = (data) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      {mode === 'edit' && (
        <div className="flex items-center justify-between rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-4">
          <div className="flex flex-col">
            <label className="text-label font-bold text-(--txt-primary)">
              Status do Produto
            </label>
            <span className="text-[11px] text-(--txt-secondary)">
              Inative para ocultar este item do catálogo.
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

      {/* Seção 1: Identificação */}
      <div className="flex flex-col">
        <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
          Identificação Básica
        </h3>
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex flex-col items-center">
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageUploader
                  value={typeof field.value === "string" ? field.value : null}
                  onChange={(file) => field.onChange(file)}
                />
              )}
            />
          </div>
          
          <div className="flex flex-1 flex-col gap-4 ">
            <Input
              label="Nome do Produto"
              placeholder="Ex: Molho Habanero Especial"
              required
              error={errors.nome?.message}
              {...register("nome")}
            />

            <Controller
              name="tipo"
              control={control}
              render={({ field, fieldState }) => (
                <SelectField
                  label="Categoria"
                  required
                  placeholder="Selecione uma categoria"
                  options={[
                    { label: "Molho", value: "molho" },
                    { label: "Geleia", value: "geleia" },
                    { label: "Conserva", value: "conserva" },
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
            <Textarea
              label="Descrição e Ingredientes"
              placeholder="Liste os componentes e informações de rotulagem..."
              required
              error={errors.descricao?.message}
              helper="Mínimo de 1 ingrediente conforme normas de rotulagem."
              {...register("descricao")}
              rows={5}
            />
          </div>
        </div>
      </div>

      {/* Seção 2: Precificação e Lucratividade */}
      <div className="flex flex-col">
        <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
          Financeiro
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Preço Varejo (R$)"
            type="number"
            step="0.01"
            iconLeft={<CurrencyDollarIcon />}
            error={errors.preco_varejo?.message}
            {...register("preco_varejo")}
            required
          />
          <Input
            label="Preço Atacado (R$)"
            type="number"
            step="0.01"
            iconLeft={<CurrencyDollarIcon />}
            error={errors.preco_atacado?.message}
            {...register("preco_atacado")}
            required
          />
        </div>
      </div>
      

      {/* Seção 3: Especificações Técnicas */}
      <div className="flex flex-col">
        <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
          Especificações Técnicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Nível de Picância (0-10)"
            type="number"
            min="0"
            iconLeft={<FireIcon />}
            error={errors.nivel_picancia?.message}
            {...register("nivel_picancia")}
          />
          <Input
            label="Peso (gramas)"
            type="number"
            iconLeft={<ScalesIcon />}
            required
            error={errors.peso_gramas?.message}
            {...register("peso_gramas")}
          />
          <Input
            label="Alergênicos"
            placeholder="Ex: Glúten, Soja..."
            iconLeft={<NotePencilIcon />}
            error={errors.alergenicos?.message}
            {...register("alergenicos")}
          />
        </div>
      </div>
      

      {/* Seção 4: Estoque e Logística */}
      <div className="flex flex-col">
        <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
          Estoque e Logística
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Estoque Mínimo"
            type="number"
            iconLeft={<PackageIcon />}
            error={errors.estoque_minimo?.message}
            {...register("estoque_minimo")}
          />
          <Input
            label="Validade (meses)"
            type="number"
            iconLeft={<CalendarIcon />}
            error={errors.validade_meses?.message}
            {...register("validade_meses")}
          />
          <Input
            label="Unidades por Caixa"
            type="number"
            iconLeft={<PackageIcon />}
            error={errors.unidades_por_caixa?.message}
            {...register("unidades_por_caixa")}
            required
          />
        </div>
      </div>
      

      {/* Alerta de Picância Extrema */}
      <div className="rounded-sm bg-(--bg-primary) p-4 border-l-4 border-brand">
        <Checkbox 
          label="Este produto contém Carolina Reaper?" 
          {...register("tem_carolina_reaper")} 
        />
        {/*<p className="text-[10px] text-(--txt-secondary) mt-2 uppercase tracking-wider">
          Atenção: Marcadores visuais de perigo serão aplicados ao catálogo.
        </p>*/}
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button
          type="button"
          variant="outlined"
          className="flex-1"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={!isValid}
        >
          Salvar Produto
        </Button>
      </div>
    </form>
  )
}