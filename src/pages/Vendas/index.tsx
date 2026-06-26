import { type Venda, listarVendas } from "@/services/api/vendas.service"
import { listarClientes, type Cliente } from "@/services/api/cliente.service"
import { listarProdutos, type ProdutoListItem } from "@/services/api/produtos.service"
// TODO: Importar removerVenda quando estiver implementado no back-end
// import { removerVenda } from "@/services/vendas.service"

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
  ArrowCounterClockwiseIcon,
  XIcon,
} from "@phosphor-icons/react"

export default function VendasPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [search, setSearch] = useState("")
  const [vendas, setVendas] = useState<Venda[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<ProdutoListItem[]>([])
  const [loading, setLoading] = useState(true)

  // Estados dos Filtros
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [tipoFiltro, setTipoFiltro] = useState<string>("")
  const [statusFiltro, setStatusFiltro] = useState<string>("")
  const [tipoTemp, setTipoTemp] = useState<string>("")
  const [statusTemp, setStatusTemp] = useState<string>("")

  const fetchVendas = useCallback(async () => {
    setLoading(true)
    try {
      const [vendasRes, clientesRes, produtosRes] = await Promise.all([
        listarVendas({ limit: 10, offset: 0 }),
        listarClientes({ limit: 1000 }),
        listarProdutos({ limit: 1000 })
      ])
    
      setClientes(clientesRes.costumers || [])
      setProdutos(produtosRes.products || [])
    
      const vendasOrdenadas = (vendasRes.itens || []).sort((a, b) => b.id - a.id)
      setVendas(vendasOrdenadas)
    } catch (error) {
      console.error("Erro ao listar vendas:", error)
      toast({
        title: "Erro ao carregar vendas",
        description: "Não foi possível buscar o histórico de vendas. Tente novamente.",
        variant: "danger",
      })
    } finally {
      setLoading(false)
    }
  }, [search, tipoFiltro, statusFiltro, toast])

  useEffect(() => {
    const handler = setTimeout(() => fetchVendas(), 500)
    return () => clearTimeout(handler)
  }, [fetchVendas])

  // Estados do Modal de Cancelamento
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [idParaCancelar, setIdParaCancelar] = useState<number | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)
  
  const onCancelar = async () => {
    if (!idParaCancelar) return

    setIsCanceling(true)
    try {
      // await removerVenda(idParaRemover)

      toast({
        title: "Venda cancelada",
        description: "O registro da venda foi cancelado com sucesso.",
        variant: "success",
      })

      setCancelModalOpen(false)
      fetchVendas()
    } catch (error) {
      console.error("Erro ao cancelar venda:", error)
      toast({
        title: "Erro ao cancelar",
        description: "Ocorreu um erro ao tentar cancelar a venda.",
        variant: "danger",
      })
    } finally {
      setIsCanceling(false)
      setIdParaCancelar(null)
    }
  }

  // Dicionários para Labels e Cores
  const tipoLabels: Record<string, string> = {
    "ATACADO": "Atacado",
    "VAREJO": "Varejo",
  }

  const statusLabels: Record<string, string> = {
    "PAGO": "Pago",
    "PENDENTE": "Pendente",
    "CANCELADO": "Cancelado",
  }

  const formatarData = (dataISO: string) => {
    if (!dataISO) return "—"
    return new Date(dataISO).toLocaleDateString("pt-BR")
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Histórico de Vendas" },
        ]}
      />

      <div className="flex flex-col gap-6 py-8 overflow-hidden">
        <h1 className="text-h1 text-(--txt-primary)">Histórico de Vendas</h1>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Buscar por cliente ou produto"
                iconRight={<MagnifyingGlassIcon />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled
              />
            </div>
            <div className="flex shrink-0 flex-col gap-2 md:flex-row">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setTipoTemp(tipoFiltro)
                  setStatusTemp(statusFiltro)
                  setFilterModalOpen(true)
                }}
                disabled
              >
                Filtrar Vendas
                <FadersIcon />
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="bg-brand text-white"
                onClick={() => navigate("/vendas/cadastrar")}
              >
                Nova Venda
                <PlusIcon />
              </Button>
            </div>
          </div>

          {/* Área de Tags de Filtro Ativos */}
          {(tipoFiltro || statusFiltro) && (
            <div className="flex flex-row gap-2 flex-wrap">
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
            </div>
          )}

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
            </div>
          ) : (
            <div className="flex-1 h-full min-h-0">
              {/* Tabela Desktop */}
              <div className="hidden md:flex h-full flex-col flex-1 min-h-0">
                <Table
                  columns={[
                    { 
                      key: "cliente_id", 
                      label: "Cliente", 
                      sortable: true,
                      render: (row: Venda) => {
                        if (!row.cliente_id) return "Cliente Balcão (Avulso)"
                        
                        const clienteEncontrado = clientes.find(c => c.id === row.cliente_id)
                        
                        return clienteEncontrado ? clienteEncontrado.name : `Cliente (ID: ${row.cliente_id})`
                      }
                    },
                    { 
                      key: "data_venda", 
                      label: "Data da Venda", 
                      sortable: true,
                      render: (row) => formatarData(row.data_venda)
                    },
                    { 
                      key: "itens", 
                      label: "Produtos Comprados",
                      render: (row: Venda) => {
                        if (!row.itens || row.itens.length === 0) return "—";
                        
                        const qtdItens = row.itens.length;
                        const primeiroItem = row.itens[0];
                        
                        const prodEncontrado = produtos.find((p: ProdutoListItem) => p.id === primeiroItem.produto_id);
                        const nomeProduto = prodEncontrado ? prodEncontrado.nome : `Item (ID: ${primeiroItem.produto_id})`;

                        return qtdItens === 1 
                          ? `${primeiroItem.quantidade}x ${nomeProduto}` 
                          : `${primeiroItem.quantidade}x ${nomeProduto} (+${qtdItens - 1})`;
                      }
                    },
                    { 
                      key: "valor_total", 
                      label: "Valor da Venda",
                      sortable: true,
                      render: (row) => `R$ ${Number(row.valor_total).toFixed(2).replace(".", ",")}`
                    },
                    { 
                      key: "tipo_venda",
                      label: "Tipo de Venda",
                      render: (row) => {
                        const isAtacado = row.tipo_venda === "ATACADO";
                        return (
                          <span
                            className={`inline-flex items-center justify-center text-body-sm rounded-full px-2.5 py-1 font-medium leading-none ${
                              isAtacado
                                ? "bg-(--color-blue)/15 text-(--color-blue)"
                                : "bg-(--color-green)/15 text-(--color-green)"
                            }`}
                          >
                            {isAtacado ? "Atacado" : "Varejo"}
                          </span>
                        );
                      },
                    },
                    { 
                      key: "status_pagamento",
                      label: "Status da Venda",
                      render: (row) => {
                        let colorClass = "";
                        let labelText = "";
                        
                        switch (row.status_pagamento) {
                          case "PAGO":
                            colorClass = "bg-(--color-green)/15 text-(--color-green)";
                            labelText = "Pago";
                            break;
                          case "PENDENTE":
                            colorClass = "bg-(--color-yellow)/15 text-(--color-yellow)";
                            labelText = "Pendente";
                            break;
                          case "CANCELADO":
                            colorClass = "bg-(--color-red)/15 text-(--color-red)";
                            labelText = "Cancelado";
                            break;
                          default:
                            colorClass = "bg-gray-100 text-gray-600";
                            labelText = row.status_pagamento;
                        }

                        return (
                          <span
                            className={`inline-flex items-center justify-center text-body-sm rounded-full px-2.5 py-1 font-medium leading-none ${colorClass}`}
                          >
                            {labelText}
                          </span>
                        );
                      },
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
                            onClick={() => navigate(`/vendas/${row.id}`)}
                          >
                            <EyeIcon size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/vendas/editar/${row.id}`)}
                          >
                            <PencilSimpleIcon size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:text-(--color-red)"
                            onClick={() => {
                              setIdParaCancelar(row.id)
                              setCancelModalOpen(true)
                            }}
                          >
                            <ArrowCounterClockwiseIcon size={16} />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                  data={vendas}
                  pageSize={10}
                  emptyValue="N/A"
                />
              </div>

              {/* Tabela Mobile */}
              <div className="flex md:hidden h-full flex-col min-h-0 overflow-y-auto">
                <MobileTable 
                  columns={[
                    { 
                      key: "cliente_id", 
                      label: "Cliente",
                      render: (row: Venda) => {
                        if (!row.cliente_id) return "Cliente Balcão (Avulso)"
                        
                        const clienteEncontrado = clientes.find(c => c.id === row.cliente_id)
                        
                        return clienteEncontrado ? clienteEncontrado.name : `Cliente (ID: ${row.cliente_id})`
                      }
                    },
                    { 
                      key: "valor_total", 
                      label: "Valor",
                      render: (row) => `R$ ${Number(row.valor_total).toFixed(2).replace(".", ",")}`
                    },
                    { 
                      key: "status_pagamento",
                      label: "Status",
                      render: (row) => {
                        let colorClass = "";
                        let labelText = "";

                        // Mapeamento completo usando os tokens CSS de alta acessibilidade
                        switch (row.status_pagamento) {
                          case "PAGO":
                            colorClass = "bg-(--color-green)/15 text-(--color-green)";
                            labelText = "Pago";
                            break;
                          case "PENDENTE":
                            colorClass = "bg-(--color-yellow)/15 text-(--color-yellow)";
                            labelText = "Pendente";
                            break;
                          case "CANCELADO":
                            colorClass = "bg-(--color-red)/15 text-(--color-red)";
                            labelText = "Cancelado";
                            break;
                          default:
                            colorClass = "bg-gray-100 text-gray-600";
                            labelText = row.status_pagamento;
                        }

                        return (
                          <span
                            className={`inline-flex items-center justify-center text-body-sm rounded-full px-2.5 py-1 font-medium leading-none ${colorClass}`}
                          >
                            {labelText}
                          </span>
                        );
                      },
                    },
                  ]}
                  renderRightActions={(venda) => (
                    <>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/vendas/editar/${venda.id}`)}>
                        <PencilSimpleIcon size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-(--txt-secondary) hover:text-(--color-red) hover:bg-(--bg-sidebar)" onClick={() => {
                        setIdParaCancelar(venda.id)
                        setCancelModalOpen(true)
                      }}>
                        <ArrowCounterClockwiseIcon size={16} />
                      </Button>
                    </>
                  )}
                  renderBottomAction={(venda) => (
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={() => navigate(`/vendas/${venda.id}`)}
                    >
                      Detalhes da Venda
                    </Button>
                  )}
                  data={vendas}
                  emptyValue="N/A"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Filtros */}
      <Modal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="Filtrar Vendas"
        footer={
          <>
            <Button
              variant="outlined"
              onClick={() => {
                setTipoFiltro("")
                setStatusFiltro("")
                setTipoTemp("")
                setStatusTemp("")
                setFilterModalOpen(false)
              }}
            >
              Limpar Filtro
            </Button>
            <Button
              variant="primary"
              className="bg-brand text-white border-none"
              onClick={() => {
                setTipoFiltro(tipoTemp)
                setStatusFiltro(statusTemp)
                setFilterModalOpen(false)
              }}
            >
              Aplicar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <SelectField
            label="Tipo de Venda"
            placeholder="Todos os tipos"
            options={[
              { label: "Atacado", value: "ATACADO" },
              { label: "Varejo", value: "VAREJO" },
            ]}
            value={tipoTemp}
            onValueChange={setTipoTemp}
          />
          <SelectField
            label="Status do Pagamento"
            placeholder="Todos os status"
            options={[
              { label: "Pago", value: "PAGO" },
              { label: "Pendente", value: "PENDENTE" },
              { label: "Cancelado", value: "CANCELADO" },
            ]}
            value={statusTemp}
            onValueChange={setStatusTemp}
          />
        </div>
      </Modal>

      {/* Modal de Cancelamento */}
      <Modal
        key={cancelModalOpen ? "cancel-open" : "cancel-closed"}
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancelar Venda"
        description="Tem certeza que deseja cancelar essa venda? Esta ação alterará o status do pedido e os itens retornarão ao estoque. Esta operação não pode ser desfeita."
        footer={
          <>
            <Button
              variant="outlined"
              disabled={isCanceling}
              onClick={() => setCancelModalOpen(false)}
            >
              Voltar
            </Button>
            <Button
              variant="secondary"
              className="bg-(--color-red) text-white border-none hover:opacity-90"
              onClick={() => onCancelar()}
            >
              Cancelar Venda
            </Button>
          </>
        }
      >
      </Modal>
    </div>
  )
}