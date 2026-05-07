import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { 
  type ProdutoFormData,
} from "@/schemas/produto.schema"
import { ProductForm } from "@/components/forms/ProductForm"

export default function CadastrarProdutoPage(){
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleCadastro = (data: ProdutoFormData) => {
    console.log("Enviando dados para a API/Supabase:", data) // TODO: Integração
    
    toast({
      title: "Produto cadastrado!",
      description: `${data.nome} foi adicionado ao catálogo com sucesso.`,
      variant: "success",
    })

    navigate("/produtos")
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