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
import { listarPDVs, inativarPDV, type PontoDeVenda } from "@/services/api/pdv.service"
import { listarClientes } from "@/services/api/cliente.service"

export default function PDVsPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [search, setSearch] = useState("")
  const [pdvs, setPdvs] = useState<PontoDeVenda[]>([])
  const [clientesMap, setClientesMap] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)

  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [statusFiltro, setStatusFiltro] = useState<string>("")
  const [statusTemp, setStatusTemp] = useState<string>("")
  const [zonaFiltro, setZonaFiltro] = useState<string>("")
  const [zonaTemp, setZonaTemp] = useState<string>("")

  useEffect(() => {
    const carregarMapeamentoClientes = async () => {
      try {
        const response = await listarClientes()
        const mapa: Record<number, string> = {}
        
        if (response && response.costumers) {
          response.costumers.forEach((cliente) => {
            mapa[cliente.id] = cliente.name
          })
        }
        
        setClientesMap(mapa)
      } catch (error) {
        console.error("Erro ao carregar clientes para o mapa de PDVs:", error)
      }
    }

    carregarMapeamentoClientes()
  }, [])

  const fetchPdvs = useCallback(async () => {
    setLoading(true)
    try {
      let ativoQuery: boolean | undefined = undefined;
      if (statusFiltro === "true") ativoQuery = true;
      if (statusFiltro === "false") ativoQuery = false;

      const data = await listarPDVs({
        name: search.trim().length >= 3 ? search.trim() : undefined,
        tipo_zona: zonaFiltro || undefined,
        ativo: ativoQuery
      })
      
      const pdvsOrdenados = (data || []).sort((a, b) => a.id - b.id)

      setPdvs(pdvsOrdenados)
    } catch (error: any) {
      console.error("Erro detalhado do FastAPI:", error.response?.data)
      toast({
        title: "Erro ao carregar PDVs",
        description: "Não foi possível buscar os Pontos de Venda. Tente novamente.",
        variant: "danger",
      })
    } finally {
      setLoading(false)
    }
  }, [search, zonaFiltro, statusFiltro, toast])

  useEffect(() => {
    const handler = setTimeout(() => fetchPdvs(), 500)
    return () => clearTimeout(handler)
  }, [fetchPdvs])

  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [idParaRemover, setIdParaRemover] = useState<number | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  
  const onRemover = async () => {
    if (!idParaRemover) return

    setIsRemoving(true)
    try {
      await inativarPDV(idParaRemover)

      toast({
        title: "PDV inativado",
        description: "O status do Ponto de Venda foi alterado para inativo.",
        variant: "success",
      })

      setRemoveModalOpen(false)
      fetchPdvs()
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao tentar inativar o PDV.",
        variant: "danger",
      })
    } finally {
      setIsRemoving(false)
      setIdParaRemover(null)
    }
  }

  const statusLabels: Record<string, string> = {
    "true": "Ativo",
    "false": "Inativo"
  }

  const zonaLabels: Record<string, string> = {
    "ZONA_SUL": "Zona Sul",
    "ZONA_NORTE": "Zona Norte",
    "ZONA_LESTE": "Zona Leste",
    "ZONA_OESTE": "Zona Oeste"
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Pontos de Venda" },
        ]}
      />
      
      <div className="flex flex-col gap-6 py-8 overflow-hidden">
        <h1 className="text-h1 text-(--txt-primary)">Pontos de Venda</h1>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Buscar por nome do PDV..."
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
                  setZonaTemp(zonaFiltro)
                  setFilterModalOpen(true)
                }}
              >
                Filtrar PDVs
                <FadersIcon />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/pdvs/cadastrar")}
              >
                Novo PDV
                <PlusIcon />
              </Button>
            </div>
          </div>
          
          {/* Área de Tags de Filtro */}
          {(statusFiltro || zonaFiltro) && (
            <div className="flex flex-row gap-2">
              {statusFiltro && (
                <div className="text-body-sm flex items-center gap-1 rounded-xs bg-(--bg-sidebar) px-2 py-1 text-(--txt-primary)">
                  <strong>Status:</strong> {statusLabels[statusFiltro]}
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
              )}
              
              {zonaFiltro && (
                <div className="text-body-sm flex items-center gap-1 rounded-xs bg-(--bg-sidebar) px-2 py-1 text-(--txt-primary)">
                  <strong>Zona:</strong> {zonaLabels[zonaFiltro]}
                  <button
                    onClick={() => {
                      setZonaFiltro("")
                      setZonaTemp("")
                    }}
                    className="ml-1 cursor-pointer text-(--txt-secondary) hover:text-(--color-red)"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              )}
            </div>
          )}
              
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            </div>
          ) : (
            <div className="flex-1 h-full min-h-0">
              {/* Visível apenas no Desktop */}
              <div className="hidden md:flex h-full flex-col flex-1 min-h-0">
                <Table
                  columns={[
                    {
                      key: "id_cliente",
                      label: "Cliente Vinculado",
                      render: (row) => (
                        <span className="text-body-md text-(--txt-primary)">
                          {clientesMap[row.id_cliente] || `Cliente #${row.id_cliente}`}
                        </span>
                      ),
                      sortable: true
                    },
                    { key: "name", label: "Nome do PDV", sortable: true },
                    { 
                      key: "tipo_zona",
                      label: "Zona",
                      sortable: true,
                      render: (row) => {
                        const label = zonaLabels[row.tipo_zona] || row.tipo_zona;

                        const colorClasses: Record<string, string> = {
                          "ZONA_SUL": "bg-(--color-blue)/15 text-(--color-blue)",
                          "ZONA_NORTE": "bg-(--color-red)/15 text-(--color-red)",
                          "ZONA_LESTE": "bg-(--color-yellow)/15 text-(--color-yellow)",
                          "ZONA_OESTE": "bg-(--color-green)/15 text-(--color-green)",
                        };

                        const classeFinal = colorClasses[row.tipo_zona] || "bg-(--bg-sidebar) text-(--txt-secondary)";

                        return (
                          <span className={`text-body-sm rounded-full px-2 py-0.5 font-medium ${classeFinal}`}>
                            {label}
                          </span>
                        );
                      },
                    },
                    { key: "endereco", label: "Endereço" },
                    { 
                      key: "telefone", 
                      label: "Contato",
                      render: (row) => row.telefone || "Não informado"
                    },
                    {
                      key: "ativo",
                      label: "Status",
                      render: (row) => (
                        <span
                          className={`text-body-sm rounded-full px-2 py-0.5 font-medium ${
                            row.ativo 
                              ? "bg-(--color-green)/15 text-(--color-green)"
                              : "bg-(--bg-sidebar) text-(--txt-secondary)"
                          }`}
                        >
                          {row.ativo ? "Ativo" : "Inativo"}
                        </span>
                      )
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
                            onClick={() => navigate(`/pdvs/${row.id}`)}
                          >
                            <EyeIcon size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/pdvs/editar/${row.id}`)}
                          >
                            <PencilSimpleIcon size={16} />
                          </Button>
                          {row.ativo && (
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
                          )}
                        </div>
                      ),
                    },
                  ]}
                  data={pdvs}
                  pageSize={10}
                  emptyValue="N/A"
                />
              </div>

              {/* Visível apenas no Mobile */}
              <div className="flex md:hidden h-full flex-col min-h-0 overflow-y-auto">
                <MobileTable 
                  columns={[
                    { key: "name", label: "PDV" },
                    {
                      key: "id_cliente",
                      label: "Cliente",
                      render: (row) => (
                        <span className="text-body-sm font-medium text-(--txt-secondary)">
                          {clientesMap[row.id_cliente] || `Cliente #${row.id_cliente}`}
                        </span>
                      )
                    },
                    { 
                      key: "tipo_zona",
                      label: "Zona",
                      render: (row) => {
                        const label = zonaLabels[row.tipo_zona] || row.tipo_zona;
                        const colorClasses: Record<string, string> = {
                          "ZONA_SUL": "bg-(--color-blue)/15 text-(--color-blue)",
                          "ZONA_NORTE": "bg-(--color-red)/15 text-(--color-red)",
                          "ZONA_LESTE": "bg-(--color-yellow)/15 text-(--color-yellow)",
                          "ZONA_OESTE": "bg-(--color-green)/15 text-(--color-green)",
                        };
                        const classeFinal = colorClasses[row.tipo_zona] || "bg-(--bg-sidebar) text-(--txt-secondary)";

                        return (
                          <span className={`text-body-sm rounded-full px-2 py-0.5 font-medium ${classeFinal}`}>
                            {label}
                          </span>
                        );
                      },
                    },
                    { 
                      key: "ativo", 
                      label: "Status", 
                      render: (row) => (
                        <span className={row.ativo ? "text-(--color-green)" : "text-(--txt-secondary)"}>
                          {row.ativo ? "Ativo" : "Inativo"}
                        </span>
                      )
                    },
                  ]}
                  renderRightActions={(pdv) => (
                    <>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/pdvs/editar/${pdv.id}`)}>
                        <PencilSimpleIcon size={16} />
                      </Button>
                      {pdv.ativo && (
                        <Button variant="ghost" size="sm" className="text-(--txt-secondary) hover:text-(--color-red) hover:bg-(--bg-sidebar)" onClick={() => {
                          setIdParaRemover(pdv.id)
                          setRemoveModalOpen(true)
                        }}>
                          <TrashIcon size={16} />
                        </Button>
                      )}
                    </>
                  )}
                  renderBottomAction={(pdv) => (
                    <Button 
                      variant="primary" 
                      className="w-full gap-2 border-none"
                      onClick={() => navigate(`/pdvs/${pdv.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  )}
                  data={pdvs}
                  emptyValue="N/A"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/*Modal de Filtros*/}
      <Modal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="Filtrar PDVs"
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setStatusFiltro("")
                setStatusTemp("")
                setZonaFiltro("")
                setZonaTemp("")
                setFilterModalOpen(false)
              }}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setStatusFiltro(statusTemp)
                setZonaFiltro(zonaTemp)
                setFilterModalOpen(false)
              }}
            >
              Aplicar
            </Button>
          </>
        }
      >
        <SelectField
          label="Status"
          placeholder="Todos os status"
          options={[
            { label: "Ativo", value: "true" },
            { label: "Inativo", value: "false" },
          ]}
          value={statusTemp}
          onValueChange={setStatusTemp}
        />
        <SelectField
          label="Região (Zona)"
          placeholder="Todas as zonas"
          options={[
            { label: "Zona Sul", value: "ZONA_SUL" },
            { label: "Zona Norte", value: "ZONA_NORTE" },
            { label: "Zona Leste", value: "ZONA_LESTE" },
            { label: "Zona Oeste", value: "ZONA_OESTE" },
          ]}
          value={zonaTemp}
          onValueChange={setZonaTemp}
        />
      </Modal>

      {/* Modal de Remoção / Inativação */}
      <Modal
        key={removeModalOpen ? "remove-open" : "remove-closed"}
        open={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title="Inativar PDV"
        description="Tem certeza que deseja inativar este Ponto de Venda? Ele não aparecerá mais como opção ativa para novas reposições."
        footer={
          <>
            <Button
              variant="outlined"
              disabled={isRemoving}
              onClick={() => setRemoveModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              disabled={isRemoving}
              onClick={() => onRemover()}
            >
              {isRemoving ? "Inativando..." : "Inativar PDV"}
            </Button>
          </>
        }
      >
      </Modal>
    </div>
  )
}