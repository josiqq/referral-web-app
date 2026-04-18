-- ============================================
-- Extend advisor_settings with About section fields
-- ============================================

alter table public.advisor_settings
  add column if not exists about_title text default 'Sobre Mí',
  add column if not exists about_subtitle text default 'Conoce mi historia y mi pasión por el bienestar',
  add column if not exists about_bio text default 'Soy una apasionada del bienestar integral. Mi camino con Teralife comenzó cuando descubrí cómo estos productos transformaron mi propia salud. Desde entonces, me he dedicado a compartir estos beneficios con todos aquellos que buscan mejorar su calidad de vida.',
  add column if not exists about_mission text default 'Mi misión es brindarte asesoría personalizada para encontrar los productos que mejor se adapten a tus necesidades específicas.',
  add column if not exists about_photo_url text,
  -- Values (stored as JSON array: [{icon, title, description}])
  add column if not exists about_values jsonb default '[
    {"icon": "Heart", "title": "Honestidad", "description": "Te asesoro con transparencia sobre los productos que realmente necesitas."},
    {"icon": "HandHeart", "title": "Compromiso", "description": "Te acompaño en todo tu proceso de bienestar."},
    {"icon": "BookOpen", "title": "Conocimiento", "description": "Estoy constantemente capacitándome para ofrecerte la mejor información."}
  ]'::jsonb;
