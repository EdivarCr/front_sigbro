export default function CatalogoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-white">
        🌶️ Catálogo de Pimentas
      </h1>
      <p className="mt-2 text-sm text-gray-600 sm:text-base dark:text-gray-400">
        Conheça nossa linha de pimentas artesanais e molhos especiais.
      </p>

      {/* Grid responsivo: 1 col mobile → 2 col tablet → 3 col desktop */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-3 aspect-[4/3] w-full rounded-lg bg-gray-100 sm:mb-4 dark:bg-gray-800" />
            <h3 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
              Pimenta Artesanal #{i}
            </h3>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              Descrição do produto aparecerá aqui.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-bold text-red-600 sm:text-base dark:text-red-400">
                R$ 24,90
              </span>
              <button className="touch-target rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 sm:px-4 sm:py-2 sm:text-sm">
                Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
