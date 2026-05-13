import apiClient from "./client"
import type { ProdutoFormData } from "@/schemas/produto.schema"

export interface ProdutoListItem {
  id: number
  nome: string
  descricao: string
  tipo: "molho" | "geleia" | "conserva"
  preco_varejo: number
  preco_atacado: number
  peso_gramas: number | string | null
  nivel_picancia: number
  alergenicos: string
  tem_carolina_reaper: boolean
  imagem_path: string | null
  imagem_bucket: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
  estoque_minimo: number
  validade_meses: number
  unidades_por_caixa: number
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
export async function listarProdutos(
  filtros?: ProdutoFiltros
): Promise<ProdutoListResponse> {
  const params = new URLSearchParams()
  if (filtros?.nome) params.append("nome", filtros.nome)
  if (filtros?.tipo) params.append("tipo", filtros.tipo)
  if (filtros?.ativo !== undefined)
    params.append("ativo", String(filtros.ativo))
  if (filtros?.offset !== undefined)
    params.append("offset", String(filtros.offset))
  if (filtros?.limit !== undefined)
    params.append("limit", String(filtros.limit))

  const response = await apiClient.get(`/produtos/pesquisa?${params}`)
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

// Cadastra produto
export async function cadastrarProduto(
  data: ProdutoFormData,
  imageFile?: File | null
): Promise<ProdutoListItem> {
  const formData = new FormData()

  // Campos do produto
  formData.append("nome", data.nome)
  formData.append("descricao", data.descricao)
  formData.append("tipo", data.tipo)
  formData.append("preco_varejo", String(data.preco_varejo))
  formData.append("preco_atacado", String(data.preco_atacado))
  formData.append("nivel_picancia", String(data.nivel_picancia ?? 0))
  formData.append("alergenicos", data.alergenicos ?? "")
  formData.append(
    "tem_carolina_reaper",
    String(data.tem_carolina_reaper ?? false)
  )
  formData.append("estoque_minimo", String(data.estoque_minimo ?? 10))
  formData.append("validade_meses", String(data.validade_meses ?? 0))
  formData.append("unidades_por_caixa", String(data.unidades_por_caixa ?? 1))
  if (data.peso_gramas) formData.append("peso_gramas", String(data.peso_gramas))

  // Imagem
  if (imageFile) formData.append("image", imageFile)

  const response = await apiClient.post("/produtos/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

// Edita produto
export async function editarProduto(
  id: number,
  data: Partial<ProdutoFormData>,
  imageFile?: File | null
): Promise<ProdutoListItem> {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (key !== "image" && value !== undefined && value !== null) {
      formData.append(key, String(value))
    }
  })
  
  if (imageFile instanceof File) {
    formData.append("image", imageFile) // Upload de arquivo novo
  } else if (imageFile === null) {
    formData.append("remove_image", "true") // Comando para remover imagem atual
    console.log("Sinal de remoção enviado.")
  }

  console.log("Imagem sendo enviada:", formData.get("image"));
  const response = await apiClient.patch(`/produtos/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}
