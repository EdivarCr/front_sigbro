import type { FormaPagamento, StatusPagamento, TipoVenda } from "@/schemas/vendas.schema"
import { type FilterVenda, type Venda, listarVendas } from "@/services/api/vendas.service"
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
  const [tipoFiltro, setTipoFiltro] = useState<TipoVenda | "">("")
  const [statusFiltro, setStatusFiltro] = useState<StatusPagamento | "">("")
  const [formaPagamentoFiltro, setFormaPagamentoFiltro] = useState<FormaPagamento | "">("")
  const [dataInicioFiltro, setDataInicioFiltro] = useState<string>("")
  const [dataFimFiltro, setDataFimFiltro] = useState<string>("")

  // Estados Temporários do Modal de Filtros
  const [tipoTemp, setTipoTemp] = useState<TipoVenda | "">("")
  const [statusTemp, setStatusTemp] = useState<StatusPagamento | "">("")
  const [formaPagamentoTemp, setFormaPagamentoTemp] = useState<FormaPagamento | "">("")
  const [dataInicioTemp, setDataInicioTemp] = useState<string>("")
  const [dataFimTemp, setDataFimTemp] = useState<string>("")

  useEffect(() => {
    async function carregarDadosMestres() {
      try {
        const [clientesRes, produtosRes] = await Promise.all([
          listarClientes({ limit: 1000 }),
          listarProdutos({ limit: 1000 })
        ])
        setClientes(clientesRes.costumers || (clientesRes as any).customers || [])
        setProdutos(produtosRes.products || [])
      } catch (error) {
        console.error("Erro ao carregar dados mestres:", error)
      }
    }
    carregarDadosMestres()
  }, [])

  const fetchVendas = useCallback(async () => {
    setLoading(true)
    try {
      let clienteIdMapeado: number | null = null

      // Mapeia o texto digitado na barra de pesquisa para o ID do cliente correspondente
      if (search.trim().length >= 3) {
        const clienteEncontrado = clientes.find(c => 
          c.name.toLowerCase().includes(search.toLowerCase().trim())
        )
        if (clienteEncontrado) {
          clienteIdMapeado = clienteEncontrado.id
        } else {
          // Se digitou o nome mas não encontrou o cliente, zera a lista forçadamente
          setVendas([])
          setLoading(false)
          return
        }
      }

      const filtros: FilterVenda = {
        limit: 50,
        offset: 0,
        tipo_venda: tipoFiltro || null,
        status_pagamento: statusFiltro || null,
        forma_pagamento: formaPagamentoFiltro || null,
        data_inicio: dataInicioFiltro || null,
        data_fim: dataFimFiltro || null,
        cliente_id: clienteIdMapeado
      }

      const vendasRes = await listarVendas(filtros)
      const vendasOrdenadas = (vendasRes.itens || []).sort((a, b) => b.id - a.id)
      setVendas(vendasOrdenadas)
    } catch (error) {
      console.error("Erro ao listar vendas filtradas:", error)
      toast({
        title: "Erro ao carregar vendas",
        description: "Não foi possível aplicar os filtros no histórico de vendas.",
        variant: "danger",
      })
    } finally {
      setLoading(false)
    }
  }, [search, tipoFiltro, statusFiltro, formaPagamentoFiltro, dataInicioFiltro, dataFimFiltro, clientes, toast])
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

  const formaPagamentoLabels: Record<string, string> = {
    DINHEIRO: "Dinheiro",
    CARTAO_CREDITO: "Cartão de Crédito",
    CARTAO_DEBITO: "Cartão de Débito",
    PIX: "Pix",
    BOLETO: "Boleto",
  }

  const formatarDataTag = (dataStr: string) => {
    if (!dataStr) return ""
    const [ano, mes, dia] = dataStr.split("-")
    return `${dia}/${mes}/${ano}`
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
                placeholder="Buscar por cliente..."
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
                  setStatusTemp(statusFiltro)
                  setFormaPagamentoTemp(formaPagamentoFiltro)
                  setDataInicioTemp(dataInicioFiltro)
                  setDataFimTemp(dataFimFiltro)
                  setFilterModalOpen(true)
                }}
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
          {(tipoFiltro || statusFiltro || formaPagamentoFiltro || dataInicioFiltro || dataFimFiltro) && (
            <div className="flex flex-row gap-2 flex-wrap shrink-0">
              
              {/* Tag: Tipo de Venda */}
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

              {/* Tag: Status de Pagamento */}
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

              {/* Tag: Forma de Pagamento */}
              {formaPagamentoFiltro && (
                <div className="text-body-sm flex items-center gap-1 rounded-xs bg-(--bg-sidebar) px-2 py-1 text-(--txt-primary)">
                  <strong>Forma:</strong> {formaPagamentoLabels[formaPagamentoFiltro]}
                  <button
                    onClick={() => {
                      setFormaPagamentoFiltro("")
                      setFormaPagamentoTemp("")
                    }}
                    className="ml-1 cursor-pointer text-(--txt-secondary) hover:text-(--color-red)"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              )}

              {/* Tag: Data de Início */}
              {dataInicioFiltro && (
                <div className="text-body-sm flex items-center gap-1 rounded-xs bg-(--bg-sidebar) px-2 py-1 text-(--txt-primary)">
                  <strong>Início:</strong> {formatarDataTag(dataInicioFiltro)}
                  <button
                    onClick={() => {
                      setDataInicioFiltro("")
                      setDataInicioTemp("")
                    }}
                    className="ml-1 cursor-pointer text-(--txt-secondary) hover:text-(--color-red)"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              )}

              {/* Tag: Data Fim */}
              {dataFimFiltro && (
                <div className="text-body-sm flex items-center gap-1 rounded-xs bg-(--bg-sidebar) px-2 py-1 text-(--txt-primary)">
                  <strong>Fim:</strong> {formatarDataTag(dataFimFiltro)}
                  <button
                    onClick={() => {
                      setDataFimFiltro("")
                      setDataFimTemp("")
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
                      render: (row) => formatarDataTag(row.data_venda)
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
                setFormaPagamentoFiltro("")
                setDataInicioFiltro("")
                setDataFimFiltro("")
                setTipoTemp("")
                setStatusTemp("")
                setFormaPagamentoTemp("")
                setDataInicioTemp("")
                setDataFimTemp("")
                setFilterModalOpen(false)
              }}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="primary"
              className="bg-brand text-white border-none hover:bg-brand-hover"
              onClick={() => {
                setTipoFiltro(tipoTemp)
                setStatusFiltro(statusTemp)
                setFormaPagamentoFiltro(formaPagamentoTemp)
                setDataInicioFiltro(dataInicioTemp)
                setDataFimFiltro(dataFimTemp)
                setFilterModalOpen(false)
              }}
            >
              Aplicar Filtros
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-(--spacing-md)">
          {/* Filtros de Período de Datas */}
          <div className="grid grid-cols-2 gap-(--spacing-sm)">
            <div className="flex flex-col gap-1">
              <Input 
                type="date"
                label="Data de Início" 
                value={dataInicioTemp}
                onChange={(e) => setDataInicioTemp(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Input 
                type="date"
                label="Data de Fim"
                value={dataFimTemp}
                onChange={(e) => setDataFimTemp(e.target.value)}
              />
            </div>
          </div>

          <SelectField
            label="Tipo de Venda"
            placeholder="Todos os tipos"
            options={[
              { label: "Atacado", value: "ATACADO" },
              { label: "Varejo", value: "VAREJO" },
            ]}
            value={tipoTemp}
            onValueChange={(val) => setTipoTemp(val as TipoVenda || "")}
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
            onValueChange={(val) => setStatusTemp(val as StatusPagamento || "")}
          />

          <SelectField
            label="Forma de Pagamento"
            placeholder="Todas as formas"
            options={[
              { label: "Dinheiro", value: "DINHEIRO" },
              { label: "Cartão de Crédito", value: "CARTAO_CREDITO" },
              { label: "Cartão de Débito", value: "CARTAO_DEBITO" },
              { label: "Pix", value: "PIX" },
              { label: "Boleto", value: "BOLETO" },
            ]}
            value={formaPagamentoTemp}
            onValueChange={(val) => setFormaPagamentoTemp(val as FormaPagamento || "")}
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