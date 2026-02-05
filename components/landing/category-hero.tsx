"use client"

import Image from "next/image"
import { Package } from "lucide-react"

interface CategoryHeroProps {
  name: string
  description: string | null
  image_url: string | null
}

export function CategoryHero({ name, description, image_url }: CategoryHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 md:gap-12 md:py-16 lg:py-20 items-center">
          {/* Text Content */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {name}
            </h2>
            {description && (
              <p className="text-lg text-muted-foreground leading-relaxed md:text-xl">
                {description}
              </p>
            )}
          </div>

          {/* Image */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl">
            {image_url ? (
              <Image
                src={image_url}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                <Package className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-secondary/5 blur-3xl" />
    </div>
  )
}
