import { 
  useForm,
  Controller,
  useFieldArray,
  type SubmitHandler,
  type Resolver
} from "react-hook-form"
import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  produtoSchema, 
  type ProdutoFormData 
} from "@/schemas/produto.schema"
import { 
  FireIcon, 
  PackageIcon, 
  CurrencyDollarIcon, 
  ScalesIcon, 
  CalendarIcon, 
  NotePencilIcon,
  PlusIcon,
  TrashIcon,
  PencilSimpleIcon
} from "@phosphor-icons/react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SelectField } from "@/components/ui/select-field"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "../ui/switch"
import { ImageUploader } from "../ui/image-uploader"
import { Table } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { listarInsumos } from "@/services/api/insumo.service"

interface ProductFormProps {
  onSubmit: (data: ProdutoFormData) => void
  defaultValues?: ProdutoFormData
  mode: 'create' | 'edit'
}

export function ProductForm({ onSubmit, defaultValues, mode}: ProductFormProps) {
  const navigate = useNavigate()

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema) as Resolver<ProdutoFormData>,
    defaultValues: {
      ...defaultValues,
      tipo: (defaultValues?.tipo || "") as any,
      receita: defaultValues?.receita || [],
    },
    mode: "all",
  })

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "receita"
  })

  const [insumosDb, setInsumosDb] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [insumoSelecionadoId, setInsumoSelecionadoId] = useState<string>("")
  const [indexEmEdicao, setIndexEmEdicao] = useState<number | null>(null)

  const quantidadeAssistida = watch("quantidade_necessaria_temp")
  
  // Busca os insumos ativos do banco ao carregar a tela
  useEffect(() => {
    async function fetchInsumos() {
      try {
        const data = await listarInsumos({ ativo: true })

        // Filtra apenas insumos que tenham estoque e custo cadastrados
        const insumosValidos = (data.insumos || []).filter(
          (insumo) => insumo.quantidade_estoque > 0 && insumo.custo_unitario > 0
        )
        
        setInsumosDb(insumosValidos)
      } catch (error) {
        console.error("Erro ao carregar insumos", error)
      }
    }
    fetchInsumos()
  }, [])  

  // Monitora o Select do Modal para identificar o clique no atalho de redirecionamento
  useEffect(() => {
    if (insumoSelecionadoId === "adicionar_novo_insumo") {
      setModalOpen(false)
      setInsumoSelecionadoId("") 
      navigate("/insumos")
    }
  }, [insumoSelecionadoId, navigate])

  // Memoriza o Insumo selecionado no modal para extrair a unidade de medida rapidamente
  const insumoSelecionado = useMemo(() => {
    return insumosDb.find(i => i.id === Number(insumoSelecionadoId))
  }, [insumoSelecionadoId, insumosDb])

  const handleAddInsumo = () => {
    if (insumoSelecionadoId && quantidadeAssistida && !errors.quantidade_necessaria_temp) {
      const dadosInsumo = {
        insumo_id: Number(insumoSelecionadoId),
        quantidade_necessaria: Number(quantidadeAssistida)
      }

      if (indexEmEdicao !== null) {
        update(indexEmEdicao, dadosInsumo)
      } else {
        // Se não, adiciona uma nova linha normalmente
        append(dadosInsumo)
      }

      setModalOpen(false)
      setInsumoSelecionadoId("")
      setIndexEmEdicao(null)
      setValue("quantidade_necessaria_temp", undefined)
    }
  }

  const handleIniciarEdicao = (index: number) => {
    const item = fields[index]
    
    setIndexEmEdicao(index)
    setInsumoSelecionadoId(String(item.insumo_id))
    
    setValue("quantidade_necessaria_temp", item.quantidade_necessaria)
    
    setModalOpen(true)
  }
  const tableData = fields.map((field, index) => {
    const insumoDetail = insumosDb.find(i => i.id === field.insumo_id) || {
      nome: "Carregando...",
      unidade_de_medida: "",
      custo_unitario: 0,
    }
    return {
      ...field,
      index,
      insumo: insumoDetail,
    }
  })  

  const custoTotal = tableData.reduce((acc, curr) => {
    return acc + (curr.quantidade_necessaria * curr.insumo.custo_unitario)
  }, 0)

  const columns: any[] = [
    { key: "insumo", label: "Insumo", render: (r: any) => r.insumo.nome },
    { 
      key: "quantidade_necessaria", 
      label: "Qtd. Gasta", 
      render: (r: any) => `${r.quantidade_necessaria} ${r.insumo.unidade_de_medida.toUpperCase()}` 
    },
    { 
      key: "id", 
      label: "Custo por Insumo", 
      render: (r: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(r.quantidade_necessaria * r.insumo.custo_unitario) 
    }
  ]

  if (mode === 'create') {
    columns.push({
      key: "acoes",
      label: "Ações",
      className: "w-16 text-right",
      render: (r: any) => (
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => handleIniciarEdicao(r.index)}
          >
            <PencilSimpleIcon size={18} className="text-(--txt-secondary)" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(r.index)}
            className="text-(--txt-secondary) hover:text-(--color-red)"
          >
            <TrashIcon size={18} />
          </Button>
        </div>
      )
    })
  }  

  const handleFormSubmit: SubmitHandler<ProdutoFormData> = (data) => {
    onSubmit(data)
  }

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
        {mode === 'edit' && (
          <div className="flex items-center justify-between rounded-sm border border-(--bg-sidebar) bg-(--bg-surface) p-4">
            <div className="flex flex-col">
              <label className="text-label font-bold text-(--txt-primary)">
                Status do Produto
              </label>
              <span className="text-[11px] text-(--txt-secondary)">
                Inative para ocultar este item do catálogo.
              </span>
            </div>

            <Controller
              name="ativo"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  label={field.value ? "Ativo" : "Inativo"}
                />
              )}
            />
          </div>
        )}

        {/* Seção 1: Identificação */}
        <div className="flex flex-col">
          <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
            Identificação Básica
          </h3>
          <div className="flex flex-col xl:flex-row gap-8">
            <div className="flex flex-col items-center">
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <ImageUploader
                    value={typeof field.value === "string" ? field.value : null}
                    onChange={(file) => field.onChange(file)}
                  />
                )}
              />
            </div>
            
            <div className="flex flex-1 flex-col gap-4 ">
              <Input
                label="Nome do Produto"
                placeholder="Ex: Molho Habanero Especial"
                required
                error={errors.nome?.message}
                {...register("nome")}
              />

              <Controller
                name="tipo"
                control={control}
                render={({ field, fieldState }) => (
                  <SelectField
                    label="Categoria"
                    required
                    placeholder="Selecione uma categoria"
                    options={[
                      { label: "Molho", value: "molho" },
                      { label: "Geleia", value: "geleia" },
                      { label: "Conserva", value: "conserva" },
                    ]}
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      field.onBlur()
                    }}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Textarea
                label="Descrição e Ingredientes"
                placeholder="Liste os componentes e informações de rotulagem..."
                required
                error={errors.descricao?.message}
                helper="Mínimo de 1 ingrediente conforme normas de rotulagem."
                {...register("descricao")}
                rows={5}
              />
            </div>
          </div>
        </div>

        {/* Seção 2: Receita e Insumos */}
        <div className="flex flex-col gap-4 border-t border-(--border-default) pt-6 mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary)">
              Receita (Composição do Produto)
            </h3>
            
            {/* O botão só aparece na criação, garantindo que a edição seja Read-Only */}
            {mode === 'create' && (
              <Button
                type="button"
                variant="outlined"
                size="sm"
                onClick={() => setModalOpen(true)}
              >
                <PlusIcon size={16} /> Adicionar Insumo
              </Button>
            )}
          </div>

          {errors.receita?.root?.message && (
            <span className="text-sm text-(--color-red)">{errors.receita.root.message}</span>
          )}

          <div className="flex flex-col rounded-sm border border-(--border-default) bg-(--bg-surface) overflow-hidden">
            <Table
              columns={columns}
              data={tableData}
              emptyValue="N/A"
              noRenderFooter
            />
            
            {/* Footer de Custo Total */}
            <div className="flex justify-between items-center p-4 bg-(--bg-sidebar) border-t border-(--border-default)">
              <span className="text-body-md font-bold text-(--txt-secondary)">Custo Total Base (1 Unidade):</span>
              <span className="text-body-md font-bold text-(--txt-secondary)">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(custoTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Seção 3: Precificação e Lucratividade */}
        <div className="flex flex-col">
          <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
            Financeiro
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Preço Varejo (R$)"
              type="number"
              step="0.01"
              iconLeft={<CurrencyDollarIcon />}
              error={errors.preco_varejo?.message}
              {...register("preco_varejo")}
              required
            />
            <Input
              label="Preço Atacado (R$)"
              type="number"
              step="0.01"
              iconLeft={<CurrencyDollarIcon />}
              error={errors.preco_atacado?.message}
              {...register("preco_atacado")}
              required
            />
          </div>
        </div>
        

        {/* Seção 4: Especificações Técnicas */}
        <div className="flex flex-col">
          <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
            Especificações Técnicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nível de Picância (0-10)"
              type="number"
              min="0"
              iconLeft={<FireIcon />}
              error={errors.nivel_picancia?.message}
              {...register("nivel_picancia")}
            />
            <Input
              label="Peso (gramas)"
              type="number"
              iconLeft={<ScalesIcon />}
              required
              error={errors.peso_gramas?.message}
              {...register("peso_gramas")}
            />
            <Input
              label="Alergênicos"
              placeholder="Ex: Glúten, Soja..."
              iconLeft={<NotePencilIcon />}
              error={errors.alergenicos?.message}
              {...register("alergenicos")}
            />
          </div>
        </div>
        

        {/* Seção 5: Estoque e Logística */}
        <div className="flex flex-col">
          <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2">
            Estoque e Logística
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Estoque Mínimo"
              type="number"
              iconLeft={<PackageIcon />}
              error={errors.estoque_minimo?.message}
              {...register("estoque_minimo")}
            />
            <Input
              label="Validade (meses)"
              type="number"
              iconLeft={<CalendarIcon />}
              error={errors.validade_meses?.message}
              {...register("validade_meses")}
            />
            <Input
              label="Unidades por Caixa"
              type="number"
              iconLeft={<PackageIcon />}
              error={errors.unidades_por_caixa?.message}
              {...register("unidades_por_caixa")}
              required
            />
          </div>
        </div>
        

        {/* Alerta de Picância */}
        <div className="rounded-sm bg-(--bg-primary) p-4 border-l-4 border-brand">
          <Controller
            name="tem_carolina_reaper"
            control={control}
            render={({ field }) => (
              <Checkbox 
                label="Este produto contém Carolina Reaper?" 
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="button"
            variant="outlined"
            className="flex-1"
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={!isValid}
          >
            Salvar Produto
          </Button>
        </div>
      </form>

      {/* Modal  de Inserção de Insumo */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setInsumoSelecionadoId("")
        }}
        title={indexEmEdicao !== null ? "Editar Insumo da Receita" : "Adicionar Insumo à Receita"}
        footer={
          <>
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setModalOpen(false)
                setInsumoSelecionadoId("")
                setIndexEmEdicao(null)
                setValue("quantidade_necessaria_temp", undefined)
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!insumoSelecionadoId || !quantidadeAssistida || !!errors.quantidade_necessaria_temp}
              onClick={handleAddInsumo}
            >
              Confirmar Adição
            </Button>
          </>
        }
      >
        <SelectField
          label="Selecione o Insumo"
          placeholder="Buscar insumo..."
          options={[
              ...insumosDb.map(i => ({ value: String(i.id), label: i.nome })),
              { value: "adicionar_novo_insumo", label: "+ Adicionar Tipo de Insumo"}
            ]}
          value={insumoSelecionadoId}
          onValueChange={setInsumoSelecionadoId}
        />

        <Input
          label="Quantidade Necessária"
          type="number"
          step="0.001"
          placeholder="Ex: 0.5"
          disabled={!insumoSelecionadoId}
          error={errors.quantidade_necessaria_temp?.message}
          {...register("quantidade_necessaria_temp")}
          iconRight={
            insumoSelecionado ? (
              <span className="pr-2 font-bold uppercase text-(--txt-secondary)">
                {insumoSelecionado.unidade_de_medida}
              </span>
            ) : undefined
          }
        />
      </Modal>
    </>
  )
}