"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/routing"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { consumeReferralCode } from "@/lib/actions/referrals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, LogIn, Leaf, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function LoginForm({ locale }: { locale: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // If the user confirmed their email and comes back to login,
  // consume the pending referral code stored during sign-up
  useEffect(() => {
    // Check for auth callback (email confirmation redirects here)
    const url = new URL(window.location.href)
    const type = url.searchParams.get("type")
    if (type === "signup") {
      const pendingCode = localStorage.getItem("pending_referral_code")
      const pendingUser = localStorage.getItem("pending_referral_user")
      if (pendingCode && pendingUser) {
        consumeReferralCode(pendingCode, pendingUser).then(() => {
          localStorage.removeItem("pending_referral_code")
          localStorage.removeItem("pending_referral_user")
        })
      }
    }
  }, [])

  async function handleLogin() {
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(translateAuthError(error.message))
      setLoading(false)
      return
    }

    // Consume any pending referral code (edge case: user confirmed email then logged in)
    if (data.user && typeof window !== "undefined") {
      const pendingCode = localStorage.getItem("pending_referral_code")
      const pendingUser = localStorage.getItem("pending_referral_user")
      if (pendingCode && pendingUser === data.user.id) {
        await consumeReferralCode(pendingCode, data.user.id)
        localStorage.removeItem("pending_referral_code")
        localStorage.removeItem("pending_referral_user")
      }
    }

    // Check role to redirect admin directly to /admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user!.id)
      .single()

    if (profile?.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
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
          <p className="text-gray-500 mt-1 text-sm">Ingresá a tu panel de Teralife</p>
        </div>

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
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-11 pr-10"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ingresando...</>
              : <><LogIn className="w-4 h-4 mr-2" /> Iniciar Sesión</>
            }
          </Button>

          <p className="text-center text-sm text-gray-500">
            ¿No tenés cuenta?{" "}
            <Link href="/auth/sign-up" className="text-emerald-600 hover:text-emerald-700 font-medium">
              Únete al Equipo
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function translateAuthError(msg: string): string {
  if (msg.includes("Invalid login credentials") || msg.includes("invalid_credentials"))
    return "Correo o contraseña incorrectos."
  if (msg.includes("Email not confirmed"))
    return "Confirmá tu correo antes de ingresar. Revisá tu bandeja de entrada."
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Demasiados intentos fallidos. Esperá unos minutos e intentá de nuevo."
  if (msg.includes("network") || msg.includes("fetch"))
    return "Error de conexión. Verificá tu internet."
  return "No se pudo iniciar sesión. Intentá de nuevo."
}
