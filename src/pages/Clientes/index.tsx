import { type Cliente, listarClientes, removerCliente } from "@/services/api/cliente.service"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/context/ToastContext"
import { useNavigate } from "react-router-dom"

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

export default function ClientesPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [search, setSearch] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [tipoFiltro, setTipoFiltro] = useState<string>("")
  const [tipoTemp, setTipoTemp] = useState<string>("")

  const fetchClientes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listarClientes({
        name: search.trim().length >= 3 ? search.trim() : undefined,
        tipo: tipoFiltro || undefined,
      })

      setClientes(data.costumers || [])
    } catch (error) {
      console.error("Erro ao listar clientes:", error)
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível buscar os clientes. Tente novamente.",
        variant: "danger",
      })
    } finally {
      setLoading(false)
    }
  }, [search, tipoFiltro, toast])

  useEffect(() => {
    const handler = setTimeout(() => fetchClientes(), 500)
    return () => clearTimeout(handler)
  }, [fetchClientes])

  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [idParaRemover, setIdParaRemover] = useState<number | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  
  // TODO: Esperar definição do back sobre haver remoção de cliente 
  const onRemover = async () => {
    if (!idParaRemover) return

    setIsRemoving(true)
    try {
      await removerCliente(idParaRemover)

      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso.",
        variant: "success",
      })

      setRemoveModalOpen(false)
      fetchClientes()
    } catch (error) {
      console.error("Erro ao remover cliente:", error)
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao tentar excluir o cliente.",
        variant: "danger",
      })
    } finally {
      setIsRemoving(false)
      setIdParaRemover(null)
    }
  }

  const tipoLabels: Record<string, string> = {
    "PESSOA_FISICA": "Pessoa Física",
    "RESTAURANTE": "Restaurante",
    "COMERCIO": "Comércio"
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Clientes" },
        ]}
      />

      <div className="flex flex-col gap-6 py-8 overflow-hidden">
        <h1 className="text-h1 text-(--txt-primary)">Gestão de Clientes</h1>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Buscar por nome do cliente..."
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
                  setTipoTemp(tipoFiltro)
                  setFilterModalOpen(true)
                }}
              >
                Filtrar Clientes
                <FadersIcon />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/clientes/cadastrar")}
              >
                Novo Cliente
                <PlusIcon />
              </Button>
            </div>
          </div>

          {/* Área de Tags de Filtro */}
          {tipoFiltro && (
            <div className="flex flex-row gap-2">
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
            </div>
          )}

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            </div>
          ) : (
            <div className="flex-1 h-full min-h-0">
              {/* Desktop */}
              <div className="hidden md:flex h-full flex-col flex-1 min-h-0">
                <Table
                  columns={[
                    { key: "name", label: "Nome", sortable: true },
                    { 
                      key: "tipo",
                      label: "Categoria",
                      sortable: true,
                      render: (row) => {
                        const label = tipoLabels[row.tipo] || row.tipo

                        const colorClasses: Record<string, string> = {
                          "PESSOA_FISICA": "bg-(--color-blue)/15 text-(--color-blue)",
                          "RESTAURANTE": "bg-(--color-yellow)/15 text-(--color-yellow)",
                          "COMERCIO": "bg-(--color-green)/15 text-(--color-green)",
                        }
                        const classeFinal = colorClasses[row.tipo] || "bg-(--bg-sidebar) text-(--txt-secondary)"

                        return (
                          <span className={`text-body-sm rounded-full px-2 py-0.5 font-medium ${classeFinal}`}>
                            {label}
                          </span>
                        )
                      },
                    },
                    { key: "identificador", label: "CPF / CNPJ" },
                    { key: "telefone", label: "Telefone" },
                    { 
                      key: "total_compras", 
                      label: "Total Gasto",
                      sortable: true,
                      render: (row) => `R$ ${Number(row.total_compras).toFixed(2).replace(".", ",")}`
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
                            onClick={() => navigate(`/clientes/${row.id}`)}
                          >
                            <EyeIcon size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/clientes/editar/${row.id}`)}
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
                  data={clientes}
                  pageSize={10}
                  emptyValue="N/A"
                />
              </div>

              {/* Mobile */}
              <div className="flex md:hidden h-full flex-col min-h-0 overflow-y-auto">
                <MobileTable 
                  columns={[
                    { key: "name", label: "Cliente" },
                    { 
                      key: "tipo",
                      label: "Categoria",
                      render: (row) => {
                        const label = tipoLabels[row.tipo] || row.tipo
                        const colorClasses: Record<string, string> = {
                          "PESSOA_FISICA": "bg-(--color-blue)/15 text-(--color-blue)",
                          "RESTAURANTE": "bg-(--color-yellow)/15 text-(--color-yellow)",
                          "COMERCIO": "bg-(--color-green)/15 text-(--color-green)",
                        }
                        const classeFinal = colorClasses[row.tipo] || "bg-(--bg-sidebar) text-(--txt-secondary)"

                        return (
                          <span className={`text-body-sm rounded-full px-2 py-0.5 font-medium ${classeFinal}`}>
                            {label}
                          </span>
                        )
                      },
                    },
                    { key: "telefone", label: "Contato" },
                  ]}
                  renderRightActions={(cliente) => (
                    <>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/clientes/editar/${cliente.id}`)}>
                        <PencilSimpleIcon size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-(--txt-secondary) hover:text-(--color-red) hover:bg-(--bg-sidebar)" onClick={() => {
                        setIdParaRemover(cliente.id)
                        setRemoveModalOpen(true)
                      }}>
                        <TrashIcon size={16} />
                      </Button>
                    </>
                  )}
                  renderBottomAction={(cliente) => (
                    <Button 
                      variant="primary" 
                      className="w-full gap-2 border-none"
                      onClick={() => navigate(`/clientes/${cliente.id}`)}
                    >
                      Ver Perfil do Cliente
                    </Button>
                  )}
                  data={clientes}
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
        title="Filtrar Clientes"
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setTipoFiltro("")
                setTipoTemp("")
                setFilterModalOpen(false)
              }}
            >
              Limpar Filtro
            </Button>
            <Button
              variant="primary"
              onClick={() => {
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
          label="Categoria do Cliente"
          placeholder="Todos as categorias"
          options={[
            { label: "Pessoa Física", value: "PESSOA_FISICA" },
            { label: "Restaurante", value: "RESTAURANTE" },
            { label: "Comércio", value: "COMERCIO" },
          ]}
          value={tipoTemp}
          onValueChange={setTipoTemp}
        />
      </Modal>

      {/* Modal de Remoção */}
      <Modal
        key={removeModalOpen ? "remove-open" : "remove-closed"}
        open={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        title="Remover Cliente"
        description="Tem certeza que deseja excluir este cliente? Essa ação não pode ser desfeita."
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
              onClick={() => onRemover()}
            >
              Excluir Cliente
            </Button>
          </>
        }
      >
      </Modal>
    </div>
  )
}