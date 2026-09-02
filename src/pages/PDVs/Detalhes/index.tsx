import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { 
  PencilSimpleIcon, 
  MapPinIcon, 
  PhoneIcon, 
  InstagramLogoIcon, 
  LinkIcon, 
  StorefrontIcon,
  CalendarBlankIcon,
  UserIcon
} from "@phosphor-icons/react"
import { useToast } from "@/context/ToastContext"

import { type PontoDeVenda, obterPDVPorId } from "@/services/api/pdv.service"
import { obterClientePorId } from "@/services/api/cliente.service"

export default function DetalhesPDVPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [pdv, setPdv] = useState<PontoDeVenda | null>(null)
  const [nomeCliente, setNomeCliente] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return
      try {
        setLoading(true)

        const pdvDados = await obterPDVPorId(Number(id))
        setPdv(pdvDados)

        if (pdvDados?.id_cliente) {
          const clienteDados = await obterClientePorId(pdvDados.id_cliente)
          setNomeCliente(clienteDados.name)
        }
      } catch (error) {
        console.error("Erro ao buscar detalhes do PDV e Cliente:", error)
        toast({
          title: "Ponto de Venda não encontrado",
          description: "Não foi possível carregar as informações deste PDV.",
          variant: "danger",
        })
        navigate("/pdvs")
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [id, navigate, toast])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!pdv) {
    return (
      <div className="flex flex-col items-center py-20">
        <h2 className="text-h2 text-(--txt-primary)">Ponto de Venda não encontrado.</h2>
        <Button onClick={() => navigate("/pdvs")} variant="outlined" className="mt-4">
          Voltar para a lista
        </Button>
      </div>
    )
  }

  const zonaLabels: Record<string, string> = {
    "ZONA_SUL": "Zona Sul",
    "ZONA_NORTE": "Zona Norte",
    "ZONA_LESTE": "Zona Leste",
    "ZONA_OESTE": "Zona Oeste",
  }

  const corZona: Record<string, string> = {
    "ZONA_SUL": "bg-(--color-blue)/15 text-(--color-blue)",
    "ZONA_NORTE": "bg-(--color-red)/15 text-(--color-red)",
    "ZONA_LESTE": "bg-(--color-yellow)/15 text-(--color-yellow)",
    "ZONA_OESTE": "bg-(--color-green)/15 text-(--color-green)",
  }

  return (
    <div className="flex h-full flex-col min-h-0">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Pontos de Venda", to: "/pdvs" },
          { label: pdv.name },
        ]}
      />
      
      <div className="flex flex-col gap-6 py-8 overflow-y-auto pr-2">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-h1 text-(--txt-primary)">{pdv.name}</h1>
            {pdv.ativo ? (
              <span className="flex items-center gap-1 text-body-sm font-bold text-(--color-green) bg-(--color-green)/15 px-2 py-0.5 rounded-full mt-1">
              Ativo
              </span>
            ) : (
              <span className="flex items-center gap-1 text-body-sm font-bold text-(--txt-secondary) bg-(--bg-sidebar) px-2 py-0.5 rounded-full mt-1">
                Inativo
              </span>
            )}
          </div>
          
          <Button
            variant="primary"
            onClick={() => navigate(`/pdvs/editar/${pdv.id}`)}
          >
            <PencilSimpleIcon size={20} />
            Editar PDV
          </Button>
        </div>

        {/* Cards de Informação */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Identificação */}
          <div className="flex flex-col gap-4 rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-6 shadow-sm">
            <h3 className="text-body-md font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
              Identificação do Ponto
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <UserIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm text-(--txt-secondary)">Cliente Vinculado:</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto p-0 font-bold hover:underline"
                  onClick={() => navigate(`/clientes/${pdv.id_cliente}`)}
                >
                  {nomeCliente}
                </Button>
              </div>
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <StorefrontIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm text-(--txt-secondary)">Região (Zona):</span>
                </div>
                <span className={`text-body-sm font-medium px-2 py-0.5 rounded-full ${corZona[pdv.tipo_zona] || "bg-(--bg-sidebar) text-(--txt-secondary)"}`}>
                  {zonaLabels[pdv.tipo_zona] || pdv.tipo_zona}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Contato e Localização */}
          <div className="flex flex-col gap-4 rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-6 shadow-sm">
            <h3 className="text-body-md font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
              Contato e Localização
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 text-(--txt-primary)">
                <MapPinIcon size={20} className="text-(--txt-secondary) shrink-0 mt-0.5" />
                <span className="text-body-sm">{pdv.endereco}</span>
              </div>
              <div className="flex items-center gap-3 text-(--txt-primary)">
                <PhoneIcon size={20} className="text-(--txt-secondary)" />
                <span className="text-body-sm">{pdv.telefone || "Não informado"}</span>
              </div>
              {pdv.instagram && (
                <div className="flex items-center gap-3 text-(--txt-primary)">
                  <InstagramLogoIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm">{pdv.instagram}</span>
                </div>
              )}
              {pdv.google_maps_url && (
                <div className="flex items-center gap-3 text-(--txt-primary)">
                  <LinkIcon size={20} className="text-(--txt-secondary)" />
                  <a href={pdv.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-body-sm text-brand hover:underline truncate">
                    Ver no Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Logística e Histórico */}
          <div className="flex flex-col gap-4 rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-6 shadow-sm">
            <h3 className="text-body-md font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
              Logística e Histórico
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <CalendarBlankIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm text-(--txt-secondary)">Última Reposição:</span>
                </div>
                <span className="text-body-sm font-medium">
                  {pdv.ultima_reposicao ? new Date(pdv.ultima_reposicao).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : "Sem registos"}
                </span>
              </div>
              <div className="flex items-center justify-between text-(--txt-primary)">
                <div className="flex items-center gap-2">
                  <CalendarBlankIcon size={20} className="text-(--txt-secondary)" />
                  <span className="text-body-sm text-(--txt-secondary)">Criado em:</span>
                </div>
                <span className="text-body-sm text-(--txt-secondary)">
                  {new Date(pdv.criado_em).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </span>
              </div>
            </div>
          </div>

        </div>
        
        {/* Placeholder para futuras funcionalidades de PDV */}
        <div className="mt-4 p-8 border-2 border-dashed border-(--border-default) rounded-md flex flex-col items-center justify-center text-center opacity-60">
          <StorefrontIcon size={48} className="text-(--txt-secondary) mb-4" />
          <h3 className="text-body-lg font-bold text-(--txt-primary)">Área de Gestão de Inventário Local</h3>
          <p className="text-body-sm text-(--txt-secondary) mt-2">
            No futuro, esta área exibirá o estoque atual dos molhos e produtos que estão fisicamente alocados neste Ponto de Venda.
          </p>
        </div>

      </div>
    </div>
  )
}