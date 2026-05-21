import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SelectField } from "@/components/ui/select-field"
import { useToast } from "@/context/ToastContext"
import { useNavigate } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PackageIcon, FloppyDiskIcon } from "@phosphor-icons/react"

const producaoCreateSchema = z.object({
  produto_id: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Obrigatório selecionar um produto.")
  ),
  quantidade: z.preprocess(
    (val) => Number(val),
    z.number().int("Não pode ser fracionado.").min(1, "A quantidade deve ser maior que zero.")
  ),
})

type ProducaoFormData = z.infer<typeof producaoCreateSchema>

const MOCK_PRODUTOS = [
  { label: "Molho de Pimenta Carolina Reaper 150ml", value: "1" },
  { label: "Geleia de Pimenta Defumada 200g", value: "2" },
  { label: "Molho de Alho Picante 150ml", value: "3" },
]

export default function CadastrarLotePage() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProducaoFormData>({
    resolver: zodResolver(producaoCreateSchema) as Resolver<ProducaoFormData>,
    mode: "onBlur",
  })

  const onSubmit = async (data: ProducaoFormData) => {
    try {
      console.log(data)
      
      await new Promise((resolve) => setTimeout(resolve, 800))

      toast({
        title: "Sucesso!",
        description: "Lote de produção registrado com sucesso.",
        variant: "success",
      })

      navigate("/estoque")
    } catch (error) {
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível salvar o lote. Tente novamente.",
        variant: "danger",
      })
    }
  }

  return (
    <div className="flex h-full w-full flex-col min-h-0">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Estoque", to: "/estoque" },
          { label: "Registrar Produção" },
        ]}
      />
      
      <div className="flex flex-col gap-6 py-8 w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--bg-sidebar) text-brand">
            <PackageIcon size={28} weight="duotone" />
          </div>
          <div>
            <h1 className="text-h2 text-(--txt-primary)">Registrar Produção</h1>
            <p className="text-body-sm text-(--txt-secondary)">
              Dê entrada em um novo lote de produtos finalizados.
            </p>
          </div>
        </div>

        <div className="flex w-full mt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col gap-4 rounded-sm border border-(--bg-sidebar) bg-(--bg-primary) p-6 shadow-sm">
              
              <div className="flex w-full flex-col gap-1">
                <Controller
                  name="produto_id"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Produto"
                      placeholder="Selecione o produto fabricado"
                      options={MOCK_PRODUTOS}
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
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar Lote"}
                <FloppyDiskIcon />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}