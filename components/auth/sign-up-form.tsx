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
  const [code, setCode] = useState("")
  const [codeError, setCodeError] = useState<string | null>(null)
  const [codeLoading, setCodeLoading] = useState(false)
  const [codeValid, setCodeValid] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerLoading, setRegisterLoading] = useState(false)

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
      setRegisterError(translateAuthError(error.message))
      setRegisterLoading(false)
      return
    }
    if (!data.user) {
      setRegisterError("No se pudo crear la cuenta. Intentá de nuevo.")
      setRegisterLoading(false)
      return
    }
    if (data.session) {
      await consumeReferralCode(code.trim(), data.user.id)
      router.push("/dashboard")
      return
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_referral_code", code.trim())
      localStorage.setItem("pending_referral_user", data.user.id)
    }
    setRegisterLoading(false)
    setStep("confirm-email")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4 shadow-lg">
            <Leaf className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Únete al Equipo Teralife</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {step === "code" && "Ingresá tu código de invitación para continuar"}
            {step === "register" && "Completá tu registro"}
            {step === "confirm-email" && "Confirmá tu correo"}
          </p>
        </div>

        {/* Step indicator */}
        {step !== "confirm-email" && (
          <div className="flex items-center justify-center gap-3 mb-6">
            {(["code", "register"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                {i > 0 && <div className="w-8 h-px bg-border" />}
                <div className={`flex items-center gap-1.5 text-xs font-medium ${
                  step === s ? "text-primary" : s === "code" && codeValid ? "text-primary/60" : "text-muted-foreground"
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s ? "bg-primary text-primary-foreground"
                    : s === "code" && codeValid ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {s === "code" && codeValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  {s === "code" ? "Código" : "Registro"}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">

          {/* Step 1: Code */}
          {step === "code" && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                <KeyRound className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <p className="text-sm text-secondary-foreground/80">
                  Para unirte necesitás un <strong>código de invitación</strong> generado por el administrador. Si no tenés uno, contactate con tu upline.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">Código de invitación</Label>
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
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {codeError}
                </div>
              )}

              {codeValid && (
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-sm rounded-lg px-4 py-3">
                  <CheckCircle2 className="w-4 h-4" />
                  Código válido — preparando registro...
                </div>
              )}

              <Button
                onClick={handleValidateCode}
                disabled={codeLoading || !code.trim() || codeValid}
                className="w-full h-11"
              >
                {codeLoading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validando...</>
                  : "Validar código"
                }
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tenés cuenta?{" "}
                <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
                  Iniciar Sesión
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Register */}
          {step === "register" && (
            <div className="space-y-5">
              <button
                onClick={() => { setStep("code"); setCodeValid(false) }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Cambiar código
              </button>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Nombre completo</Label>
                <Input id="name" type="text" placeholder="Tu nombre" value={name}
                  onChange={e => setName(e.target.value)} className="h-11" autoFocus />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="tu@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña <span className="text-muted-foreground font-normal">(mínimo 6 caracteres)</span>
                </Label>
                <Input id="password" type="password" placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} className="h-11"
                  onKeyDown={e => e.key === "Enter" && handleRegister()} />
              </div>

              {registerError && (
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {registerError}
                </div>
              )}

              <Button
                onClick={handleRegister}
                disabled={registerLoading || !name.trim() || !email.trim() || password.length < 6}
                className="w-full h-11"
              >
                {registerLoading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creando cuenta...</>
                  : <><UserPlus className="w-4 h-4 mr-2" /> Crear mi cuenta</>
                }
              </Button>
            </div>
          )}

          {/* Step 3: Confirm email */}
          {step === "confirm-email" && (
            <div className="space-y-5 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Revisá tu correo</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Enviamos un enlace de confirmación a <strong className="text-foreground">{email}</strong>.
                  Hacé clic en el enlace para activar tu cuenta.
                </p>
              </div>
              <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground text-left">
                <p className="font-medium text-foreground mb-1">¿No llegó el correo?</p>
                <p>Revisá la carpeta de spam. Si el problema persiste, contactate con el administrador.</p>
              </div>
              <Link href="/auth/login" className="block text-sm text-primary hover:text-primary/80 font-medium">
                Ir a iniciar sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

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
