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
import { useState } from "react"
import { useToast } from "@/context/ToastContext"
import { useNavigate } from "react-router-dom"

const produtos = [
  {
    id: 1,
    nome: "Molho Pimenta da Casa",
    tipo: "molho",
    preco_varejo: 18.90,
    preco_atacado: 1,
    nivel_picancia: 4,
    tem_carolina_reaper: false,
    estoque_minimo: 10,
    validade_meses: 12,
    unidades_por_caixa: 12,
    peso_gramas: 150.00,
    ativo: true,
  },
  {
    id: 2,
    nome: "Molho Carolina Reaper Extremo",
    tipo: "molho",
    preco_varejo: 34.90,
    preco_atacado: 21.99,
    nivel_picancia: 10,
    tem_carolina_reaper: true,
    estoque_minimo: 10,
    validade_meses: 18,
    unidades_por_caixa: 6,
    peso_gramas: 100.00,
    ativo: true,
  },
  {
    id: 3,
    nome: "Geleia de Pimenta com Abacaxi",
    tipo: "geleia",
    preco_varejo: 22.90,
    preco_atacado: 14.43,
    nivel_picancia: 3,
    tem_carolina_reaper: false,
    estoque_minimo: 10,
    validade_meses: 6,
    unidades_por_caixa: 12,
    peso_gramas: 200.00,
    ativo: true,
  },
  {
    id: 4,
    nome: "Geleia de Pimenta com Manga",
    tipo: "geleia",
    preco_varejo: 22.90,
    preco_atacado: 14.43,
    nivel_picancia: 2,
    tem_carolina_reaper: false,
    estoque_minimo: 10,
    validade_meses: 6,
    unidades_por_caixa: 12,
    peso_gramas: 200.00,
    ativo: true,
  },
  {
    id: 5,
    nome: "Conserva de Pimenta Biquinho",
    tipo: "conserva",
    preco_varejo: 19.90,
    preco_atacado: 12.54,
    nivel_picancia: 1,
    tem_carolina_reaper: false,
    estoque_minimo: 10,
    validade_meses: 24,
    unidades_por_caixa: 12,
    peso_gramas: 250.00,
    ativo: true,
  },
  {
    id: 6,
    nome: "Molho Habanero Defumado",
    tipo: "molho",
    preco_varejo: 28.90,
    preco_atacado: 18.21,
    nivel_picancia: 7,
    tem_carolina_reaper: false,
    estoque_minimo: 10,
    validade_meses: 18,
    unidades_por_caixa: 6,
    peso_gramas: 150.00,
    ativo: true,
  },
  {
    id: 7,
    nome: "Geleia de Pimenta com Morango",
    tipo: "geleia",
    preco_varejo: 24.90,
    preco_atacado: 15.69,
    nivel_picancia: 2,
    tem_carolina_reaper: false,
    estoque_minimo: 10,
    validade_meses: 6,
    unidades_por_caixa: 12,
    peso_gramas: 200.00,
    ativo: false,
  },
  {
    id: 8,
    nome: "Conserva de Jalapeño",
    tipo: "conserva",
    preco_varejo: 21.90,
    preco_atacado: 13.80,
    nivel_picancia: 5,
    tem_carolina_reaper: false,
    estoque_minimo: 10,
    validade_meses: 24,
    unidades_por_caixa: 12,
    peso_gramas: 250.00,
    ativo: true,
  },
  {
    id: 9,
    nome: "Molho Carolina Reaper com Mel",
    tipo: "molho",
    preco_varejo: 38.90,
    preco_atacado: 24.51,
    nivel_picancia: 9,
    tem_carolina_reaper: true,
    estoque_minimo: 10,
    validade_meses: 18,
    unidades_por_caixa: 6,
    peso_gramas: 100.00,
    ativo: true,
  },
  {
    id: 10,
    nome: "Conserva de Pimenta Dedo de Moça",
    tipo: "conserva",
    preco_varejo: 17.90,
    preco_atacado: 11.28,
    nivel_picancia: 4,
    tem_carolina_reaper: false,
    estoque_minimo: 10,
    validade_meses: 24,
    unidades_por_caixa: 12,
    peso_gramas: 250.00,
    ativo: false,
  },
  {
    id: 11,
    nome: "Molho Pimenta Verde com Limão",
    tipo: "molho",
    preco_varejo: 19.90,
    preco_atacado: 12.54,
    nivel_picancia: 3,
    tem_carolina_reaper: false,
    estoque_minimo: 10,
    validade_meses: 12,
    unidades_por_caixa: 12,
    peso_gramas: 150.00,
    ativo: true,
  },
]

export default function ProdutosPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const [filterModalOpen, setFilterModalOpen] = useState(false)

  const [statusFiltro, setStatusFiltro] = useState<string>("")
  const [statusTemp, setStatusTemp] = useState<string>("")

  const [tipoFiltro, setTipoFiltro] = useState<string>("")
  const [tipoTemp, setTipoTemp] = useState<string>("")
  
  const statusLabels: Record<string, string> = {
    "true": "Ativo",
    "false": "Inativo"
  };

  const tipoLabels: Record<string, string> = {
    "molho": "Molho",
    "geleia": "Geleia",
    "conserva": "Conserva"
  };

  const filteredProdutos = produtos.filter((p) => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFiltro === "" || 
      (statusFiltro === "true" ? p.ativo : !p.ativo)
    const matchTipo = tipoFiltro === "" || p.tipo === tipoFiltro
    return matchSearch && matchStatus && matchTipo
  })

  const [removeModalOpen, setRemoveModalOpen] = useState(false)

  // const removerForm aqui, se necessário !
  // const onRemover aqui, se necessário

  /*const [selectedProduct, setSelectedProduct] = useState<(typeof produtos)[0] | null>(
    null
  )*/

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
                data={filteredProdutos}
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
                    render: (row) => `R$ ${row.preco_varejo.toFixed(2)}` 
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
                data={filteredProdutos}
                emptyValue="N/A"
              />
            </div>
          </div>
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
