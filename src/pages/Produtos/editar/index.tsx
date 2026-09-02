import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useToast } from "@/context/ToastContext"
import { 
  type ProdutoFormData,
} from "@/schemas/produto.schema"
import { ProductForm } from "@/components/forms/ProductForm"
import { type ProdutoListItem, buscarProduto, editarProduto } from "@/services/api/produtos.service"
import { Button } from "@/components/ui/button"

export default function EditarProdutoPage(){
  const { id } = useParams()
  const [produto, setProduto] = useState<ProdutoListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const BUCKET = "SigBro_imgs/"
  const urlBase = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/`;
 
  const valoresIniciais = {
    ...produto,

    image: produto?.imagem_path ? `${urlBase}${BUCKET}${produto.imagem_path}` : null,
    alergenicos: produto?.alergenicos ?? "",
    
    receita: (produto?.formulas || []).map((item: any) => ({
      insumo_id: item.insumo_id,
      quantidade_necessaria: Number(item.quantidade_necessaria),
    })),
  } as ProdutoFormData;
  
  const { toast } = useToast()
  const navigate = useNavigate()
  
  useEffect(() => {
    async function carregarDados() {
      try {
        const data = await buscarProduto(Number(id));
        setProduto(data);
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [id]);

  if (loading) return <p>Carregando dados do produto...</p>;

  if (!produto) {
    return (
      <div className="flex flex-col items-center py-20">
        <h2 className="text-h2">Produto não encontrado.</h2>
        <Button onClick={() => navigate("/produtos")} variant="outlined" className="mt-4">
          Voltar para a lista
        </Button>
      </div>
    );
  }

  const handleEdit = async (data: ProdutoFormData) => {
    setIsSubmitting(true)
    try {
      console.log("Valor da imagem no submit:", data.image);

      const imageToProcess = data.image === null 
        ? null 
        : (data.image && data.image.name 
            ? data.image 
            : undefined);

      await editarProduto(Number(id), data, imageToProcess)
      
      if (imageToProcess !== undefined) {
        await new Promise((resolve) => setTimeout(resolve, 400));

        await editarProduto(Number(id), data, imageToProcess)
      }

      toast({
        title: "Produto editado!",
        description: `${data.nome} foi alterado com sucesso.`,
        variant: "success",
      })

      navigate("/produtos")
    } catch (error) {
      toast({
        title: "Erro ao editar",
        description: "Verifique os dados e tente novamente.",
        variant: "danger",
      });
    } finally {
      setIsSubmitting(false)
    }
  }

  return(
    <div className="flex h-full flex-col">
      <Breadcrumb
        items={[
          { label: "Tela Inicial", to: "/" },
          { label: "Gestão de Produtos", to: "/produtos"},
          { label: `Editar: ${produto?.nome}` },
        ]}
      />
      <div className="flex flex-col gap-6 py-8">
        <h1 className="text-h1 text-(--txt-primary)">Editar Produto</h1>
        <div className="flex justify-center">
          <div className={`flex flex-col w-full rounded-sm bg-(--bg-surface) p-6 shadow-md border border-(--bg-sidebar) ${isSubmitting ? "opacity-50 pointer-events-none" : ""}`}>
            <ProductForm 
              onSubmit={handleEdit}
              defaultValues={valoresIniciais}
              mode="edit"
            />
          </div>
        </div>
        
      </div>
    </div>
  )
}