import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { InsumoForm } from "@/components/forms/InsumoForm"
import { type InsumoFormData } from "@/schemas/insumos.schema"
import { EntradaInsumoForm } from "@/components/forms/EntradaInsumoForm"
import { type EntradaInsumoFormData } from "@/schemas/entradaInsumo.schema"

import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Table } from "@/components/ui/table"
import { MobileTable } from "@/components/ui/mobile-table"
import { SelectField } from "@/components/ui/select-field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import {
  FadersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilSimpleIcon,
  TrashIcon,
  XIcon,
  PlusCircleIcon
} from "@phosphor-icons/react"

import { 
  listarInsumos, 
  criarInsumo, 
  atualizarInsumo, 
  removerInsumo,
  type Insumo 
} from "@/services/api/insumo.service"
import { registrarEntradaInsumo } from "@/services/api/entrada-insumo.service"

export default function InsumosPage() {
  const { toast } = useToast()
  const navigate  = useNavigate()

  const [search, setSearch] = useState("")
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(true)

  const [filtroTipo, setFiltroTipo] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("")
  const [tempTipo, setTempTipo] = useState("")
  const [tempStatus, setTempStatus] = useState("")
  const [filterModalOpen, setFilterModalOpen] = useState(false)

  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [idParaRemover, setIdParaRemover] = useState<number | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  // Modais de Formulário
  const [cadastroModalOpen, setCadastroModalOpen] = useState(false)
  const [edicaoModalOpen, setEdicaoModalOpen] = useState(false)
  const [insumoSelecionado, setInsumoSelecionado] = useState<Insumo | null>(null)

  const [entradaModalOpen, setEntradaModalOpen] = useState(false)
  const [insumoParaEntrada, setInsumoParaEntrada] = useState<Insumo | null>(null)

  const fetchInsumos = useCallback(async () => {
    setLoading(true)
    try {
      const filtros: any = {}
      if (search) filtros.nome = search
      if (filtroTipo) filtros.tipo = filtroTipo
      if (filtroStatus) filtros.ativo = filtroStatus === "ativos"

      const data = await listarInsumos(filtros)

      const ordenados = [...(data.insumos || [])].sort((a, b) => a.id - b.id)

      setInsumos(ordenados)
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
  }, [search, filtroTipo, filtroStatus, toast])

  useEffect(() => {
    const handler = setTimeout(() => fetchInsumos(), 500)
    return () => clearTimeout(handler)
  }, [fetchInsumos])

  const onCadastrar = async (data: InsumoFormData) => {
    try {
      console.log("Payload de Cadastro para o FastAPI:", data)
      await criarInsumo(data)

      toast({
        title: "Insumo cadastrado!",
        description: "Insumo cadastrado com sucesso.",
        variant: "success",
      })

      setCadastroModalOpen(false)
      fetchInsumos()
    } catch {
      toast({
        title: "Erro ao cadastrar",
        description: "Falha ao cadastrar insumo.",
        variant: "danger",
      })
    }
  }

  const onEditar = async (data: InsumoFormData) => {
    if (!insumoSelecionado) return

    try {
      console.log(`Payload de Edição para o ID ${insumoSelecionado?.id}:`, data)
      await atualizarInsumo(insumoSelecionado.id, data as any)

      toast({
        title: "Insumo editado!",
        description: "Insumo atualizado com sucesso.",
        variant: "success",
      })

      setEdicaoModalOpen(false)
      setInsumoSelecionado(null)
      fetchInsumos()
    } catch {
      toast({
        title: "Erro ao editar",
        description: "Falha ao editar insumo.",
        variant: "danger",
      })
    }
  }

  const onRemover = async () => {
    if (!idParaRemover) return

    setIsRemoving(true)
    try {
      await removerInsumo(idParaRemover)
      
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

  const onRegistrarEntrada = async (data: EntradaInsumoFormData) => {
    if (!insumoParaEntrada) return

    try {
      await registrarEntradaInsumo({
        insumo_id: insumoParaEntrada.id,
        quantidade_comprada: data.quantidade_comprada,
        valor_total_pago: data.valor_total_pago,
      })

      toast({
        title: "Entrada registrada!",
        description: `O estoque de ${insumoParaEntrada.nome} foi atualizado com sucesso.`,
        variant: "success",
      })

      setEntradaModalOpen(false)
      setInsumoParaEntrada(null)
      fetchInsumos()
    } catch {
      toast({
        title: "Erro ao registrar entrada",
        description: "Não foi possível processar a entrada do insumo no backend.",
        variant: "danger",
      })
    }
  }

  const tipoLabels: Record<string, string> = {
    materia_prima: "Matéria-Prima",
    embalagem: "Embalagem",
  }

  const statusLabels: Record<string, string> = {
    ativos: "Ativos",
    inativos: "Inativos",
  }

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
                  setTempTipo(filtroTipo)
                  setTempStatus(filtroStatus)
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
          {(filtroStatus || filtroTipo) && (
            <div className="flex flex-row gap-2">
              {filtroStatus && (
                <div className="text-body-sm flex items-center gap-1 rounded-xs bg-(--bg-sidebar) px-2 py-1 text-(--txt-primary)">
                  <strong>Status:</strong> {statusLabels[filtroStatus]}
                  <button
                    onClick={() => {
                      setFiltroStatus("")
                      setTempStatus("")
                    }}
                    className="ml-1 cursor-pointer text-(--txt-secondary) hover:text-(--color-red)"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              )}
              
              {filtroTipo && (
                <div className="text-body-sm flex items-center gap-1 rounded-xs bg-(--bg-sidebar) px-2 py-1 text-(--txt-primary)">
                  <strong>Tipo:</strong> {tipoLabels[filtroTipo]}
                  <button
                    onClick={() => {
                      setFiltroTipo("")
                      setTempTipo("")
                    }}
                    className="ml-1 cursor-pointer text-(--txt-secondary) hover:text-(--color-red)"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              )}
            </div>
          )}

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
                      render: (row: Insumo) => (
                        <span 
                          className={`text-body-sm rounded-full px-2 py-0.5 font-medium ${
                            row.tipo === "materia_prima" 
                              ? "bg-brand/10 text-(--txt-link)"
                              : "bg-(--color-blue)/15 text-(--color-blue)"
                          }`}
                        >
                          {row.tipo === "materia_prima" ? "Matéria-Prima" : "Embalagem"}
                        </span>
                      ),
                    },
                    {
                      key: "quantidade_estoque",
                      label: "Estoque Atual",
                      sortable: true,
                      render: (row: Insumo) => {
                        const estoqueAtual = Number(row.quantidade_estoque);
                        const estoqueMin = Number(row.estoque_minimo);
                        
                        const isEstoqueBaixo = estoqueAtual < estoqueMin;

                        return (
                          <span className={isEstoqueBaixo ? "text-(--color-red) font-bold" : "text-(--txt-primary)"}>
                            {estoqueAtual.toLocaleString("pt-BR", { minimumFractionDigits: 3 })} {row.unidade_de_medida}
                          </span>
                        )
                      },
                    },
                    {
                      key: "estoque_minimo",
                      label: "Estoque Mínimo",
                      sortable: true,
                      render: (row: Insumo) => (
                        <span>
                          {new Intl
                            .NumberFormat('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
                            .format(row.estoque_minimo)
                          }
                          {row.unidade_de_medida.toLowerCase()}
                        </span>
                      ),
                    },
                    {
                      key: "custo_unitario",
                      label: "Custo Unitário",
                      sortable: true,
                      render: (row: Insumo) => (
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
                        row: Insumo
                      ) => (
                        <span
                          className={`text-body-sm rounded-full px-2 py-0.5 font-medium ${
                            row.ativo 
                              ? "bg-(--color-green)/15 text-(--color-green)"
                              : "bg-(--bg-sidebar) text-(--txt-secondary)"
                          }`}
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
                            className="text-(--color-green) hover:bg-(--color-green)/10"
                            onClick={() => {
                              setInsumoParaEntrada(row)
                              setEntradaModalOpen(true)
                            }}
                          >
                            <PlusCircleIcon size={18} weight="bold" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/insumos/${row.id}`)}
                          >
                            <EyeIcon size={16} />
                          </Button>
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
                    { 
                      key: "tipo", 
                      label: "Tipo",
                      render: (row: Insumo) => (
                        <span 
                          className={`text-body-sm rounded-full px-2 py-0.5 font-medium ${
                            row.tipo === "materia_prima" 
                              ? "bg-brand/10 text-(--txt-link)"
                              : "bg-(--color-blue)/15 text-(--color-blue)"
                          }`}
                        >
                          {row.tipo === "materia_prima" ? "Matéria-Prima" : "Embalagem"}
                        </span>
                      ),
                    },
                    {
                      key: "quantidade_estoque",
                      label: "Estoque Atual",
                      sortable: true,
                      render: (row: Insumo) => {
                        const estoqueAtual = Number(row.quantidade_estoque);
                        const estoqueMin = Number(row.estoque_minimo);
                        
                        const isEstoqueBaixo = estoqueAtual < estoqueMin;

                        return (
                          <span className={isEstoqueBaixo ? "text-(--color-red) font-bold" : "text-(--txt-primary)"}>
                            {estoqueAtual.toLocaleString("pt-BR", { minimumFractionDigits: 3 })} {row.unidade_de_medida}
                          </span>
                        )
                      },
                    },
                  ]}
                  renderRightActions={(insumo) => (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-(--color-green) hover:bg-(--color-green)/10"
                        onClick={() => {
                          setInsumoParaEntrada(insumo)
                          setEntradaModalOpen(true)
                        }}
                      >
                        <PlusCircleIcon size={18} weight="bold" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/insumos/${insumo.id}`)}
                      >
                        <EyeIcon size={16} />
                      </Button>
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
                setFiltroTipo("")
                setFiltroStatus("")
                setFilterModalOpen(false)
              }}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setFiltroTipo(tempTipo)
                setFiltroStatus(tempStatus)
                setFilterModalOpen(false)
              }}
            >
              Aplicar
            </Button>
          </>
        }
      >
        <SelectField
          label="Tipo de Insumo"
          placeholder="Todos os Insumos"
          options={[
            { value: "materia_prima", label: "Matéria-Prima" },
            { value: "embalagem", label: "Embalagem" }
          ]}
          value={tempTipo}
          onValueChange={setTempTipo}
        />
        <SelectField
          label="Status do Insumo"
          placeholder="Todos os status"
          options={[
            { value: "ativos", label: "Ativos" },
            { value: "inativos", label: "Inativos" }
          ]}
          value={tempStatus}
          onValueChange={setTempStatus}
        />
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

      {/* Modal de Entrada de Insumo */}
      <Modal
        open={entradaModalOpen}
        onClose={() => {
          setEntradaModalOpen(false)
          setInsumoParaEntrada(null)
        }}
        title="Registrar Entrada de Estoque"
      >
        {insumoParaEntrada && (
          <EntradaInsumoForm
            insumoNome={insumoParaEntrada.nome}
            unidadeMedida={insumoParaEntrada.unidade_de_medida}
            onSubmit={onRegistrarEntrada}
            onCancel={() => {
              setEntradaModalOpen(false)
              setInsumoParaEntrada(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}
