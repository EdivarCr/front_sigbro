import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Table } from "@/components/ui/table"
import { MobileTable } from "@/components/ui/mobile-table"
import { Modal } from "@/components/ui/modal"
import { ArrowLeftIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react"
import { obterInsumoPorId, type Insumo } from "@/services/api/insumo.service"
import {
  listarEntradas,
  estornarEntrada,
  type EntradaInsumoResponse,
} from "@/services/api/entrada-insumo.service"

export default function InsumoDetalhesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Estados do Insumo (Cabeçalho)
  const [insumo, setInsumo] = useState<Insumo | null>(null)
  const [loading, setLoading] = useState(true)

  // Estados do Histórico de Entradas
  const [entradas, setEntradas] = useState<EntradaInsumoResponse[]>([])
  const [loadingEntradas, setLoadingEntradas] = useState(false)

  // Estados do Modal de Estorno
  const [estornoModalOpen, setEstornoModalOpen] = useState(false)
  const [idParaEstornar, setIdParaEstornar] = useState<number | null>(null)
  const [isEstornando, setIsEstornando] = useState(false)

  const fetchInsumo = useCallback(async () => {
    if (!id) return
    try {
      const data = await obterInsumoPorId(Number(id))
      setInsumo(data)
      return data
    } catch {
      toast({
        title: "Erro",
        description: "Insumo não encontrado ou erro na API.",
        variant: "danger",
      })
      navigate("/insumos")
    }
  }, [id, navigate, toast])

  useEffect(() => {
    fetchInsumo()
  }, [fetchInsumo])

  // Busca a lista de movimentações baseada no NOME do insumo
  const fetchEntradas = useCallback(
    async (nomeDoInsumo: string, hideTableLoading = false) => {
      if (!hideTableLoading) setLoadingEntradas(true)
      try {
        const data = await listarEntradas({ insumo_nome: nomeDoInsumo })

        // Ordenar por data decrescente (mais recentes no topo)
        const ordenadas = [...(data.entradaInsumo || [])].sort(
          (a, b) =>
            new Date(b.data_entrada).getTime() -
            new Date(a.data_entrada).getTime()
        )
        setEntradas(ordenadas)
      } catch {
        toast({
          title: "Erro ao listar entradas",
          description: "Falha ao carregar o histórico de entradas.",
          variant: "danger",
        })
      } finally {
        if (!hideTableLoading) setLoadingEntradas(false)
      }
    },
    [toast]
  )

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true)
      const insumoData = await fetchInsumo()

      // Só busca o histórico se o insumo existir
      if (insumoData) {
        await fetchEntradas(insumoData.nome, true)
      }

      setLoading(false)
    }

    loadInitialData()
  }, [fetchInsumo, fetchEntradas])

  const onEstornar = async () => {
    if (!idParaEstornar || !insumo) return

    setIsEstornando(true)
    try {
      await estornarEntrada(idParaEstornar)

      toast({
        title: "Estorno realizado",
        description: "A entrada foi desfeita e o estoque atualizado.",
        variant: "success",
      })

      setEstornoModalOpen(false)

      fetchInsumo()
      fetchEntradas(insumo.nome)
    } catch {
      toast({
        title: "Erro ao estornar",
        description: "Não foi possível estornar esta entrada.",
        variant: "danger",
      })
    } finally {
      setIsEstornando(false)
      setIdParaEstornar(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-brand h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (!insumo) return null

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Insumos", to: "/insumos" },
          { label: insumo.nome },
        ]}
      />

      <div className="flex flex-col gap-6 overflow-hidden py-8">
        {/* Cabeçalho com Botão de Voltar */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/insumos")}
          >
            <ArrowLeftIcon size={20} />
          </Button>
          <h1 className="text-h1 text-(--txt-primary)">{insumo.nome}</h1>
          <span
            className={`text-body-sm ml-2 rounded-full px-2 py-0.5 font-medium ${insumo.ativo ? "bg-(--color-green)/15 text-(--color-green)" : "bg-(--bg-sidebar) text-(--txt-secondary)"}`}
          >
            {insumo.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto pr-2">
          {/* Card Resumo do Insumo (Ficha Técnica) */}
          <div className="grid grid-cols-2 gap-4 rounded-sm border border-(--border-default) bg-(--bg-surface) p-6 md:grid-cols-4">
            <div className="flex flex-col">
              <span className="text-label tracking-wider text-(--txt-secondary) uppercase">
                Tipo
              </span>
              <strong className="text-body-md text-(--txt-primary)">
                {insumo.tipo === "materia_prima"
                  ? "Matéria-Prima"
                  : "Embalagem"}
              </strong>
            </div>
            <div className="flex flex-col">
              <span className="text-label tracking-wider text-(--txt-secondary) uppercase">
                Estoque Atual
              </span>
              <strong className="text-body-md text-(--txt-primary)">
                {new Intl.NumberFormat("pt-BR", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                }).format(insumo.quantidade_estoque)}{" "}
                {insumo.unidade_de_medida.toUpperCase()}
              </strong>
            </div>
            <div className="flex flex-col">
              <span className="text-label tracking-wider text-(--txt-secondary) uppercase">
                Estoque Mínimo
              </span>
              <strong className="text-body-md text-(--txt-primary)">
                {new Intl.NumberFormat("pt-BR", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                }).format(insumo.estoque_minimo)}{" "}
                {insumo.unidade_de_medida.toUpperCase()}
              </strong>
            </div>
            <div className="flex flex-col">
              <span className="text-label tracking-wider text-(--txt-secondary) uppercase">
                Custo Médio
              </span>
              <strong className="text-body-md text-(--txt-primary)">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(insumo.custo_unitario)}
              </strong>
            </div>
          </div>

          {/* Área reservada para a Tabela de Histórico de Entradas */}
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-h2 text-(--txt-primary)">
              Histórico de Entradas
            </h2>

            {loadingEntradas ? (
              <div className="flex h-32 items-center justify-center rounded-sm border border-dashed border-(--border-default)">
                <div className="border-brand h-6 w-6 animate-spin rounded-full border-4 border-t-transparent" />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                {/* Desktop */}
                <div className="hidden min-h-0 flex-1 flex-col md:flex">
                  <Table
                    columns={[
                      {
                        key: "data_entrada",
                        label: "Data da Entrada",
                        render: (row: EntradaInsumoResponse) => (
                          <span className="font-mono text-(--txt-secondary)">
                            {new Intl.DateTimeFormat("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            }).format(new Date(row.data_entrada))}
                          </span>
                        ),
                      },
                      {
                        key: "quantidade_comprada",
                        label: "Qtd. Comprada",
                        render: (row: EntradaInsumoResponse) => (
                          <span className="font-bold text-(--color-green)">
                            +{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3,
                            }).format(row.quantidade_comprada)}{" "}
                            <span className="text-[11px] font-normal uppercase">
                              {insumo.unidade_de_medida}
                            </span>
                          </span>
                        ),
                      },
                      {
                        key: "valor_total_pago",
                        label: "Valor Total Pago",
                        render: (row: EntradaInsumoResponse) => (
                          <span>
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(row.valor_total_pago)}
                          </span>
                        ),
                      },
                      {
                        key: "acoes",
                        label: "Ações",
                        className: "w-24 text-center",
                        render: (row: EntradaInsumoResponse) => (
                          <div className="-ml-2 flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-(--txt-secondary) hover:bg-(--color-red)/10 hover:text-(--color-red)"
                              onClick={() => {
                                setIdParaEstornar(row.id)
                                setEstornoModalOpen(true)
                              }}
                              title="Estornar Entrada"
                            >
                              <ArrowCounterClockwiseIcon
                                size={18}
                                weight="bold"
                              />
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={entradas}
                    pageSize={5} // Paginação menor para caber na tela sem rolagem brusca
                    emptyValue="Nenhuma entrada registrada."
                  />
                </div>

                {/* Mobile */}
                <div className="flex h-full min-h-0 flex-col overflow-y-auto md:hidden">
                  <MobileTable
                    columns={[
                      {
                        key: "data_entrada",
                        label: "Data",
                        render: (row: EntradaInsumoResponse) => (
                          <span>
                            {new Intl.DateTimeFormat("pt-BR", {
                              dateStyle: "short",
                            }).format(new Date(row.data_entrada))}
                          </span>
                        ),
                      },
                      {
                        key: "quantidade_comprada",
                        label: "Qtd",
                        render: (row: EntradaInsumoResponse) => (
                          <span className="font-bold text-(--color-green)">
                            +
                            {new Intl.NumberFormat("pt-BR", {
                              minimumFractionDigits: 3,
                              maximumFractionDigits: 3,
                            }).format(row.quantidade_comprada)}{" "}
                            <span className="uppercase">
                              {insumo.unidade_de_medida}
                            </span>
                          </span>
                        ),
                      },
                    ]}
                    renderRightActions={(row: EntradaInsumoResponse) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-(--txt-secondary) hover:text-(--color-red)"
                        onClick={() => {
                          setIdParaEstornar(row.id)
                          setEstornoModalOpen(true)
                        }}
                      >
                        <ArrowCounterClockwiseIcon size={18} weight="bold" />
                      </Button>
                    )}
                    data={entradas}
                    emptyValue="Nenhuma entrada registrada."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={estornoModalOpen}
        onClose={() => setEstornoModalOpen(false)}
        title="Confirmar Estorno"
        description="Atenção: Ao confirmar, a quantidade registrada será imediatamente subtraída do estoque atual e o custo médio será recalculado. Deseja prosseguir?"
        footer={
          <>
            <Button
              variant="outlined"
              disabled={isEstornando}
              onClick={() => setEstornoModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              disabled={isEstornando}
              onClick={onEstornar}
            >
              {isEstornando ? "Estornando..." : "Sim, Estornar Entrada"}
            </Button>
          </>
        }
      />
    </div>
  )
}
