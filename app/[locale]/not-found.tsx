import Link from "next/link"
import { Leaf } from "lucide-react"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">

      {/* Decoración de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-secondary/8 blur-3xl" />
      </div>

      {/* Ilustración SVG */}
      <div className="mb-8">
        <svg
          viewBox="0 0 320 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-72 sm:w-80 mx-auto"
          aria-hidden="true"
        >
          {/* Sombra base */}
          <ellipse cx="160" cy="200" rx="100" ry="12" fill="currentColor" className="text-muted" />

          {/* Hoja grande izquierda */}
          <path
            d="M60 160 C40 120 55 70 90 55 C95 80 85 120 60 160Z"
            fill="currentColor"
            className="text-primary/20"
          />
          <path
            d="M60 160 C75 130 80 90 90 55"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-primary/40"
            strokeLinecap="round"
          />

          {/* Hoja grande derecha */}
          <path
            d="M260 160 C280 120 265 70 230 55 C225 80 235 120 260 160Z"
            fill="currentColor"
            className="text-secondary/20"
          />
          <path
            d="M260 160 C245 130 240 90 230 55"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-secondary/40"
            strokeLinecap="round"
          />

          {/* Texto 404 */}
          <text
            x="160"
            y="145"
            textAnchor="middle"
            fontSize="100"
            fontWeight="800"
            fontFamily="inherit"
            fill="currentColor"
            className="text-muted"
            letterSpacing="-4"
          >
            404
          </text>

          {/* Ícono de hoja centrado en el 0 del 404 */}
          <circle cx="160" cy="102" r="26" fill="currentColor" className="text-primary" />
          <g transform="translate(148, 90)">
            <Leaf
              style={{ display: "none" }}
            />
            {/* SVG path de la hoja de lucide manualmente */}
            <path
              d="M11 20A7 7 0 0 1 4 13C4 8 8.5 3.5 11 2C13.5 3.5 18 8 18 13A7 7 0 0 1 11 20Z"
              fill="white"
              stroke="white"
              strokeWidth="0"
              transform="scale(1.1) translate(-1, -1)"
            />
            <path
              d="M11 20C11 14 7 9 4 6"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="1.5"
              strokeLinecap="round"
              transform="scale(1.1) translate(-1, -1)"
            />
          </g>

          {/* Línea base / suelo */}
          <path
            d="M80 185 Q160 178 240 185"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
            strokeLinecap="round"
          />

          {/* Pequeños puntos decorativos */}
          <circle cx="45" cy="95" r="4" fill="currentColor" className="text-primary/30" />
          <circle cx="35" cy="115" r="2.5" fill="currentColor" className="text-primary/20" />
          <circle cx="275" cy="90" r="4" fill="currentColor" className="text-secondary/30" />
          <circle cx="285" cy="112" r="2.5" fill="currentColor" className="text-secondary/20" />
          <circle cx="160" cy="30" r="3" fill="currentColor" className="text-primary/25" />
          <circle cx="140" cy="18" r="2" fill="currentColor" className="text-secondary/25" />
          <circle cx="180" cy="22" r="2" fill="currentColor" className="text-primary/20" />
        </svg>
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Leaf className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">Teralife</span>
      </div>

      {/* Textos */}
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
        Esta página se perdió en el camino
      </h1>
      <p className="text-muted-foreground text-base sm:text-lg max-w-md mb-10">
        La página que buscás no existe o fue movida. No te preocupes, encontrás todo lo que necesitás desde acá.
      </p>

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </Link>
        <Link
          href="/productos"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-transparent px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Ver productos
        </Link>
      </div>
    </main>
  )
}
