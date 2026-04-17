"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { validateReferralCode, consumeReferralCode } from "@/lib/actions/referrals"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Leaf, KeyRound, UserPlus, CheckCircle2, ArrowLeft } from "lucide-react"

type Step = "code" | "register"

export default function SignUpForm() {
  const router = useRouter()

  // Step
  const [step, setStep] = useState<Step>("code")

  // Step 1 – code
  const [code, setCode] = useState("")
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeValid, setCodeValid] = useState(false)

  // Step 2 – register
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerLoading, setRegisterLoading] = useState(false)

  // ── Step 1: Validate code ──────────────────────────────
  async function handleValidateCode() {
    if (!code.trim()) return
    setCodeError(null)
    setCodeLoading(true)

    const result = await validateReferralCode(code.trim())

    if (!result.valid) {
      setCodeError("Código inválido, ya utilizado o inactivo. Solicita uno nuevo al administrador.")
      setCodeLoading(false)
      return
    }

    setCodeValid(true)
    setCodeLoading(false)

    // Small delay so user sees the checkmark
    setTimeout(() => setStep("register"), 600)
  }

  // ── Step 2: Create account ─────────────────────────────
  async function handleRegister() {
    setRegisterError(null)
    setRegisterLoading(true)

    const supabase = createClient()

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
      },
    })

    if (error || !data.user) {
      setRegisterError(error?.message ?? "Error al crear la cuenta.")
      setRegisterLoading(false)
      return
    }

    // Consume the referral code and link referred_by
    await consumeReferralCode(code.trim(), data.user.id)

    router.push("/dashboard")
  }

  // ── Render ─────────────────────────────────────────────
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
            {step === "code" ? "Ingresa tu código de invitación para continuar" : "Completa tu registro"}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${step === "code" ? "text-emerald-700" : "text-emerald-600"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === "code" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-600"}`}>
              {codeValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : "1"}
            </div>
            Código
          </div>
          <div className="w-8 h-px bg-gray-200" />
          <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${step === "register" ? "text-emerald-700" : "text-gray-400"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === "register" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"}`}>
              2
            </div>
            Registro
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          {/* ── Step 1: Code ── */}
          {step === "code" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <KeyRound className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm text-emerald-800">
                  Para unirte necesitas un <strong>código de invitación</strong> generado por el administrador. Si no tienes uno, contáctate con tu upline.
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
                />
              </div>

              {codeError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {codeError}
                </div>
              )}

              {codeValid && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Código válido. Preparando registro...
                </div>
              )}

              <Button
                onClick={handleValidateCode}
                disabled={codeLoading || !code.trim() || codeValid}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
              >
                {codeLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validando...</>
                ) : (
                  "Validar código"
                )}
              </Button>

              <p className="text-center text-sm text-gray-500">
                ¿Ya tienes cuenta?{" "}
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
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
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
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11"
                  onKeyDown={e => e.key === "Enter" && handleRegister()}
                />
              </div>

              {registerError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {registerError}
                </div>
              )}

              <Button
                onClick={handleRegister}
                disabled={registerLoading || !name || !email || !password}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
              >
                {registerLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando cuenta...</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" /> Crear mi cuenta</>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
