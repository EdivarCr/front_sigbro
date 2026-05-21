import apiClient from "./client"
import type { ProdutoFormData } from "@/schemas/produto.schema"

export type TipoProduto = "molho" | "geleia" | "conserva"

export interface ProdutoInsumoCreate {
  insumo_id: number
  quantidade_necessaria: number
}

export interface FormulaItem {
  insumo_id: number
  quantidade_necessaria: string | number
}

export interface ProdutoListItem {
  id: number
  nome: string
  descricao: string
  tipo: TipoProduto
  preco_varejo: number
  preco_atacado: number
  peso_gramas: number | null
  nivel_picancia: number
  alergenicos: string | null
  tem_carolina_reaper: boolean
  imagem_path: string | null
  imagem_bucket: string | null
  imagem_url: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
  estoque_minimo: number
  validade_meses: number
  unidades_por_caixa: number
  formulas: FormulaItem[]
}

export interface ProdutoListResponse {
  products: ProdutoListItem[]
  offset: number
  limit: number
}

export interface ProdutoFiltros {
  nome?: string
  tipo?: string
  tem_carolina_reaper?: boolean
  nivel_picancia?: number
  ativo?: boolean
  offset?: number
  limit?: number
}

// Lista produtos (admin)
export async function listarProdutos(filtros?: ProdutoFiltros): Promise<ProdutoListResponse> {
  const response = await apiClient.get<ProdutoListResponse>("/produtos/pesquisa", {
    params: filtros
  })
  return response.data
}

// Busca produto
export async function buscarProduto(id: number): Promise<ProdutoListItem> {
  const response = await apiClient.get(`/produtos/pesquisa`)
  
  const produto = response.data.products.find((p: ProdutoListItem) => p.id === id)
  
  if (!produto) {
    throw new Error("Produto não encontrado na lista")
  }
  
  return produto
}

// Post/Patch de Imagens
async function gerenciarImagemProduto(produtoId: number, imageFile: File | null, isUpdate = false) {
  const formData = new FormData()

  console.log("Objeto recebido no serviço:", imageFile); // DEBUG

  if (isUpdate) {
    // PATCH /produtos/{produto_id}/update_image
    if (imageFile && imageFile.name) {
      formData.append("image", imageFile)
      console.log("Anexou a imagem no FormData? SIM!"); // DEBUG
    } else if (imageFile === null) {
      formData.append("remove_image", "true")
    }
    
    await apiClient.patch(`/produtos/${produtoId}/update_image`, formData, {
      // TRUQUE DE MESTRE: Remove qualquer Content-Type global do apiClient
      // Isso força o navegador a assumir o controle e gerar o boundary perfeito
      transformRequest: (data, headers) => {
        delete headers['Content-Type'];
        delete headers['content-type'];
        return data;
      }
    })

  } else {
    // POST /produtos/imagem_produto?id_produto={id}
   if (imageFile && imageFile.name) {
      formData.append("image", imageFile)
      
      await apiClient.post(`/produtos/imagem_produto`, formData, {
        params: { id_produto: produtoId },
        transformRequest: (data, headers) => {
          delete headers['Content-Type'];
          delete headers['content-type'];
          return data;
        }
      })
    }
  }
}

// Cadastra produto
export async function cadastrarProduto(
  data: ProdutoFormData,
  imageFile?: File | null
): Promise<ProdutoListItem> {
  // 1. Cria o Produto enviando JSON (A 'receita' vai embutida no objeto)
  const payload = {
    nome: data.nome,
    descricao: data.descricao,
    tipo: data.tipo,
    preco_varejo: data.preco_varejo,
    preco_atacado: data.preco_atacado,
    nivel_picancia: data.nivel_picancia ?? 0,
    alergenicos: data.alergenicos ?? "",
    tem_carolina_reaper: data.tem_carolina_reaper ?? false,
    estoque_minimo: data.estoque_minimo ?? 10,
    validade_meses: data.validade_meses ?? 0,
    unidades_por_caixa: data.unidades_por_caixa ?? 1,
    peso_gramas: data.peso_gramas || null,
    formulas: data.receita
  }

  const response = await apiClient.post<ProdutoListItem>("/produtos/", payload)
  const produtoCriado = response.data

  // 2. Se houver imagem, faz o upload chamando a rota de imagem com o ID gerado
  if (imageFile) {
    try {
      await gerenciarImagemProduto(produtoCriado.id, imageFile, false)
    } catch (error) {
      console.error("Produto criado, mas falha ao enviar imagem:", error)
    }
  }

  return produtoCriado
}

// Edita produto
export async function editarProduto(
  id: number,
  data: Partial<ProdutoFormData>,
  imageFile?: File | null
): Promise<ProdutoListItem> {

  const payloadJson = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => key !== "image" && value !== undefined)
  )

  const response = await apiClient.patch<ProdutoListItem>(`/produtos/${id}`, payloadJson)
  
  if (imageFile !== undefined) {
    try {
      await gerenciarImagemProduto(id, imageFile, true)
    } catch (error) {
      console.error("Falha ao atualizar a imagem do produto:", error)
    }
  }

  return response.data
}
