import { useState, useEffect } from "react"
import { 
  useForm,
  Controller,
  useFieldArray,
  type Resolver
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  vendaSchema, 
  type VendaFormData,
  type ItemVendaFormData 
} from "@/schemas/vendas.schema"
import { 
  TagIcon, 
  CalendarBlankIcon, 
  MoneyIcon,
  PlusIcon,
  PencilSimpleIcon,
  TrashIcon
} from "@phosphor-icons/react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SelectField } from "@/components/ui/select-field"
import { Table } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"

// Tipos esperados para as props que alimentam os selects
interface ClienteOption { id: number; name: string }
interface ProdutoOption { id: number; nome: string; preco_base: number; unidade: string }

interface VendaFormProps {
  onSubmit: (data: VendaFormData) => void
  defaultValues?: Partial<VendaFormData>
  mode: 'create' | 'edit'
  clientesDisponiveis: ClienteOption[]
  produtosDisponiveis: ProdutoOption[]
}

export function VendaForm({ onSubmit, defaultValues, mode, clientesDisponiveis, produtosDisponiveis }: VendaFormProps) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<VendaFormData>({
    resolver: zodResolver(vendaSchema) as Resolver<VendaFormData>,
    defaultValues: {
      tipo_venda: "ATACADO",
      status_pagamento: "PAGO",
      valor_subtotal: 0,
      valor_desconto: 0,
      valor_total: 0,
      data_venda: new Date().toISOString().split("T")[0], 
      itens: [],
      ...defaultValues,
    },
    mode: "all",
  })

  const { fields: itensVenda, append, remove, update } = useFieldArray({
    control,
    name: "itens",
  })

  const watchedItens = watch("itens")
  const watchedDesconto = watch("valor_desconto")

  useEffect(() => {
    const subtotal = watchedItens.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0)
    const desconto = Number(watchedDesconto) || 0
    const total = Math.max(0, subtotal - desconto)

    setValue("valor_subtotal", subtotal, { shouldValidate: true })
    setValue("valor_total", total, { shouldValidate: true })
  }, [watchedItens, watchedDesconto, setValue])

  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  
  // Form isolado apenas para o modal de adicionar/editar item
  const { 
    register: regItem, 
    watch: watchItem, 
    setValue: setValItem, 
    reset: resetItem, 
    control: controlItem,
    trigger: triggerItem,
    formState: { isValid: isItemValid } 
  } = useForm<ItemVendaFormData>({ mode: "all" })

  const watchedProdutoIdModal = watchItem("produto_id")
  const watchedQtdModal = watchItem("quantidade") || 0
  const watchedPrecoModal = watchItem("preco_unitario") || 0

  // Auto-preenche preço e calcula subtotal dentro do modal
  useEffect(() => {
    if (watchedProdutoIdModal) {
      const prod = produtosDisponiveis.find(p => p.id === Number(watchedProdutoIdModal))
      if (prod && editingIndex === null) { 
        setValItem("preco_unitario", prod.preco_base)
        setValItem("unidade_medida", prod.unidade as any)
      }
    }
  }, [watchedProdutoIdModal, produtosDisponiveis, setValItem, editingIndex])

  useEffect(() => {
    setValItem("subtotal", Number((watchedQtdModal * watchedPrecoModal).toFixed(2)))
  }, [watchedQtdModal, watchedPrecoModal, setValItem])

  const onSaveItemClick = async () => {
    const isFormValid = await triggerItem();
    if (!isFormValid) return;

    const data = watchItem();
    if (editingIndex !== null) {
      update(editingIndex, data)
    } else {
      append(data)
    }
    setIsItemModalOpen(false)
    resetItem()
    setEditingIndex(null)
  }

  const columns = [
    {
      key: "produto_id",
      label: "Produto",
      render: (row: any) => {
        const prod = produtosDisponiveis.find(p => p.id === row.produto_id)
        return prod?.nome || "Desconhecido"
      }
    },
    { 
      key: "quantidade", 
      label: "Quantidade",
      render: (row: any) => `${row.quantidade} ${row.unidade_medida.toLowerCase()}`
    },
    { 
      key: "preco_unitario", 
      label: "Preço Un.",
      render: (row: any) => `R$ ${Number(row.preco_unitario).toFixed(2).replace('.', ',')}`
    },
    { 
      key: "subtotal", 
      label: "Subtotal",
      render: (row: any) => <span className="font-bold">R$ {Number(row.subtotal).toFixed(2).replace('.', ',')}</span>
    },
    {
      key: "acoes",
      label: "Ações",
      render: (row: any) => {
        const itemIndex = itensVenda.findIndex(item => item.id === row.id)
        
        return (
          <div className="flex gap-2">
            {mode === 'create' && (
              <>
                <Button variant="ghost" size="sm" type="button" onClick={() => {
                  resetItem(row)
                  setEditingIndex(itemIndex)
                  setIsItemModalOpen(true)
                }}>
                  <PencilSimpleIcon size={16} />
                </Button>
                <Button variant="ghost" size="sm" type="button" className="text-(--color-red)" onClick={() => remove(itemIndex)}>
                  <TrashIcon size={16} />
                </Button>
              </>
            )}
          </div>
        )
      }
    }
  ]

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LADO ESQUERDO: Cliente e Tabela de Produtos */}
        <div className="lg:col-span-2 flex flex-col gap-6 border-r-0 lg:border-r border-(--border-default) lg:pr-8">
          
          <div className="flex flex-col gap-4">
            <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2 border-b border-(--border-default)">
              Identificação do Cliente
            </h3>
            <Controller
              name="cliente_id"
              control={control}
              render={({ field, fieldState }) => (
                <SelectField
                  label="Cliente"
                  placeholder="Selecione o cliente..."
                  options={[
                    { label: "Cliente Balcão (Sem cadastro)", value: "AVULSO" },
                    ...clientesDisponiveis.map(c => ({ label: c.name, value: String(c.id) }))
                  ]}
                  value={field.value ? String(field.value) : "AVULSO"}
                  onValueChange={(val) => field.onChange(val ? Number(val) : null)}
                  error={fieldState.error?.message}
                  disabled={mode === 'edit'}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <div className="flex items-center justify-between border-b border-(--border-default) pb-2">
              <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary)">
                Produtos Vendidos
              </h3>
              {mode === 'create' && (
                <Button type="button" variant="primary" size="sm" className="bg-brand text-white border-none" onClick={() => {
                  resetItem({ quantidade: 1, preco_unitario: 0, subtotal: 0, unidade_medida: "un" } as any)
                  setEditingIndex(null)
                  setIsItemModalOpen(true)
                }}>
                  <PlusIcon size={16} /> Adicionar Produto
                </Button>
              )}
            </div>

            {errors.itens?.root?.message && (
              <span className="text-sm text-(--color-red)">{errors.itens.root.message}</span>
            )}

            <div className="flex flex-col rounded-sm border border-(--border-default) bg-(--bg-surface) overflow-hidden">
              <Table
                columns={columns}
                data={itensVenda}
                emptyValue="Nenhum produto adicionado"
                noRenderFooter
              />
              <div className="flex flex-col gap-1 p-4 bg-(--bg-sidebar) border-t border-(--border-default) items-end">
                <span className="text-body-sm text-(--txt-secondary)">
                  Subtotal: R$ {watch("valor_subtotal").toFixed(2).replace('.', ',')}
                </span>
                <span className="text-body-sm text-(--color-green)">
                  Desconto: - R$ {Number(watch("valor_desconto") || 0).toFixed(2).replace('.', ',')}
                </span>
                <span className="text-h4 font-bold text-(--txt-primary) mt-1">
                  Total: R$ {watch("valor_total").toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO: Configurações da Venda */}
        <div className="flex flex-col gap-6">
          <h3 className="text-body-sm font-bold uppercase tracking-wider text-(--txt-secondary) pb-2 border-b border-(--border-default)">
            Configurações da Venda
          </h3>

          <Controller
            name="tipo_venda"
            control={control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Tipo de Venda"
                required
                options={[
                  { label: "Atacado", value: "ATACADO" },
                  { label: "Varejo", value: "VAREJO" },
                ]}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
                disabled={mode === 'edit'}
              />
            )}
          />

          <Controller
            name="status_pagamento"
            control={control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Status do Pagamento"
                required
                options={[
                  { label: "Pago", value: "PAGO" },
                  { label: "Pendente", value: "PENDENTE" },
                ]}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="forma_pagamento"
            control={control}
            render={({ field, fieldState }) => (
              <SelectField
                label="Forma de Pagamento"
                placeholder="Ex: PIX, Cartão..."
                options={[
                  { label: "PIX", value: "PIX" },
                  { label: "Dinheiro", value: "DINHEIRO" },
                  { label: "Cartão de Crédito", value: "CARTAO_CREDITO" },
                  { label: "Cartão de Débito", value: "CARTAO_DEBITO" },
                  { label: "Boleto", value: "BOLETO" },
                ]}
                value={field.value || ""}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Input
            label="Data da Venda"
            type="date"
            required
            iconLeft={<CalendarBlankIcon />}
            error={errors.data_venda?.message}
            {...register("data_venda")}
            disabled={mode === 'edit'}
          />

          <Input
            label="Desconto Direto (R$)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            iconLeft={<MoneyIcon />}
            error={errors.valor_desconto?.message}
            {...register("valor_desconto", { valueAsNumber: true })}
            disabled={mode === 'edit'}
          />

          <div className="flex flex-col gap-3 pt-6 mt-auto">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-brand text-white border-none"
              disabled={!isValid || itensVenda.length === 0}
            >
              {mode === 'create' ? "Registrar Venda" : "Salvar Alterações"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="lg"
              className="w-full"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>

      {/* Modal de Adicionar/Editar Produto na Venda */}
      <Modal
        open={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingIndex !== null ? "Editar Produto na Venda" : "Adicionar Produto na Venda"}
        footer={
          <>
            <Button variant="outlined" type="button" onClick={() => setIsItemModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="secondary" type="button" onClick={onSaveItemClick} disabled={!isItemValid}>
              {editingIndex !== null ? "Atualizar" : "Adicionar"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Controller
            name="produto_id"
            control={controlItem} 
            render={({ fieldState }) => (
              <SelectField
                label="Selecione o Produto"
                placeholder="Buscar produto..."
                options={produtosDisponiveis.map(p => ({ label: p.nome, value: String(p.id) }))}
                value={String(watchItem("produto_id") || "")}
                onValueChange={(val) => setValItem("produto_id", Number(val), { shouldValidate: true })}
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantidade"
              type="number"
              step="1"
              min="1"
              iconLeft={<TagIcon />}
              {...regItem("quantidade", { valueAsNumber: true })}
            />
            <Input
              label="Preço Unitário (R$)"
              type="number"
              step="0.01"
              min="0"
              iconLeft={<MoneyIcon />}
              {...regItem("preco_unitario", { valueAsNumber: true })}
            />
          </div>

          <div className="bg-(--bg-sidebar) p-3 rounded-sm border border-(--border-default) mt-2 flex justify-between">
            <span className="text-body-sm font-bold text-(--txt-secondary)">Subtotal do Item:</span>
            <span className="text-body-sm font-bold text-(--txt-primary)">
              R$ {Number(watchItem("subtotal") || 0).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </Modal>
    </>
  )
}