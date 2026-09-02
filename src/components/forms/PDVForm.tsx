import { 
  useForm,
  Controller,
  type SubmitHandler,
  type Resolver
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  pdvSchema, 
  type PDVFormData 
} from "@/schemas/pdv.schema"
import { 
  StorefrontIcon, 
  MapPinIcon, 
  PhoneIcon, 
  InstagramLogoIcon, 
  LinkIcon,
} from "@phosphor-icons/react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SelectField } from "@/components/ui/select-field"
import { Switch } from "@/components/ui/switch"

interface PDVFormProps {
  onSubmit: (data: PDVFormData) => void
  defaultValues?: Partial<PDVFormData>
  mode: 'create' | 'edit'
  clientesOptions: { label: string, value: string }[] // Recebe a lista para o Select
}

export function PDVForm({ onSubmit, defaultValues, mode, clientesOptions }: PDVFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PDVFormData>({
    resolver: zodResolver(pdvSchema) as Resolver<PDVFormData>,
    defaultValues: {
      id_cliente: defaultValues?.id_cliente || undefined,
      name: defaultValues?.name || "",
      tipo_zona: defaultValues?.tipo_zona || undefined,
      endereco: defaultValues?.endereco || "",
      telefone: defaultValues?.telefone || "",
      instagram: defaultValues?.instagram || "",
      google_maps_url: defaultValues?.google_maps_url || "",
      latitude: defaultValues?.latitude || "",
      longitude: defaultValues?.longitude || "",
      ativo: defaultValues?.ativo ?? true,
    },
    mode: "all",
  })

  const handleFormSubmit: SubmitHandler<PDVFormData> = (data) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      
      {mode === 'edit' && (
        <div className="flex items-center justify-between rounded-sm p-4">
          <div className="flex flex-col">
            <label className="text-label font-bold text-(--txt-primary)">
              Status do PDV
            </label>
            <span className="text-[11px] text-(--txt-secondary)">
              Inative para pausar reposições neste ponto.
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

      {/* Identificação e Vínculo */}
      <div className="flex flex-col gap-4">
        <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
          Identificação do Ponto
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="id_cliente"
            control={control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Cliente Vinculado"
                required
                placeholder="Selecione o dono do PDV"
                options={clientesOptions}
                value={field.value ? String(field.value) : ""}
                onValueChange={(val) => {
                  field.onChange(Number(val))
                  field.onBlur()
                }}
                error={fieldState.error?.message}
                disabled={mode === 'edit'} // Não faz sentido mudar o dono do PDV depois de criado
              />
            )}
          />

          <Input
            label="Nome do PDV"
            placeholder="Ex: Quiosque Praia (Sede)"
            required
            iconLeft={<StorefrontIcon />}
            error={errors.name?.message}
            {...register("name")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Telefone do Local"
            placeholder="Ex: (85) 99999-9999"
            iconLeft={<PhoneIcon />}
            error={errors.telefone?.message}
            {...register("telefone")}
          />
          
          <Input
            label="Instagram do Local"
            placeholder="Ex: @quiosquepraia"
            iconLeft={<InstagramLogoIcon />}
            error={errors.instagram?.message}
            {...register("instagram")}
          />
        </div>
      </div>

      {/* Localização */}
      <div className="flex flex-col gap-4 mt-2">
        <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
          Localização e Logística
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="tipo_zona"
            control={control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Zona / Região"
                required
                placeholder="Selecione a zona"
                options={[
                  { label: "Zona Sul", value: "ZONA_SUL" },
                  { label: "Zona Norte", value: "ZONA_NORTE" },
                  { label: "Zona Leste", value: "ZONA_LESTE" },
                  { label: "Zona Oeste", value: "ZONA_OESTE" },
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

          <Input
            label="URL do Google Maps"
            placeholder="Cole o link do Maps aqui"
            iconLeft={<LinkIcon />}
            error={errors.google_maps_url?.message}
            {...register("google_maps_url")}
          />
        </div>

        <Input
          label="Endereço Completo"
          placeholder="Ex: Av. Beira Mar, 1000 - Meireles"
          required
          iconLeft={<MapPinIcon />}
          error={errors.endereco?.message}
          {...register("endereco")}
        />

        {/* Estes campos receberão os dados da API do Maps futuramente 
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-(--bg-primary) p-4 rounded-sm border-l-4 border-brand">
        </div> 
        
        */}
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-2">
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
          {mode === 'create' ? "Cadastrar PDV" : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  )
}