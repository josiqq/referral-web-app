"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { validateReferralCode, consumeReferralCode } from "@/lib/actions/referrals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Loader2, Leaf, KeyRound, UserPlus,
  CheckCircle2, ArrowLeft, Mail, AlertCircle,
} from "lucide-react"

type Step = "code" | "register" | "confirm-email"

export default function SignUpForm() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("code")

  // Step 1
  const [code, setCode] = useState("")
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeValid, setCodeValid] = useState(false)

  // Step 2
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerLoading, setRegisterLoading] = useState(false)

  // ── Step 1: Validate code ─────────────────────────────
  async function handleValidateCode() {
    const trimmed = code.trim()
    if (!trimmed) return

    setCodeError(null)
    setCodeLoading(true)

    const result = await validateReferralCode(trimmed)

    if (!result.valid) {
      setCodeError("Este código no es válido, ya fue utilizado o está inactivo. Pedile uno nuevo al administrador.")
      setCodeLoading(false)
      return
    }

    setCodeValid(true)
    setCodeLoading(false)
    setTimeout(() => setStep("register"), 500)
  }

  // ── Step 2: Register ──────────────────────────────────
  async function handleRegister() {
    setRegisterError(null)
    setRegisterLoading(true)

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })

    if (error) {
      // Translate common Supabase auth errors to Spanish
      const msg = translateAuthError(error.message)
      setRegisterError(msg)
      setRegisterLoading(false)
      return
    }

    if (!data.user) {
      setRegisterError("No se pudo crear la cuenta. Intentá de nuevo.")
      setRegisterLoading(false)
      return
    }

    // Case A: email confirmation disabled (session is immediately available)
    if (data.session) {
      await consumeReferralCode(code.trim(), data.user.id)
      router.push("/dashboard")
      return
    }

    // Case B: email confirmation required
    // Store the pending referral linkage in localStorage so it runs after confirmation
    // The code will be consumed when the user logs in for the first time
    // (handled in the login flow via a pending_referral_code cookie)
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_referral_code", code.trim())
      localStorage.setItem("pending_referral_user", data.user.id)
    }

    setRegisterLoading(false)
    setStep("confirm-email")
  }

  // ── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Únete al Equipo Teralife</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {step === "code" && "Ingresá tu código de invitación para continuar"}
            {step === "register" && "Completá tu registro"}
            {step === "confirm-email" && "Confirmá tu correo"}
          </p>
        </div>

        {/* Steps indicator — only show for step 1 and 2 */}
        {step !== "confirm-email" && (
          <div className="flex items-center justify-center gap-3 mb-6">
            {(["code", "register"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                {i > 0 && <div className="w-8 h-px bg-gray-200" />}
                <div className={`flex items-center gap-1.5 text-xs font-medium ${step === s ? "text-emerald-700" : s === "code" && codeValid ? "text-emerald-500" : "text-gray-400"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${step === s ? "bg-emerald-600 text-white"
                      : s === "code" && codeValid ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-400"}`}
                  >
                    {s === "code" && codeValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  {s === "code" ? "Código" : "Registro"}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          {/* ── Step 1: Code ── */}
          {step === "code" && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <KeyRound className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-800">
                  Para unirte necesitás un <strong>código de invitación</strong> generado por el administrador. Si no tenés uno, contactate con tu upline.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-gray-700">Código de invitación</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Ej: TERA-A1B2C3"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="h-11 font-mono tracking-widest text-center text-lg"
                  onKeyDown={e => e.key === "Enter" && handleValidateCode()}
                  disabled={codeValid}
                  autoFocus
                />
              </div>

              {codeError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {codeError}
                </div>
              )}

              {codeValid && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
                  <CheckCircle2 className="w-4 h-4" />
                  Código válido — preparando registro...
                </div>
              )}

              <Button
                onClick={handleValidateCode}
                disabled={codeLoading || !code.trim() || codeValid}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
              >
                {codeLoading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validando...</>
                  : "Validar código"
                }
              </Button>

              <p className="text-center text-sm text-gray-500">
                ¿Ya tenés cuenta?{" "}
                <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          )}

          {/* ── Step 2: Register ── */}
          {step === "register" && (
            <div className="space-y-5">
              <button
                onClick={() => { setStep("code"); setCodeValid(false) }}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cambiar código
              </button>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-11"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña <span className="text-gray-400 font-normal">(mínimo 6 caracteres)</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11"
                  onKeyDown={e => e.key === "Enter" && handleRegister()}
                />
              </div>

              {registerError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {registerError}
                </div>
              )}

              <Button
                onClick={handleRegister}
                disabled={registerLoading || !name.trim() || !email.trim() || password.length < 6}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
              >
                {registerLoading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando cuenta...</>
                  : <><UserPlus className="w-4 h-4 mr-2" /> Crear mi cuenta</>
                }
              </Button>
            </div>
          )}

          {/* ── Step 3: Confirm email ── */}
          {step === "confirm-email" && (
            <div className="space-y-5 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Revisá tu correo</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Enviamos un enlace de confirmación a <strong className="text-gray-700">{email}</strong>.
                  Hacé clic en el enlace para activar tu cuenta y acceder al panel.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 text-left">
                <p className="font-medium mb-1">¿No llegó el correo?</p>
                <p className="text-amber-700">Revisá la carpeta de spam. Si el problema persiste, contactate con el administrador.</p>
              </div>
              <Link href="/auth/login" className="block text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Ir a iniciar sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Error translation ─────────────────────────────────────────────────────────

function translateAuthError(msg: string): string {
  if (msg.includes("already registered") || msg.includes("already been registered"))
    return "Este correo ya está registrado. ¿Querés iniciar sesión?"
  if (msg.includes("password") && msg.includes("6"))
    return "La contraseña debe tener al menos 6 caracteres."
  if (msg.includes("invalid email") || msg.includes("valid email"))
    return "El correo ingresado no es válido."
  if (msg.includes("rate limit"))
    return "Demasiados intentos. Esperá un momento e intentá de nuevo."
  if (msg.includes("network") || msg.includes("fetch"))
    return "Error de conexión. Verificá tu internet e intentá de nuevo."
  return "Ocurrió un error. Intentá de nuevo o contactá al administrador."
}
