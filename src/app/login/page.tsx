import React from "react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-borderSubtle rounded-xl p-8 shadow-2xl shadow-black/60">
        {/* Logotipo técnico */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-mono text-lg font-bold tracking-wider">
            LB
          </div>
        </div>

        {/* Título y subtítulo */}
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold text-slate-100 tracking-tight">
            Logbook personal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registra tus inmersiones
          </p>
        </div>

        {/* Formulario */}
        <form className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              className="w-full bg-background border border-borderSubtle rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary transition-colors"
              placeholder="buzo@operaciones.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full bg-background border border-borderSubtle rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-slate-950 font-medium py-2 rounded-lg text-sm transition-colors shadow-sm mt-2"
          >
            Acceder al sistema
          </button>
        </form>
      </div>
    </main>
  );
}