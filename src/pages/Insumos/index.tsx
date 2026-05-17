import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/context/ToastContext"
import { InsumoForm } from "@/components/forms/InsumoForm"
import { type InsumoFormData } from "@/schemas/insumos.schema"

import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Table } from "@/components/ui/table"
import { MobileTable } from "@/components/ui/mobile-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import {
  FadersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react"
// Imports de insumos.service aqui

// Interface espelhando o backend para digitação dos dados locais
interface InsumoItem {
  id: number
  nome: string
  tipo: "MP" | "EMBALAGEM" | "OUTRO"
  unidade_de_medida: "KG" | "G" | "L" | "ML" | "UN"
  quantidade_estoque: number
  estoque_minimo: number
  custo_unitario: number
  ativo: boolean
}

// Dados mockados realistas para a produção da Dr. Broa
const MOCK_INSUMOS: InsumoItem[] = [
  {
    id: 1,
    nome: "Pimenta Malagueta",
    tipo: "MP",
    unidade_de_medida: "KG",
    quantidade_estoque: 45.5,
    estoque_minimo: 10.0,
    custo_unitario: 15.5,
    ativo: true,
  },
  {
    id: 2,
    nome: "Garrafa de Vidro 500ml",
    tipo: "EMBALAGEM",
    unidade_de_medida: "UN",
    quantidade_estoque: 120,
    estoque_minimo: 200,
    custo_unitario: 2.1,
    ativo: true,
  },
  {
    id: 3,
    nome: "Vinagre de Álcool",
    tipo: "MP",
    unidade_de_medida: "L",
    quantidade_estoque: 8.0,
    estoque_minimo: 15.0,
    custo_unitario: 4.8,
    ativo: true,
  },
  {
    id: 4,
    nome: "Extrato de Tomate",
    tipo: "MP",
    unidade_de_medida: "KG",
    quantidade_estoque: 0.5,
    estoque_minimo: 5.0,
    custo_unitario: 9.3,
    ativo: false,
  },
]

export default function InsumosPage() {
  const { toast } = useToast()

  const [search, setSearch] = useState("")
  const [insumos, setInsumos] = useState<InsumoItem[]>([])
  const [loading, setLoading] = useState(true)

  const [filterModalOpen, setFilterModalOpen] = useState(false)
  // filtro e temp de cada filtro específico de insumo

  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [idParaRemover, setIdParaRemover] = useState<number | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  // Modais de Formulário
  const [cadastroModalOpen, setCadastroModalOpen] = useState(false)
  const [edicaoModalOpen, setEdicaoModalOpen] = useState(false)
  const [insumoSelecionado, setInsumoSelecionado] = useState<InsumoItem | null>(
    null
  )

  // Busca local por enquanto
  const fetchInsumos = useCallback(async () => {
    setLoading(true)
    try {
      const filtrados = MOCK_INSUMOS.filter((item) =>
        item.nome.toLowerCase().includes(search.toLowerCase())
      )
      setInsumos(filtrados)
    } catch {
      toast({
        title: "Erro ao carregar insumos",
        description:
          "Não foi possível buscar os insumos cadastrados. Tente novamente.",
        variant: "danger",
      })
    } finally {
      setLoading(false)
    }
  }, [search, toast])

  useEffect(() => {
    const handler = setTimeout(() => fetchInsumos(), 500)
    return () => clearTimeout(handler)
  }, [fetchInsumos])

  const onCadastrar = async (data: InsumoFormData) => {
    try {
      console.log("Payload de Cadastro para o FastAPI:", data)

      toast({
        title: "Sucesso!",
        description: "Insumo cadastrado com sucesso (Mock).",
        variant: "success",
      })

      setCadastroModalOpen(false)
      fetchInsumos()
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao cadastrar insumo.",
        variant: "danger",
      })
    }
  }

  const onEditar = async (data: InsumoFormData) => {
    try {
      console.log(`Payload de Edição para o ID ${insumoSelecionado?.id}:`, data)

      toast({
        title: "Sucesso!",
        description: "Insumo atualizado com sucesso (Mock).",
        variant: "success",
      })

      setEdicaoModalOpen(false)
      setInsumoSelecionado(null)
      fetchInsumos()
    } catch {
      toast({
        title: "Erro",
        description: "Falha ao editar insumo.",
        variant: "danger",
      })
    }
  }

  const onRemover = async () => {
    if (!idParaRemover) return

    setIsRemoving(true)
    try {
      // algo como await removerInsumo(idParaRemover)

      toast({
        title: "Insumo removido",
        description: "O insumo foi removido com sucesso.",
        variant: "success",
      })

      setRemoveModalOpen(false)
      fetchInsumos()
    } catch {
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao tentar remover o insumo.",
        variant: "danger",
      })
    } finally {
      setIsRemoving(false)
      setIdParaRemover(null)
    }
  }

  // constantes de labels de filtros de insumo

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Insumos" },
        ]}
      />
      <div className="flex flex-col gap-6 overflow-hidden py-8">
        <h1 className="text-h1 text-(--txt-primary)">Gestão de Insumos</h1>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Nome do Insumo"
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
                  //setStatusTemp de cada filtro de insumo
                  setFilterModalOpen(true)
                }}
              >
                Filtrar Insumos
                <FadersIcon />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setCadastroModalOpen(true)}
              >
                Cadastrar Insumo
                <PlusIcon />
              </Button>
            </div>
          </div>

          {/* Área de Tags de Filtro */}

          {/* Área de Carregamento e Tabelas*/}
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="border-brand h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            </div>
          ) : (
            <div className="h-full min-h-0 flex-1">
              {/* Visível apenas no Desktop */}
              <div className="hidden h-full min-h-0 flex-1 flex-col md:flex">
                <Table
                  columns={[
                    { key: "nome", label: "Nome", sortable: true },
                    {
                      key: "tipo",
                      label: "Tipo",
                      render: (row: InsumoItem) => (
                        <span className="bg-brand/10 text-body-sm text-brand rounded-full px-2 py-0.5 font-medium">
                          {row.tipo === "MP"
                            ? "Matéria-Prima"
                            : row.tipo === "EMBALAGEM"
                              ? "Embalagem"
                              : "Outros"}
                        </span>
                      ),
                    },
                    {
                      key: "quantidade_estoque",
                      label: "Estoque Atual",
                      sortable: true,
                      render: (row: InsumoItem) => (
                        <span
                          className={
                            row.quantidade_estoque <= row.estoque_minimo
                              ? "font-bold text-(--color-red)"
                              : ""
                          }
                        >
                          {Number(row.quantidade_estoque).toFixed(3)}{" "}
                          {row.unidade_de_medida.toLowerCase()}
                        </span>
                      ),
                    },
                    {
                      key: "estoque_minimo",
                      label: "Estoque Mínimo",
                      sortable: true,
                      render: (row: InsumoItem) => (
                        <span>
                          {Number(row.estoque_minimo).toFixed(3)}
                          {row.unidade_de_medida.toLowerCase()}
                        </span>
                      ),
                    },
                    {
                      key: "custo_unitario",
                      label: "Custo Unitário",
                      sortable: true,
                      render: (row: InsumoItem) => (
                        <span>
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(row.custo_unitario)}
                        </span>
                      ),
                    },
                    {
                      key: "ativo",
                      label: "Status",
                      render: (
                        row: InsumoItem // Mudar essa formatação depois
                      ) => (
                        <span
                          className={`text-body-sm ${row.ativo ? "text-success" : "text-(--txt-secondary)"}`}
                        >
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
                            onClick={() => {
                              setInsumoSelecionado(row)
                              setEdicaoModalOpen(true)
                            }}
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
                  data={insumos}
                  pageSize={10}
                  emptyValue="N/A"
                />
              </div>

              {/* Visível apenas no Mobile */}
              <div className="flex h-full min-h-0 flex-col overflow-y-auto md:hidden">
                <MobileTable
                  columns={[
                    { key: "nome", label: "Nome", sortable: true },
                    { key: "tipo", label: "Tipo" },
                    {
                      key: "quantidade_estoque",
                      label: "Estoque Atual",
                      sortable: true,
                      render: (row: InsumoItem) => (
                        <span
                          className={
                            row.quantidade_estoque <= row.estoque_minimo
                              ? "font-bold text-(--color-red)"
                              : ""
                          }
                        >
                          {Number(row.quantidade_estoque).toFixed(3)}{" "}
                          {row.unidade_de_medida.toLowerCase()}
                        </span>
                      ),
                    },
                  ]}
                  renderRightActions={(insumo) => (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setInsumoSelecionado(insumo)
                          setEdicaoModalOpen(true)
                        }}
                      >
                        <PencilSimpleIcon size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-(--txt-secondary) hover:bg-(--bg-sidebar) hover:text-(--color-red)"
                        onClick={() => {
                          setIdParaRemover(insumo.id)
                          setRemoveModalOpen(true)
                        }}
                      >
                        <TrashIcon size={16} />
                      </Button>
                    </>
                  )}
                  data={insumos}
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
        title="Filtrar Insumos"
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                // setFiltro e setTemp de cada filtro
                setFilterModalOpen(false)
              }}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                // cada setFiltro recebendo o seu temp respectivo
                setFilterModalOpen(false)
              }}
            >
              Aplicar
            </Button>
          </>
        }
      >
        {/*Filtros aqui*/}
      </Modal>

      {/*Modal de Cadastro*/}
      <Modal
        open={cadastroModalOpen}
        onClose={() => 
          setCadastroModalOpen(false)
        }
        title="Cadastrar Insumo"
      >
        <InsumoForm
          mode="create"
          onSubmit={onCadastrar}
          onCancel={() => setCadastroModalOpen(false)}
        />
      </Modal>
  
      {/*Modal de Edição*/}
      <Modal
        open={edicaoModalOpen}
        onClose={() => {
          setEdicaoModalOpen(false)
          setInsumoSelecionado(null)
        }}
        title={`Editar Insumo: ${insumoSelecionado?.nome || ""}`}
      >
        {insumoSelecionado && (
          <InsumoForm
            mode="edit"
            defaultValues={insumoSelecionado}
            onSubmit={onEditar}
            onCancel={() => { 
              setEdicaoModalOpen(false);
              setInsumoSelecionado(null) 
            }}
          />
        )}
      </Modal>

      {/* Modal de Remoção */}
      <Modal
        key={removeModalOpen ? "remove-open" : "remove-closed"}
        open={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false)
          //removerForm.reset()
        }}
        title="Remover Insumo"
        description="Tem certeza que deseja excluir esse insumo? Esta ação não poderá ser desfeita."
        footer={
          <>
            <Button
              variant="outlined"
              disabled={isRemoving}
              onClick={() => {
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
              {isRemoving ? "Removendo..." : "Remover Insumo"}
            </Button>
          </>
        }
      ></Modal>
    </div>
  )
}
