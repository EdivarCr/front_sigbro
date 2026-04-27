import { Breadcrumb } from "@/components/ui/breadcrumb"

export default function DashboardPage() {
  ;<Breadcrumb
    items={[
      { label: "Tela Inicial", to: "/dashboard" },
      { label: "Perfil de Usuário" },
    ]}
  />

  return (
    <div>
      <h1 className="text-h1 text-(--txt-primary)">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-600 sm:mt-2 dark:text-gray-400">
        Visão geral do sistema — produção, vendas e estoque.
      </p>

      {/* Placeholder — cards de métricas responsivos */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Vendas Hoje", valor: "R$ 1.250" },
          { label: "Produtos Ativos", valor: "42" },
          { label: "Estoque Baixo", valor: "7" },
          { label: "PDVs Ativos", valor: "12" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 sm:text-sm dark:text-gray-400">
                {card.label}
              </span>
            </div>
            <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
              {card.valor}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
