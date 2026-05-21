import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SelectField } from "@/components/ui/select-field"
import { useToast } from "@/context/ToastContext"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, Controller, type Resolver, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { PackageIcon, FloppyDiskIcon } from "@phosphor-icons/react"
import { useState, useEffect } from "react"

const producaoEditSchema = z.object({
  quantidade: z.preprocess(
    (val) => Number(val),
    z.number().int("Não pode ser fracionado.").min(0, "A quantidade não pode ser negativa.")
  ),
  status: z.enum(["ATIVO", "ESGOTADO", "VENCIDO", "CANCELADO"]),
})

type ProducaoEditData = z.infer<typeof producaoEditSchema>

export default function EditarLotePage() {
  const { id } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loteInfo, setLoteInfo] = useState<{codigo: string, produto: string} | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProducaoEditData>({
    resolver: zodResolver(producaoEditSchema) as Resolver<ProducaoEditData>,
    mode: "onBlur",
  })

  useEffect(() => {
    async function loadLote() {
      if (!id) return
      try {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 600))
        
        const dadosMock = {
          codigo_lote: "LOTE-2605-001",
          produto_nome: "Molho Carolina Reaper",
          quantidade: 50,
          status: "ATIVO" as const,
        }
        
        setLoteInfo({ codigo: dadosMock.codigo_lote, produto: dadosMock.produto_nome })
        
        reset({
          quantidade: dadosMock.quantidade,
          status: dadosMock.status,
        })
        
      } catch (error) {
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível encontrar este lote.",
          variant: "danger",
        })
        navigate("/estoque") // Rota corrigida
      } finally {
        setLoading(false)
      }
    }
    loadLote()
  }, [id, navigate, reset, toast])

  const onSubmit: SubmitHandler<ProducaoEditData> = async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      toast({
        title: "Lote atualizado!",
        description: "As informações foram salvas com sucesso.",
        variant: "success",
      })

      navigate("/estoque") // Rota corrigida
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o lote. Tente novamente.",
        variant: "danger",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-100 items-center justify-center w-full">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col w-full">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Estoque", to: "/estoque" }, // Rota corrigida
          { label: `Editar: ${loteInfo?.codigo}` },
        ]}
      />
      
      <div className="flex flex-col gap-6 py-8 w-full">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--bg-sidebar) text-brand">
            <PackageIcon size={28} weight="duotone" />
          </div>
          <div>
            <h1 className="text-h2 text-(--txt-primary)">Editar Lote</h1>
            <p className="text-body-sm text-(--txt-secondary)">
              Atualize a quantidade ou o status do lote {loteInfo?.codigo}.
            </p>
          </div>
        </div>

        <div className="flex w-full mt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col gap-6 rounded-sm border border-(--bg-sidebar) bg-(--bg-primary) p-6 shadow-sm">
              
              <div className="flex flex-col gap-1 rounded-sm bg-(--bg-sidebar)/50 p-4 border border-(--bg-sidebar)">
                <span className="text-label text-(--txt-secondary) uppercase font-bold">Produto Vinculado</span>
                <span className="text-body font-medium text-(--txt-primary)">{loteInfo?.produto}</span>
                <span className="text-sm text-(--txt-secondary) mt-1">O produto de um lote de produção já registrado não pode ser alterado.</span>
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
                onClick={() => navigate("/estoque")} // Rota corrigida
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
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                <FloppyDiskIcon />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}