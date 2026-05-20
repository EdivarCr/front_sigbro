import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { 
  PackageIcon,
  CalendarBlankIcon,
  CurrencyDollarIcon,
  WarningIcon,
  TrashIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"

// TODO: Importar isso de um arquivo de serviço quando integrar com a API
interface LoteDetalhe {
  id: number;
  codigo_lote: string;
  produto_nome: string;
  quantidade: number;
  validade: string;
  fabricacao: string;
  custo_total: number;
  custo_unitario: number;
  status: "ATIVO" | "ESGOTADO" | "VENCIDO" | "CANCELADO";
}

export default function DetalhesLotePage() {
  const { id } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [lote, setLote] = useState<LoteDetalhe | null>(null)
  const [loading, setLoading] = useState(true)

  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  
  const onRemover = async () => {
    setIsRemoving(true)
    try {
      // Simulação da API
      await new Promise(resolve => setTimeout(resolve, 800))

      toast({
        title: "Lote Cancelado",
        description: "O status do lote foi alterado para cancelado.",
        variant: "success",
      })

      setLote(prev => prev ? { ...prev, status: "CANCELADO" } : null)
      setRemoveModalOpen(false)
    } catch (error) {
      toast({
        title: "Erro ao cancelar",
        description: "Ocorreu um erro ao tentar cancelar o lote.",
        variant: "danger",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  useEffect(() => {
    async function loadLote() {
      if (!id) return
      try {
        setLoading(true)
        // Simulação da API
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock de dados
        setLote({
          id: Number(id),
          codigo_lote: "LOTE-2605-001",
          produto_nome: "Molho Carolina Reaper",
          quantidade: 50,
          fabricacao: "2026-05-20T10:00:00",
          validade: "2026-12-31",
          custo_total: 250.00,
          custo_unitario: 5.00,
          status: "ATIVO"
        })
      } catch (error) {
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

  const statusLabels: Record<string, { label: string, color: string }> = {
    "ATIVO": { label: "Ativo", color: "bg-(--color-green) text-(--bg-primary)" },
    "ESGOTADO": { label: "Esgotado", color: "bg-(--color-yellow) text-(--bg-primary)" },
    "VENCIDO": { label: "Vencido", color: "bg-(--color-red) text-(--bg-primary)" },
    "CANCELADO": { label: "Cancelado", color: "bg-(--bg-sidebar) text-(--txt-secondary)" }
  };

  if (loading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!lote) {
    return (
      <div className="flex flex-col items-center py-20">
        <h1 className="text-h2">Lote não encontrado</h1>
        <button onClick={() => navigate("/estoque")} className="text-brand underline mt-4">
          Voltar para a listagem
        </button>
      </div>
    )
  }

  return(
    <div className="flex h-full flex-col">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Estoque", to: "/estoque"},
          { label: lote.codigo_lote },
        ]}
      />
      <div className="flex w-full justify-center pt-6">
        <div className="flex flex-col w-full max-w-5xl gap-6">
          
          {/* 1. HEADER DO LOTE */}
          <section className="flex flex-col md:flex-row items-start gap-8 bg-(--bg-surface) p-6 rounded-sm border border-(--bg-sidebar) shadow-sm">          
            <div className="flex flex-col flex-1 w-full">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-sm ${statusLabels[lote.status]?.color}`}>
                    {statusLabels[lote.status]?.label}
                  </span>
                  
                  {lote.status === "VENCIDO" && (
                    <span className="bg-red-500/10 text-red-600 text-[10px] uppercase font-bold px-2 py-1 rounded-sm flex items-center gap-1">
                      <WarningIcon weight="fill" /> Atenção: Lote Vencido
                    </span>
                  )}
                  
                  <div className="ml-auto flex gap-2">
                    {/* AQUI ESTÁ A CORREÇÃO: O navigate agora aponta para /estoque/editar/... */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/estoque/editar/${lote.id}`)}
                    >
                      <PencilSimpleIcon size={16} />
                    </Button> 
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:text-(--color-red)"
                      onClick={() => setRemoveModalOpen(true)}
                    >
                      <TrashIcon size={16} />
                    </Button>
                  </div>
                </div>
                <h1 className="text-h1 text-(--txt-primary)">{lote.codigo_lote}</h1>
                <h2 className="text-h3 text-(--txt-secondary) mt-1">{lote.produto_nome}</h2>
                
                <div className="flex items-center gap-1 text-sm text-(--txt-secondary) opacity-70 mt-4">
                  <span>Registrado em:</span>
                  <span className="font-medium">
                    {new Date(lote.fabricacao).toLocaleDateString('pt-BR')} às {new Date(lote.fabricacao).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. GRID DE INFORMAÇÕES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-(--bg-surface) p-6 rounded-sm border border-(--bg-sidebar) shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-(--bg-sidebar) pb-2">
                <PackageIcon size={20} className="text-(--txt-link)" />
                <h3 className="font-bold uppercase text-body-sm text-(--txt-secondary)">Volume Produzido</h3>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-label text-(--txt-secondary)">Quantidade:</span>
                  <span className="text-sm font-medium text-(--txt-primary)">{lote.quantidade} frascos</span>
                </div>
              </div>
            </div>

            <div className="bg-(--bg-surface) p-6 rounded-sm border border-(--bg-sidebar) shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-(--bg-sidebar) pb-2">
                <CalendarBlankIcon size={20} className="text-(--txt-link)" />
                <h3 className="font-bold uppercase text-body-sm text-(--txt-secondary)">Prazos</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-label text-(--txt-secondary)">Data de Fabricação:</span>
                  <span className="text-sm font-medium text-(--txt-primary)">{new Date(lote.fabricacao).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-label text-(--txt-secondary)">Válido até:</span>
                  <span className="text-sm font-medium text-(--txt-primary)">{new Date(lote.validade).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            <div className="bg-(--bg-surface) p-6 rounded-sm border border-(--bg-sidebar) shadow-sm md:col-span-2">
              <div className="flex items-center gap-2 mb-4 border-b border-(--bg-sidebar) pb-2">
                <CurrencyDollarIcon size={20} className="text-(--txt-link)" />
                <h3 className="font-bold uppercase text-body-sm text-(--txt-secondary)">Custos de Produção</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex justify-between items-center bg-(--bg-primary) p-4 rounded-sm border border-(--bg-sidebar)">
                  <span className="text-label text-(--txt-secondary)">Custo por Unidade:</span>
                  <span className="text-sm font-medium text-(--txt-primary)">R$ {lote.custo_unitario.toFixed(2).replace(".",",")}</span>
                </div>
                <div className="flex justify-between items-center bg-(--bg-primary) p-4 rounded-sm border border-(--bg-sidebar)">
                  <span className="text-label text-(--txt-secondary)">Custo Total do Lote:</span>
                  <span className="text-sm font-medium text-(--txt-primary)">R$ {lote.custo_total.toFixed(2).replace(".",",")}</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <Modal
        key={removeModalOpen ? "remove-open" : "remove-closed"}
        open={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title="Cancelar Lote"
        description="Tem certeza que deseja cancelar este lote? Os produtos serão removidos do estoque ativo e o status será alterado para Cancelado."
        footer={
          <>
            <Button
              variant="outlined"
              disabled={isRemoving}
              onClick={() => setRemoveModalOpen(false)}
            >
              Voltar
            </Button>
            <Button
              variant="secondary"
              onClick={onRemover}
            >
              Confirmar Cancelamento
            </Button>
          </>
        }
      />
    </div>
  )
}