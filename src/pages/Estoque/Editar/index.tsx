import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useToast } from "@/context/ToastContext"
import { useNavigate, useParams } from "react-router-dom"
import { PackageIcon } from "@phosphor-icons/react"
import { useState, useEffect } from "react"
import { ProducaoForm } from "@/components/forms/ProducaoForm"
import type { ProducaoEditData } from "@/schemas/producao.schema"
import { atualizarEstoque, listarEstoque } from "@/services/api/estoque.service"
import { buscarProduto } from "@/services/api/produtos.service"

export default function EditarLotePage() {
  const { id } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loteInfo, setLoteInfo] = useState<{ codigo: string; produto: string } | null>(null)
  const [defaultValues, setDefaultValues] = useState<ProducaoEditData | null>(null)

  useEffect(() => {
    async function loadLote() {
      if (!id) return
      try {
        setLoading(true)
        const resp = await listarEstoque({ limit: 200, offset: 0 })
        const lote = resp.producao.find((p: any) => String(p.id) === String(id))
        if (!lote) throw new Error('Lote não encontrado')

        let produtoNome = `Produto ${lote.produto_id}`
        try {
          const prod = await buscarProduto(lote.produto_id)
          produtoNome = prod.nome
        } catch {
          // fallback
        }

        setLoteInfo({ codigo: lote.codigo_lote, produto: produtoNome })
        setDefaultValues({ quantidade: lote.quantidade, status: lote.status })
      } catch {
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível encontrar este lote.",
          variant: "danger",
        })
        navigate("/estoque")
      } finally {
        setLoading(false)
      }
    }
    loadLote()
  }, [id, navigate, toast])

  const onSubmit = async (data: ProducaoEditData) => {
    if (!id) {
      toast({
        title: "Lote inválido",
        description: "Não foi possível identificar o lote para atualização.",
        variant: "danger",
      })
      return
    }

    const loteId = Number(id)
    if (Number.isNaN(loteId)) {
      toast({
        title: "Lote inválido",
        description: "O identificador informado é inválido.",
        variant: "danger",
      })
      return
    }

    try {
      await atualizarEstoque(loteId, {
        quantidade: data.quantidade,
        status: data.status,
      })

      toast({
        title: "Lote atualizado",
        description: "As alterações do lote foram salvas com sucesso.",
        variant: "success",
      })

      navigate("/estoque")
    } catch {
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
          { label: "Gestão de Estoque", to: "/estoque" },
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
          {defaultValues && loteInfo && (
            <ProducaoForm
              mode="edit"
              onSubmit={onSubmit}
              defaultValues={defaultValues}
              loteInfo={loteInfo}
            />
          )}
        </div>
      </div>
    </div>
  )
}