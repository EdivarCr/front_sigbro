import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Table } from "@/components/ui/table"
import { MobileTable } from "@/components/ui/mobile-table"
import { useToast } from "@/context/ToastContext"
import { 
  PencilSimpleIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeSimpleIcon, 
  IdentificationCardIcon, 
  StorefrontIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CalendarBlankIcon,
  EyeIcon,
  PlusIcon
} from "@phosphor-icons/react"
import { type Cliente, obterClientePorId } from "@/services/api/cliente.service"
import { type PontoDeVenda, listarPDVs } from "@/services/api/pdv.service"

export default function DetalhesClientePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [pdvs, setPdvs] = useState<PontoDeVenda[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return
      try {
        setLoading(true)

        const [clienteDados, pdvsDados] = await Promise.all([
          obterClientePorId(Number(id)),
          listarPDVs({ id_cliente: Number(id) })
        ])

        setCliente(clienteDados)
        setPdvs(pdvsDados)
      } catch (error) {
        console.error("Erro ao buscar dados do cliente e seus PDVs:", error)
        toast({
          title: "Erro ao carregar informações",
          description: "Não foi possível carregar os dados deste cliente ou de seus PDVs.",
          variant: "danger",
        })
        navigate("/clientes")
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="flex flex-col items-center py-20">
        <h2 className="text-h2 text-(--txt-primary)">Cliente não encontrado.</h2>
        <Button onClick={() => navigate("/clientes")} variant="outlined" className="mt-4">
          Voltar para a lista
        </Button>
      </div>
    )
  }

  const tipoLabels: Record<string, string> = {
    "PESSOA_FISICA": "Pessoa Física",
    "RESTAURANTE": "Restaurante",
    "COMERCIO": "Comércio"
  }

  const zonaLabels: Record<string, string> = {
    "ZONA_SUL": "Zona Sul",
    "ZONA_NORTE": "Zona Norte",
    "ZONA_LESTE": "Zona Leste",
    "ZONA_OESTE": "Zona Oeste",
  }
  
  return (
    <div className="flex h-full flex-col min-h-0">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Clientes", to: "/clientes" },
          { label: cliente.name },
        ]}
      />
      
      <div className="flex flex-col gap-6 py-8 overflow-y-auto pr-2">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-h1 text-(--txt-primary)">{cliente.name}</h1>
          <Button
            variant="primary"
            onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
          >
            <PencilSimpleIcon size={20} />
            Editar Cliente
          </Button>
        </div>

        {/* Cards de Informação */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Identificação */}
          <div className="flex flex-col gap-4 rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-6 shadow-sm">
            <h3 className="text-body-md font-bold uppercase tracking-wider text-(--txt-secondary) border-b border-(--border-default) pb-2">
              Identificação
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-(--txt-primary)">
                <StorefrontIcon size={20} className="text-(--txt-secondary)" />
                <span className="text-body-sm font-medium">{tipoLabels[cliente.tipo] || cliente.tipo}</span>
              </div>
              <div className="flex items-center gap-3 text-(--txt-primary)">
                <IdentificationCardIcon size={20} className="text-(--txt-secondary)" />
                <span className="text-body-sm">{cliente.identificador}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Contato e Localização */}
          <div className="flex flex-col gap-4 rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-6 shadow-sm">
            <h3 className="text-body-md font-bold uppercase tracking-wider text-(--txt-secondary) border-b border-(--border-default) pb-2">
              Contato
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-(--txt-primary)">
                <PhoneIcon size={20} className="text-(--txt-secondary)" />
                <span className="text-body-sm">{cliente.telefone}</span>
              </div>
              <div className="flex items-center gap-3 text-(--txt-primary)">
                <EnvelopeSimpleIcon size={20} className="text-(--txt-secondary)" />
                <span className="text-body-sm">{cliente.email || "Não informado"}</span>
              </div>
              <div className="flex items-start gap-3 text-(--txt-primary)">
                <MapPinIcon size={20} className="text-(--txt-secondary) shrink-0 mt-0.5" />
                <span className="text-body-sm">{cliente.endereco}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Financeiro / Estatísticas */}
          <div className="flex flex-col gap-4 rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-6 shadow-sm">
            <h3 className="text-body-md font-bold uppercase tracking-wider text-(--txt-secondary) border-b border-(--border-default) pb-2">
              Estatísticas
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm text-(--txt-secondary)">Total Gasto:</span>
                </div>
                <span className="text-body-md font-bold text-brand">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(cliente.total_compras))}
                </span>
              </div>
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm text-(--txt-secondary)">Total Compras:</span>
                </div>
                <span className="text-body-md font-bold">{cliente.quantidade_compras}</span>
              </div>
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <CalendarBlankIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm text-(--txt-secondary)">Última Compra:</span>
                </div>
                <span className="text-body-sm">
                  {cliente.ultima_compra ? new Date(cliente.ultima_compra).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "N/A"}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Seção de PDVs vinculados */}
        <div className="flex flex-col mt-6 gap-4 border-t border-(--border-default) pt-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-h2 text-(--txt-primary)">Pontos de Venda (PDVs)</h2>
              <span className="text-body-sm text-(--txt-secondary)">Unidades de distribuição associadas a este cliente.</span>
            </div>
            {/* O botão já manda o ID do cliente na URL se o form de PDV suportar auto-preenchimento */}
            <Button variant="outlined" onClick={() => navigate(`/pdvs/cadastrar?clienteId=${cliente.id}`)}>
              <PlusIcon size={16} />
              Novo PDV
            </Button>
          </div>

          {/* Tabela Desktop */}
          <div className="hidden md:block">
            <Table
              columns={[
                { key: "name", label: "Nome do Ponto", sortable: true },
                { 
                  key: "tipo_zona", 
                  label: "Zona",
                  render: (row) => (
                    <span className="text-body-sm rounded-full bg-(--bg-sidebar) px-2 py-0.5 font-medium text-(--txt-primary)">
                      {zonaLabels[row.tipo_zona] || row.tipo_zona}
                    </span>
                  )
                },
                { key: "endereco", label: "Endereço" },
                { key: "id", label: "Telefone", render: (row) => row.telefone || "-" },
                { 
                  key: "criado_em", 
                  label: "Última Reposição",
                  render: (row) => row.ultima_reposicao ? new Date(row.ultima_reposicao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "Sem registros"
                },
                {
                  key: "acoes",
                  label: "Ações",
                  className: "w-24",
                  render: (row) => (
                    <div className="-ml-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/pdvs/${row.id}`)}
                        title="Ver PDV"
                      >
                        <EyeIcon size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/pdvs/editar/${row.id}`)}
                        title="Editar PDV"
                      >
                        <PencilSimpleIcon size={16} />
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={pdvs}
              pageSize={5}
              emptyValue="Nenhum PDV cadastrado."
            />
          </div>

          {/* Tabela Mobile */}
          <div className="block md:hidden">
            <MobileTable 
              columns={[
                { key: "name", label: "PDV" },
                { 
                  key: "tipo_zona", 
                  label: "Zona",
                  render: (row) => zonaLabels[row.tipo_zona] || row.tipo_zona
                },
              ]}
              renderRightActions={(pdv) => (
                <>
                  <Button variant="primary" size="sm" onClick={() => navigate(`/pdvs/editar/${pdv.id}`)}>
                    <PencilSimpleIcon size={16} />
                  </Button>
                </>
              )}
              renderBottomAction={(pdv) => (
                <Button 
                  variant="outlined" 
                  className="w-full gap-2"
                  onClick={() => navigate(`/pdvs/${pdv.id}`)}
                >
                  <EyeIcon size={16} /> Detalhes do Ponto
                </Button>
              )}
              data={pdvs}
              emptyValue="Nenhum PDV cadastrado."
            />
          </div>
        </div>

      </div>
    </div>
  )
}