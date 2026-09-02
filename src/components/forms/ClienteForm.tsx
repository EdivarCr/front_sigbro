import { 
  useForm,
  Controller,
  type SubmitHandler,
  type Resolver
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  clienteSchema, 
  type ClienteFormData 
} from "@/schemas/cliente.schema"
import { 
  UserIcon, 
  IdentificationCardIcon, 
  PhoneIcon, 
  EnvelopeSimpleIcon, 
  MapPinIcon,
} from "@phosphor-icons/react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SelectField } from "@/components/ui/select-field"

interface ClienteFormProps {
  onSubmit: (data: ClienteFormData) => void
  defaultValues?: Partial<ClienteFormData>
  mode: 'create' | 'edit'
}

export function ClienteForm({ onSubmit, defaultValues, mode }: ClienteFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema) as Resolver<ClienteFormData>,
    defaultValues: {
      name: defaultValues?.name || "",
      tipo: defaultValues?.tipo || undefined,
      identificador: defaultValues?.identificador || "",
      telefone: defaultValues?.telefone || "",
      email: defaultValues?.email || "",
      endereco: defaultValues?.endereco || "",
    },
    mode: "all",
  })

  const handleFormSubmit: SubmitHandler<ClienteFormData> = (data) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
      
      {/* Dados Principais */}
      <div className="flex flex-col gap-4">
        <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
          Dados do Cliente
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome / Razão Social"
            placeholder="Ex: João da Silva ou Burger & Co."
            required
            iconLeft={<UserIcon />}
            error={errors.name?.message}
            {...register("name")}
          />

          <Controller
            name="tipo"
            control={control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Categoria"
                required
                placeholder="Selecione a categoria"
                options={[
                  { label: "Pessoa Física", value: "PESSOA_FISICA" },
                  { label: "Restaurante", value: "RESTAURANTE" },
                  { label: "Comércio", value: "COMERCIO" },
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="CPF / CNPJ"
            placeholder="Apenas números"
            required
            iconLeft={<IdentificationCardIcon />}
            error={errors.identificador?.message}
            {...register("identificador")}
          />
          
          <Input
            label="Telefone"
            placeholder="Ex: (11) 99999-9999"
            required
            iconLeft={<PhoneIcon />}
            error={errors.telefone?.message}
            {...register("telefone")}
          />
        </div>
      </div>

      {/* Contato e Localização */}
      <div className="flex flex-col gap-4 mt-2">
        <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
          Contato e Localização
        </h3>
        
        <Input
          label="E-mail"
          placeholder="Ex: contato@cliente.com"
          required
          iconLeft={<EnvelopeSimpleIcon />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Endereço Completo"
          placeholder="Ex: Rua das Flores, 123 - Bairro, Cidade - UF"
          required
          iconLeft={<MapPinIcon />}
          error={errors.endereco?.message}
          {...register("endereco")}
        />
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
          {mode === 'create' ? "Cadastrar Cliente" : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  )
}