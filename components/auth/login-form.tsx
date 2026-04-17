"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogIn, Leaf } from "lucide-react"

export default function LoginForm({ locale }: { locale: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("Correo o contraseña incorrectos.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido de vuelta</h1>
          <p className="text-gray-500 mt-1 text-sm">Ingresa a tu panel de Teralife</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-11"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-11"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ingresando...</>
            ) : (
              <><LogIn className="w-4 h-4 mr-2" /> Iniciar Sesión</>
            )}
          </Button>

          <p className="text-center text-sm text-gray-500">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/sign-up" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Únete al Equipo
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
