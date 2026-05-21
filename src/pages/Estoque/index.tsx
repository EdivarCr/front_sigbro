import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Table } from "@/components/ui/table"
import { MobileTable } from "@/components/ui/mobile-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { SelectField } from "@/components/ui/select-field"
import {
  FadersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilSimpleIcon,  
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react"
import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/context/ToastContext"
import { useNavigate } from "react-router-dom"

export interface LoteListItem {
  id: number;
  codigo_lote: string;
  produto_nome: string;
  quantidade: number;
  validade: string;
  status: "ATIVO" | "ESGOTADO" | "VENCIDO" | "CANCELADO";
}

const MOCK_LOTES: LoteListItem[] = [
  { id: 1, codigo_lote: "LOTE-2605-001", produto_nome: "Molho Carolina Reaper", quantidade: 50, validade: "2026-12-31", status: "ATIVO" },
  { id: 2, codigo_lote: "LOTE-2605-002", produto_nome: "Geleia de Pimenta", quantidade: 0, validade: "2026-10-15", status: "ESGOTADO" },
]

export default function EstoquePage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [search, setSearch] = useState("")
  const [lotes, setLotes] = useState<LoteListItem[]>([])
  const [loading, setLoading] = useState(true)

const totalItens = lotes.reduce((acc, l) => acc + l.quantidade, 0)
const estoqueCritico = lotes.filter(l => l.quantidade === 0).length
const validadeProxima = lotes.filter(l => {
  const diff = new Date(l.validade).getTime() - new Date().getTime()
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 90
}).length


  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [statusFiltro, setStatusFiltro] = useState<string>("")
  const [statusTemp, setStatusTemp] = useState<string>("")

  const fetchLotes = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      let filtrados = [...MOCK_LOTES]
      
      if (search.trim().length >= 3) {
        filtrados = filtrados.filter(l => l.codigo_lote.toLowerCase().includes(search.toLowerCase()))
      }
      if (statusFiltro) {
        filtrados = filtrados.filter(l => l.status === statusFiltro)
      }

      setLotes(filtrados)
    } catch {
      toast({
        title: "Erro ao carregar lotes",
        description: "Não foi possível buscar a produção. Tente novamente.",
        variant: "danger",
      })
    } finally {
      setLoading(false)
    }
  }, [search, statusFiltro, toast])

  useEffect(() => {
    const handler = setTimeout(() => fetchLotes(), 500)
    return () => clearTimeout(handler)
  }, [fetchLotes])

  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [idParaRemover, setIdParaRemover] = useState<number | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  
  const onRemover = async () => {
    if (!idParaRemover) return

    setIsRemoving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      toast({
        title: "Lote removido",
        description: "O lote foi cancelado com sucesso.",
        variant: "success",
      })

      setRemoveModalOpen(false)
      fetchLotes()
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao tentar cancelar o lote.",
        variant: "danger",
      })
    } finally {
      setIsRemoving(false)
      setIdParaRemover(null)
    }
  }

  const statusLabels: Record<string, { label: string, color: string }> = {
    "ATIVO": { label: "Ativo", color: "bg-(--color-green) text-(--bg-primary)" },
    "ESGOTADO": { label: "Esgotado", color: "bg-(--color-yellow) text-(--bg-primary)" },
    "VENCIDO": { label: "Vencido", color: "bg-(--color-red) text-(--bg-primary)" },
    "CANCELADO": { label: "Cancelado", color: "bg-(--bg-sidebar) text-(--txt-secondary)" }
  };

  return (
    <div className="flex h-full flex-col min-h-0">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Estoque" },
        ]}
      />
      <div className="flex flex-col gap-6 py-8">
        <h1 className="text-h1 text-(--txt-primary)">Lotes de Produção</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  <div className="flex flex-col gap-1 rounded-sm border border-(--bg-sidebar) bg-(--bg-primary) p-5 shadow-sm">
    <span className="text-body-sm text-(--txt-secondary)">Itens em Estoque</span>
    <span className="text-h2 font-bold text-(--txt-primary)">{totalItens} itens</span>
    <span className="text-label text-(--txt-secondary)">De {lotes.length} produtos</span>
  </div>
  <div className="flex flex-col gap-1 rounded-sm border border-(--bg-sidebar) bg-(--bg-primary) p-5 shadow-sm">
    <span className="text-body-sm text-(--txt-secondary)">Produtos em Estoque Crítico</span>
    <span className="text-h2 font-bold text-(--txt-primary)">{estoqueCritico} produtos</span>
    <span className="text-label text-(--color-red)">Abaixo do estoque mínimo</span>
  </div>
  <div className="flex flex-col gap-1 rounded-sm border border-(--bg-sidebar) bg-(--bg-primary) p-5 shadow-sm">
    <span className="text-body-sm text-(--txt-secondary)">Validade Próxima</span>
    <span className="text-h2 font-bold text-(--txt-primary)">{validadeProxima} lotes</span>
    <span className="text-label text-(--color-yellow)">Próximos do vencimento</span>
  </div>
</div>

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Buscar por Código do Lote"
                iconRight={<MagnifyingGlassIcon />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex shrink-0 flex-col gap-2 md:flex-row">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setStatusTemp(statusFiltro)
                  setFilterModalOpen(true)
                }}
              >
                Filtrar Lotes
                <FadersIcon />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/estoque/cadastrar")}
              >
                Registrar Produção
                <PlusIcon />
              </Button>
            </div>
          </div>
          
          {statusFiltro && (
            <div className="flex flex-row gap-2">
              <div className="text-body-sm flex items-center gap-1 rounded-xs bg-(--bg-sidebar) px-2 py-1 text-(--txt-primary)">
                <strong>Status:</strong> {statusLabels[statusFiltro]?.label}
                <button
                  onClick={() => {
                    setStatusFiltro("")
                    setStatusTemp("")
                  }}
                  className="ml-1 cursor-pointer text-(--txt-secondary) hover:text-(--color-red)"
                >
                  <XIcon size={12} />
                </button>
              </div>
            </div>
          )}
              
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            </div>
          ) : (
            <div className="flex-1 h-full min-h-0">
              <div className="hidden md:flex h-full flex-col flex-1 min-h-0">
                <Table
                  columns={[
                    { key: "codigo_lote", label: "Código do Lote", sortable: true },
                    { key: "produto_nome", label: "Produto", sortable: true },
                    { key: "quantidade", label: "Quantidade", sortable: true },
                    { 
                      key: "validade", 
                      label: "Validade", 
                      sortable: true,
                      render: (row) => new Date(row.validade).toLocaleDateString('pt-BR')
                    },
                    {
                      key: "status",
                      label: "Status",
                      render: (row) => (
                        <span className={`text-label w-fit px-2 py-0.5 rounded-full ${statusLabels[row.status]?.color}`}>
                          {statusLabels[row.status]?.label}
                        </span>
                      ),
                    },
                    {
                      key: "acoes",
                      label: "Ações",
                      className: "w-32",
                      render: (row) => (
                        <div className="-ml-2 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/estoque/${row.id}`)}
                          >
                            <EyeIcon size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/estoque/editar/${row.id}`)}
                          >
                            <PencilSimpleIcon size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:text-(--color-red)"
                            onClick={() => {
                              setIdParaRemover(row.id)
                              setRemoveModalOpen(true)
                            }}
                          >
                            <TrashIcon size={16} />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                  data={lotes}
                  pageSize={10}
                  emptyValue="N/A"
                />
              </div>

              <div className="flex md:hidden h-full flex-col min-h-0 overflow-y-auto">
                <MobileTable 
                  columns={[
                    { key: "codigo_lote", label: "Lote" },
                    { key: "produto_nome", label: "Produto" },
                    { key: "quantidade", label: "Qtd." },
                  ]}
                  renderRightActions={(lote) => (
                    <>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/estoque/editar/${lote.id}`)}>
                        <PencilSimpleIcon size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-(--txt-secondary) hover:text-(--color-red) hover:bg-(--bg-sidebar)" onClick={() => {
                        setIdParaRemover(lote.id)
                        setRemoveModalOpen(true)
                      }}>
                        <TrashIcon size={16} />
                      </Button>
                    </>
                  )}
                  renderBottomAction={(lote) => (
                    <Button 
                      variant="primary" 
                      className="w-full gap-2 border-none"
                      onClick={() => navigate(`/estoque/${lote.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  )}
                  data={lotes}
                  emptyValue="N/A"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Modal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="Filtrar Lotes"
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setStatusFiltro("")
                setStatusTemp("")
                setFilterModalOpen(false)
              }}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setStatusFiltro(statusTemp)
                setFilterModalOpen(false)
              }}
            >
              Aplicar
            </Button>
          </>
        }
      >
        <SelectField
          label="Status do Lote"
          placeholder="Todos os status"
          options={[
            { label: "Ativo", value: "ATIVO" },
            { label: "Esgotado", value: "ESGOTADO" },
            { label: "Vencido", value: "VENCIDO" },
            { label: "Cancelado", value: "CANCELADO" },
          ]}
          value={statusTemp}
          onValueChange={setStatusTemp}
        />
      </Modal>

      <Modal
        key={removeModalOpen ? "remove-open" : "remove-closed"}
        open={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title="Cancelar Lote"
        description="Tem certeza que deseja cancelar este lote? Esta ação removerá os produtos do estoque disponível."
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