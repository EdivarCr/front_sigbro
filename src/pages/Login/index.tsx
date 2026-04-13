export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 sm:min-h-[70vh]">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 text-center">
          <span className="text-4xl">🌶️</span>
          <h1 className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">
            Entrar no SisBro
          </h1>
          <p className="mt-1 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            Sistema Pimenta Dr. Broa
          </p>
        </div>

        {/* Formulário de login */}
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="touch-target w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:bg-red-800"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
