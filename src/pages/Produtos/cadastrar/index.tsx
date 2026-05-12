import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { 
  type ProdutoFormData,
} from "@/schemas/produto.schema"
import { ProductForm } from "@/components/forms/ProductForm"
import { type ProdutoListItem } from "@/services/api/produtos.service"
import { cadastrarProduto } from "@/services/api/produtos.service"

export default function CadastrarProdutoPage(){
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleCadastro = async (data: ProdutoFormData) => {
    try {
      console.log("Enviando dados para a API/Supabase:", data)
      const imageFile = (data as any).image || null 
    
      const response = await cadastrarProduto(data, imageFile)

      const mockResponse: ProdutoListItem = {
        id: Math.floor(Math.random() * 1000), // Gera um ID aleatório para o teste
        nome: data.nome,
        descricao: data.descricao,
        tipo: data.tipo as "molho" | "geleia" | "conserva",
        
        preco_varejo: Number(data.preco_varejo),
        preco_atacado: Number(data.preco_atacado),
        peso_gramas: data.peso_gramas ? String(data.peso_gramas) : "0.00",
        
        nivel_picancia: data.nivel_picancia || 0,
        alergenicos: data.alergenicos || "",
        tem_carolina_reaper: data.tem_carolina_reaper || false,
        
        // Campos que o banco gera automaticamente
        imagem_path: null,
        imagem_bucket: null,
        ativo: true,
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
        
        // Campos de estoque e validade
        estoque_minimo: data.estoque_minimo || 10,
        validade_meses: data.validade_meses || 0,
        unidades_por_caixa: data.unidades_por_caixa || 1,
      };

      console.log("JSON de resposta do servidor:", response)
      toast({
        title: "Produto cadastrado!",
        description: `${data.nome} foi adicionado ao catálogo com sucesso.`,
        variant: "success",
      })

      navigate("/produtos")
    } catch (error: any) {
      console.error("Erro na resposta:", error.response?.data || error.messages)

      toast({
      title: "Erro ao cadastrar",
        description: error.response?.data?.detail || "Erro na conexão com a API.",
        variant: "danger",
      })
    }
  }

  return(
    <div className="flex h-full flex-col">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Produtos", to: "/produtos"},
          { label: "Cadastrar Produto" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 py-8">
        <h1 className="text-h1 text-(--txt-primary)">Cadastrar Produto</h1>
        <div className="flex justify-center">
          <div className="flex flex-col w-full max-w-271 rounded-sm bg-(--bg-surface) p-6 shadow-md border border-(--bg-sidebar)">
            <ProductForm onSubmit={handleCadastro} mode="create" />
          </div>
        </div>
        
      </div>
    </div>
  )
}