import { Breadcrumb } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { buscarProduto, editarProduto, type ProdutoListItem } from "@/services/api/produtos.service"
import { listarInsumos } from "@/services/api/insumo.service"
import { 
  ScalesIcon, 
  CurrencyDollarIcon, 
  PackageIcon, 
  WarningIcon,
  TrashIcon,
  PencilSimpleIcon,
  NotepadIcon
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Table } from "@/components/ui/table"

export default function VisualizarProdutoPage(){
  const { id } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [produto, setProduto] = useState<ProdutoListItem | null>(null)
  const [insumosDict, setInsumosDict] = useState<Record<number, any>>({})
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined)

  const BUCKET = "SigBro_imgs/"
  const urlBase = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/`
  const activeImageUrl = produto?.imagem_path 
    ? `${urlBase}${BUCKET}${produto.imagem_path}`
    : "https://placehold.co/400x400?text=Sem+Imagem";
  const allImages: string[] = [activeImageUrl]

  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [idParaRemover, setIdParaRemover] = useState<number | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  
  const onRemover = async () => {
    if (!idParaRemover) return

    setIsRemoving(true)
    try {
      await editarProduto(idParaRemover, { ativo: false })

      toast({
        title: "Produto removido",
        description: "O status do produto foi alterado para inativo.",
        variant: "success",
      })

      setProduto(prev => prev ? { ...prev, ativo: false } : null);
      setRemoveModalOpen(false)
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao tentar inativar o produto.",
        variant: "danger",
      })
    } finally {
      setIsRemoving(false)
      setIdParaRemover(null)
    }
  }

  useEffect(() => {
    async function loadProduto() {
      if (!id) return
      try {
        setLoading(true)
        const [dataProduto, dataInsumos] = await Promise.all([
          buscarProduto(Number(id)),
          listarInsumos() 
        ])
        
        if (!dataProduto) throw new Error("Produto não encontrado")
        
        setProduto(dataProduto)

        const dict: Record<number, any> = {}
        if (dataInsumos && dataInsumos.insumos) {
          dataInsumos.insumos.forEach((insumo: any) => {
            dict[insumo.id] = insumo
          })
        }
        setInsumosDict(dict)
        
        const mainImg = dataProduto.imagem_path 
          ? `${urlBase}${BUCKET}${dataProduto.imagem_path}`
          : "https://placehold.co/400x400?text=Sem+Imagem"
        setActiveImage(mainImg)
      } catch (error) {
        toast({
          title: "Erro ao carregar produto",
          description: "Não foi possível encontrar este produto.",
          variant: "danger",
        })
        navigate("/produtos")
      } finally {
        setLoading(false)
      }
    }
    loadProduto()
  }, [id, navigate, toast, urlBase])

  if (loading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="flex flex-col items-center py-20">
        <h1 className="text-h2">Produto não encontrado</h1>
        <button onClick={() => navigate("/produtos")} className="text-brand underline mt-4">
          Voltar para a listagem
        </button>
      </div>
    )
  }

  const colunasReceita = [
    {
      key: "insumo_id",
      label: "Insumo",
      render: (formula: any) => {
        const insumoInfo = insumosDict[formula.insumo_id]
        return (
          <span className="font-medium text-(--txt-primary)">
            {insumoInfo ? insumoInfo.nome : `Insumo ID #${formula.insumo_id}`}
          </span>
        )
      }
    },
    {
      key: "quantidade_necessaria",
      label: "Qtd. Necessária",
      render: (formula: any) => {
        const insumoInfo = insumosDict[formula.insumo_id]
        const unidadeDeMedida = insumoInfo ? insumoInfo.unidade_de_medida : ""
        return (
          <div className="font-mono text-(--txt-secondary)">
            {Number(formula.quantidade_necessaria).toFixed(3).replace(".", ",")} {unidadeDeMedida}
          </div>
        )
      }
    }
  ]

  return(
    <div className="flex h-full flex-col">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Produtos", to: "/produtos"},
          { label: produto.nome },
        ]}
      />
      <div className="flex w-full justify-center pt-6">
        <div className="flex flex-col w-full max-w-271 gap-6">
          {/* 1. HEADER E MÍDIA */}
          <section className="flex flex-col md:flex-row items-start gap-8 bg-(--bg-surface) p-6 rounded-sm border border-(--bg-sidebar) shadow-sm">          
            <div className="flex flex-col w-fit shrink-0 mx-auto md:mx-0 gap-4">
              <img 
                src={activeImage} 
                alt={produto.nome}
                className="size-70 object-cover rounded-sm border-2 border-(--border-input)" 
              />
              <div className="flex gap-2 justify-center md:justify-start">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "size-16 overflow-hidden rounded-sm border transition-all cursor-pointer",
                      activeImage === img 
                        ? "border-(--txt-link) border-2 scale-105" 
                        : "border-(--bg-sidebar) opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={img} className="h-full w-full object-cover" alt={`Miniatura ${i}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-(--txt-link)/10 text-(--txt-link) text-[10px] uppercase font-bold px-2 py-1 rounded-sm">
                    {produto.tipo}
                  </span>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-2 py-1 rounded-sm",
                    produto.ativo
                      ? "bg-green-500/10 text-green-600" 
                      : "bg-gray-500/10 text-gray-400"
                  )}>
                    {produto.ativo ? "Ativo" : "Inativo"}
                  </span>
                  {produto.tem_carolina_reaper && (
                    <span className="bg-red-500/10 text-red-600 text-[10px] uppercase font-bold px-2 py-1 rounded-sm flex items-center gap-1">
                      <WarningIcon weight="fill" /> Tem Carolina Reaper
                    </span>
                  )}
                  <div className="ml-auto">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/produtos/editar/${produto.id}`)}
                    >
                      <PencilSimpleIcon size={16} />
                    </Button> 
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-(--color-red)"
                      onClick={() => {
                        setIdParaRemover(produto.id)
                        setRemoveModalOpen(true)
                      }}
                    >
                      <TrashIcon size={16} />
                    </Button>
                  </div>
                </div>
                <h1 className="text-h1 text-(--txt-primary)">{produto.nome}</h1>
                <div className="flex items-center gap-1 text-sm text-(--txt-secondary) opacity-70">
                  <span>Cadastrado em:</span>
                  <span className="font-medium">
                    {new Date(produto.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-body text-(--txt-secondary) mt-4 italic">
                  "{produto.descricao}"
                </p>
                
              </div>

              <div className="bg-(--bg-primary) p-4 rounded-sm border-l-4 border-(--txt-link) mt-6">
                <h4 className="text-label font-bold uppercase text-(--txt-secondary) mb-2">Alergênicos</h4>
                <p className="text-body-sm text-(--txt-primary)">{produto.alergenicos || "Nenhum alergênico declarado."}</p>
              </div>
            </div>
          </section>

          {/* 2. GRID DE INFORMAÇÕES TÉCNICAS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card: Financeiro */}
            <div className="bg-(--bg-surface) p-6 rounded-sm border border-(--bg-sidebar) shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-(--bg-sidebar) pb-2">
                <CurrencyDollarIcon size={20} className="text-(--txt-link)" />
                <h3 className="font-bold uppercase text-body-sm text-(--txt-secondary)">Financeiro</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-label text-(--txt-secondary)">Varejo:</span>
                  <span className="font-bold text-(--txt-primary)">R$ {Number(produto.preco_varejo).toFixed(2).replace(".",",")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-label text-(--txt-secondary)">Atacado:</span>
                  <span className="font-bold text-(--txt-primary)">R$ {Number(produto.preco_atacado).toFixed(2).replace(".",",")}</span>
                </div>
              </div>
            </div>

            {/* Card: Especificações (RN-01) */}
            <div className="bg-(--bg-surface) p-6 rounded-sm border border-(--bg-sidebar) shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-(--bg-sidebar) pb-2">
                <ScalesIcon size={20} className="text-(--txt-link)" />
                <h3 className="font-bold uppercase text-body-sm text-(--txt-secondary)">Atributos</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-label text-(--txt-secondary)">Peso Líquido:</span>
                  <span className="font-bold text-(--txt-primary)">{produto.peso_gramas}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-label text-(--txt-secondary)">Picância:</span>
                  <span className="font-bold text-(--txt-primary)">{produto.nivel_picancia} / 10</span>
                </div>
              </div>
            </div>

            {/* Card: Logística */}
            <div className="bg-(--bg-surface) p-6 rounded-sm border border-(--bg-sidebar) shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-(--bg-sidebar) pb-2">
                <PackageIcon size={20} className="text-(--txt-link)" />
                <h3 className="font-bold uppercase text-body-sm text-(--txt-secondary)">Logística</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-label text-(--txt-secondary)">Estoque Mín:</span>
                  <span className="font-bold text-(--txt-primary)">{produto.estoque_minimo} un</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-label text-(--txt-secondary)">Validade:</span>
                  <span className="font-bold text-(--txt-primary)">{produto.validade_meses} meses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-label text-(--txt-secondary)">Unids/Caixa:</span>
                  <span className="font-bold text-(--txt-primary)">{produto.unidades_por_caixa} un</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. TABELA DE COMPOSIÇÃO  */}
          {produto.formulas && produto.formulas.length > 0 && (
            <section className="bg-(--bg-surface) p-6 rounded-sm border border-(--bg-sidebar) shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-(--bg-sidebar) pb-2">
                <NotepadIcon size={20} className="text-(--txt-link)" />
                <h3 className="font-bold uppercase text-body-sm text-(--txt-secondary)">Receita / Insumos Necessários</h3>
              </div>
              
              <Table 
                data={produto.formulas} 
                columns={colunasReceita}
                noRenderFooter 
              />
            </section>
          )}
        </div>
      </div>

      {/* Modal de Remoção */}
      <Modal
        key={removeModalOpen ? "remove-open" : "remove-closed"}
        open={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false)
        }}
        title="Remover Produto"
        description="Tem certeza que deseja excluir esse produto? Esta ação não poderá ser desfeita."
        footer={
          <>
            <Button
              variant="outlined"
              disabled={isRemoving}
              onClick={() => {
                setIdParaRemover(produto.id)
                setRemoveModalOpen(false)
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                onRemover()
              }}
            >
              Remover Produto
            </Button>
          </>
        }
      >
      </Modal>

    </div>
  )
}