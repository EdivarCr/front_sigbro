import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { 
  type ProdutoFormData,
} from "@/schemas/produto.schema"
import { ProductForm } from "@/components/forms/ProductForm"
import { Button } from "@/components/ui/button"

// Virá da API após integração
const produtosMock = [
  { id: 1, nome: "Molho Pimenta da Casa", tipo: "molho", preco_varejo: 18.90, peso_gramas: 150, descricao: "Pimenta malagueta e especiarias.", nivel_picancia: 4, tem_carolina_reaper: false, estoque_minimo: 10, validade_meses: 12, unidades_por_caixa: 12, preco_atacado: 12.00, ativo: true},
]

export default function EditarProdutoPage(){
  const { id } = useParams()
  const { toast } = useToast()
  const navigate = useNavigate()
  
  // Simula busca do produto pelo ID
  const produtoData = produtosMock.find(p => p.id === Number(id))
  
  const handleEdit = (data: ProdutoFormData) => {
    console.log("Enviando dados para a API/Supabase:", data) // TODO: Integração
    
    toast({
      title: "Produto editado!",
      description: `${data.nome} foi alterado com sucesso.`,
      variant: "success",
    })

    navigate("/produtos")
  }

  if (!produtoData) {
    return (
      <div className="flex flex-col items-center py-20">
        <h2 className="text-h2">Produto não encontrado.</h2>
        <Button onClick={() => navigate("/produtos")} variant="outlined" className="mt-4">
          Voltar para a lista
        </Button>
      </div>
    );
  }

  return(
    <div className="flex h-full flex-col">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Produtos", to: "/produtos"},
          { label: `Editar: ${produtoData.nome}` },
        ]}
      />
      <div className="flex flex-col gap-6 py-8">
        <h1 className="text-h1 text-(--txt-primary)">Editar Produto</h1>
        <div className="flex justify-center">
          <div className="flex flex-col w-full rounded-sm bg-(--bg-surface) p-6 shadow-md border border-(--bg-sidebar)">
            
            <ProductForm 
              onSubmit={handleEdit}
              defaultValues={produtoData as ProdutoFormData}
              mode="edit"
            />
          </div>
        </div>
        
      </div>
    </div>
  )
}