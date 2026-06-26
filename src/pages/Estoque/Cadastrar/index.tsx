import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useToast } from "@/context/ToastContext"
import { useNavigate } from "react-router-dom"
import { PackageIcon } from "@phosphor-icons/react"
import { ProducaoForm } from "@/components/forms/ProducaoForm"
import type { ProducaoCreateData } from "@/schemas/producao.schema"
import { criarEstoque } from "@/services/api/estoque.service"
import { listarProdutos } from "@/services/api/produtos.service"
import { useEffect, useState } from "react"

export default function CadastrarLotePage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    async function loadProdutos() {
      try {
        const resp = await listarProdutos({ limit: 100, offset: 0 })
        // Apenas produtos ativos são listados para seleção
        const produtosFormatados = (resp.products || []).filter((p: any) => p.ativo === true)

        setProdutos(produtosFormatados.map((p) => ({ label: p.nome, value: String(p.id) })))
      } catch (err) {
        setProdutos([])
      }
    }
    loadProdutos()
  }, [])
  

  const onSubmit = async (data: ProducaoCreateData) => {
  try {
    await criarEstoque({
      produto_id: data.produto_id,
      quantidade: data.quantidade,
      validade: data.validade,
    })
    toast({
      title: "Sucesso!",
      description: "Lote de produção registrado com sucesso.",
      variant: "success",
    })
    navigate("/estoque")
  } catch (error: any) {
    const detalhe: string = error?.response?.data?.detail ?? ""

    let titulo = "Erro ao registrar"
    let descricao = "Não foi possível salvar o lote. Tente novamente."

    if (detalhe.includes("Estoque insuficiente")) {
      // Extrai "Necessário: X, Disponível: Y" da mensagem do backend
      const match = detalhe.match(/insumo ID (\d+).*Necessário: ([\d.]+).*Disponível: ([\d.]+)/s)
      titulo = "Estoque de insumos insuficiente"
      descricao = match
        ? `Insumo ID ${match[1]}: necessário ${match[2]} unidades, disponível apenas ${match[3]}. Registre uma entrada de insumo antes de produzir.`
        : "Há insumos com estoque insuficiente para esta produção. Registre entradas de insumo antes de continuar."
    } else if (detalhe.includes("Insumo ID") && detalhe.includes("não cadastrado")) {
      titulo = "Insumo não cadastrado"
      descricao = "A fórmula deste produto contém um insumo que não está cadastrado no sistema. Verifique o cadastro de insumos."
    } else if (detalhe.includes("Produto não encontrado")) {
      titulo = "Produto não encontrado"
      descricao = "O produto selecionado não foi encontrado. Tente recarregar a página."
    } else if (detalhe) {
      descricao = detalhe
    }

    toast({ title: titulo, description: descricao, variant: "danger" })
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
            produtos={produtos}
          />
        </div>
      </div>
    </div>
  )
}