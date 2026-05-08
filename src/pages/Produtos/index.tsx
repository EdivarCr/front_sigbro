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
import { listarProdutos, type ProdutoListItem } from "@/services/api/produtos.service"
import { useToast } from "@/context/ToastContext"
import { useNavigate } from "react-router-dom"

export default function ProdutosPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [search, setSearch] = useState("")
  const [produtos, setProdutos] = useState<ProdutoListItem[]>([])
  const [loading, setLoading] = useState(true)

  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [statusFiltro, setStatusFiltro] = useState<string>("")
  const [statusTemp, setStatusTemp] = useState<string>("")
  const [tipoFiltro, setTipoFiltro] = useState<string>("")
  const [tipoTemp, setTipoTemp] = useState<string>("")

  const fetchProdutos = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listarProdutos({
        nome: search.trim().length >= 3 ? search : undefined,
        tipo: tipoFiltro || undefined,
        ativo: statusFiltro !== "" ? statusFiltro === "true" : undefined,
      })
      setProdutos(data.products)
    } catch {
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível buscar os produtos. Tente novamente.",
        variant: "danger",
      })
    } finally {
      setLoading(false)
    }
  }, [search, tipoFiltro, statusFiltro, toast])

  useEffect(() => {
    const handler = setTimeout(() => fetchProdutos(), 500) // Só vusca se o usuário parar de digitar por 500ms
    return () => clearTimeout(handler)
  }, [fetchProdutos])

  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  // const removerForm aqui, se necessário !
  // const onRemover aqui, se necessário

  const statusLabels: Record<string, string> = {
    "true": "Ativo",
    "false": "Inativo"
  };

  const tipoLabels: Record<string, string> = {
    "molho": "Molho",
    "geleia": "Geleia",
    "conserva": "Conserva"
  };

  return (
    <div className="flex h-full flex-col min-h-0">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Produtos" },
        ]}
      />
      <div className="flex flex-col gap-6 py-8 overflow-hidden">
        <h1 className="text-h1 text-(--txt-primary)">Gestão de Produtos</h1>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Nome do Produto"
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
                  setTipoTemp(tipoFiltro)
                  setFilterModalOpen(true)
                }}
              >
                Filtrar Produtos
                <FadersIcon />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => 
                  navigate("/produtos/cadastrar")
                }
              >
                Cadastrar Produto
                <PlusIcon />
              </Button>
            </div>
          </div>
          
          {/* Área de Tags de Filtro */}
          {(statusFiltro || tipoFiltro) && (
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
              
              {tipoFiltro && (
                <div className="text-body-sm flex items-center gap-1 rounded-xs bg-(--bg-sidebar) px-2 py-1 text-(--txt-primary)">
                  <strong>Tipo:</strong> {tipoLabels[tipoFiltro]}
                  <button
                    onClick={() => {
                      setTipoFiltro("")
                      setTipoTemp("")
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
                    { key: "nome", label: "Nome", sortable: true },
                    { key: "tipo", label: "Tipo", sortable: true },
                    {
                      key: "preco_varejo",
                      label: "Preço Varejo",
                      sortable: true,
                      render: (row) => `R$ ${Number(row.preco_varejo).toFixed(2).replace(".", ",")}`,
                    },
                    {
                      key: "preco_atacado",
                      label: "Preço Atacado",
                      sortable: true,
                      render: (row) => `R$ ${Number(row.preco_atacado).toFixed(2).replace(".", ",")}`,
                    },
                    {
                      key: "nivel_picancia",
                      label: "Picância",
                      sortable: true,
                      render: (row) => `${row.nivel_picancia}/10`,
                    },
                    {
                      key: "tem_carolina_reaper",
                      label: "Carolina Reaper",
                      render: (row) => row.tem_carolina_reaper ? "Sim" : "Não",
                    },
                    {
                      key: "peso_gramas",
                      label: "Peso (g)",
                      sortable: true,
                      render: (row) => `${row.peso_gramas}g`,
                    },
                    {
                      key: "estoque_minimo",
                      label: "Est. Mínimo",
                      sortable: true,
                    },
                    {
                      key: "validade_meses",
                      label: "Validade (meses)",
                      sortable: true,
                    },
                    {
                      key: "unidades_por_caixa",
                      label: "Un./Caixa",
                      sortable: true,
                    },
                    {
                      key: "ativo",
                      label: "Status",
                      render: (row) => (
                        <span className={`text-label w-fit px-2 py-0.5 rounded-full ${
                          row.ativo
                            ? "bg-(--color-green) text-(--txt-on-brand)"
                            : "bg-(--bg-sidebar) text-(--txt-secondary)"
                        }`}>
                          {row.ativo ? "Ativo" : "Inativo"}
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
                            onClick={() => navigate(`/produtos/${row.id}`)}
                          >
                            <EyeIcon size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/produtos/editar/${row.id}`)}
                          >
                            <PencilSimpleIcon size={16} />
                          </Button>
                          {row.ativo && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:text-(--color-red)"
                              onClick={() => setRemoveModalOpen(true)}
                            >
                              <TrashIcon size={16} />
                            </Button>
                          )}
                        </div>
                      ),
                    },
                  ]}
                  data={produtos}
                  pageSize={10}
                  emptyValue="N/A"
                />
              </div>

              {/* Visível apenas no Mobile */}
              <div className="flex md:hidden h-full flex-col min-h-0 overflow-y-auto">
                <MobileTable 
                  columns={[
                    { key: "nome", label: "Produto" },
                    { key: "tipo", label: "Categoria" },
                    { 
                      key: "preco_varejo", 
                      label: "Preço", 
                      render: (row) => `R$ ${Number(row.preco_varejo).toFixed(2).replace(".", ",")}` 
                    },
                  ]}
                  renderRightActions={(produto) => (
                    <>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/produtos/editar/${produto.id}`)}>
                        <PencilSimpleIcon size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-(--txt-secondary) hover:text-(--color-red) hover:bg-(--bg-sidebar)" onClick={() => setRemoveModalOpen(true)}>
                        <TrashIcon size={16} />
                      </Button>
                    </>
                  )}
                  renderBottomAction={(produto) => (
                    <Button 
                      variant="primary" 
                      className="w-full gap-2 border-none"
                      onClick={() => navigate(`/produtos/${produto.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  )}
                  data={produtos}
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
        title="Filtrar Produtos"
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setStatusFiltro("")
                setStatusTemp("")
                setTipoFiltro("")
                setTipoTemp("")
                setFilterModalOpen(false)
              }}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // O filtro real recebe o que foi selecionado no modal
                setStatusFiltro(statusTemp)
                setTipoFiltro(tipoTemp)
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
          label="Tipo"
          placeholder="Todos os tipos"
          options={[
            { label: "Molho", value: "molho" },
            { label: "Geleia", value: "geleia" },
            { label: "Conserva", value: "conserva" },
          ]}
          value={tipoTemp}
          onValueChange={setTipoTemp}
        />
      </Modal>

      {/* Modal de Remoção */}
      <Modal
        key={removeModalOpen ? "remove-open" : "remove-closed"}
        open={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false)
          //removerForm.reset()
        }}
        title="Remover Produto"
        description="Tem certeza que deseja excluir esse produto? Esta ação não poderá ser desfeita."
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setRemoveModalOpen(false)
                //removerForm.reset()
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              //disabled={!removerForm.formState.isValid}
              //onClick={removerForm.handleSubmit(onRemover)}
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
