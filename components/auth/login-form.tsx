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

  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("type") === "signup") {
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
    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError || !data.user) {
        setError(translateAuthError(signInError?.message ?? ""))
        setLoading(false)
        return
      }

      const pendingCode = localStorage.getItem("pending_referral_code")
      const pendingUser = localStorage.getItem("pending_referral_user")
      if (pendingCode && pendingUser === data.user.id) {
        await consumeReferralCode(pendingCode, data.user.id)
        localStorage.removeItem("pending_referral_code")
        localStorage.removeItem("pending_referral_user")
      }

      const params = new URLSearchParams(window.location.search)
      const redirectTo = params.get("redirectTo")
      router.push(redirectTo ?? "/dashboard")

    } catch (err) {
      console.error("Login error:", err)
      setError("Ocurrió un error inesperado. Intentá de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4 shadow-lg">
            <Leaf className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Bienvenido de vuelta</h1>
          <p className="text-muted-foreground mt-1 text-sm">Ingresá a tu panel de Teralife</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 space-y-5">

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
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
            <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full h-11"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ingresando...</>
              : <><LogIn className="w-4 h-4 mr-2" /> Iniciar Sesión</>
            }
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tenés cuenta?{" "}
            <Link href="/auth/sign-up" className="text-primary hover:text-primary/80 font-medium">
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
