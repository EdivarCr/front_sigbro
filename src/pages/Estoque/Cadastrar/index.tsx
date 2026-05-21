import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useToast } from "@/context/ToastContext"
import { useNavigate } from "react-router-dom"
import { PackageIcon } from "@phosphor-icons/react"
import { ProducaoForm } from "@/components/forms/ProducaoForm"
import type { ProducaoCreateData } from "@/schemas/producao.schema"

// TODO: Buscar da API quando integrar
const MOCK_PRODUTOS = [
  { label: "Molho de Pimenta Carolina Reaper 150ml", value: "1" },
  { label: "Geleia de Pimenta Defumada 200g", value: "2" },
  { label: "Molho de Alho Picante 150ml", value: "3" },
]

export default function CadastrarLotePage() {
  const { toast } = useToast()
  const navigate = useNavigate()

  const onSubmit = async (data: ProducaoCreateData) => {
    try {
      console.log(data)
      await new Promise((resolve) => setTimeout(resolve, 800))

      toast({
        title: "Sucesso!",
        description: "Lote de produção registrado com sucesso.",
        variant: "success",
      })

      navigate("/estoque")
    } catch {
      toast({
        title: "Erro ao registrar",
        description: "Não foi possível salvar o lote. Tente novamente.",
        variant: "danger",
      })
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
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
          <ProducaoForm
            mode="create"
            onSubmit={onSubmit}
            produtos={MOCK_PRODUTOS}
          />
        </div>
      </div>
    </div>
  )
}