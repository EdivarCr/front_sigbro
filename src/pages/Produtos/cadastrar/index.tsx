import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { 
  type ProdutoFormData,
} from "@/schemas/produto.schema"
import { ProductForm } from "@/components/forms/ProductForm"
import { cadastrarProduto } from "@/services/api/produtos.service"

export default function CadastrarProdutoPage(){
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleCadastro = async (data: ProdutoFormData) => {
    try {
      console.log("Enviando dados para a API/Supabase:", data)
      const imageFile = (data as any).image || null 
    
      const response = await cadastrarProduto(data, imageFile)

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