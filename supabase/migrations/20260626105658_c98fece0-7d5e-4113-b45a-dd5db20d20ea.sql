
DO $$ BEGIN CREATE TYPE public.product_status AS ENUM ('DRAFT','PUBLISHED','ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.product_category_key AS ENUM ('POWER_WHEELCHAIRS','MANUAL_WHEELCHAIRS','MOBILITY_AIDS','ACCESSORIES','SPARE_PARTS'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.document_kind AS ENUM ('BROCHURE','MANUAL','DATASHEET','CERTIFICATE','WARRANTY','OTHER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.media_provider AS ENUM ('YOUTUBE','VIMEO','SELF_HOSTED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.language AS ENUM ('EN','FA','AR'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.lead_kind AS ENUM ('contact', 'newsletter'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.lead_status AS ENUM ('new', 'notified', 'archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug text UNIQUE NOT NULL,
  category_key public.product_category_key NOT NULL,
  code text UNIQUE,
  name text NOT NULL,
  series jsonb, description jsonb, short_description jsonb, features jsonb,
  status public.product_status NOT NULL DEFAULT 'DRAFT',
  cms_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_key_idx ON public.products(category_key);
CREATE INDEX IF NOT EXISTS products_status_idx ON public.products(status);
CREATE INDEX IF NOT EXISTS products_updated_at_idx ON public.products(updated_at);
CREATE INDEX IF NOT EXISTS products_code_idx ON public.products(code);
CREATE INDEX IF NOT EXISTS products_name_idx ON public.products(name);
DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read published products" ON public.products;
CREATE POLICY "Public can read published products" ON public.products FOR SELECT USING (status = 'PUBLISHED');

CREATE TABLE IF NOT EXISTS public.product_images (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  src text NOT NULL, width int, height int,
  is_primary boolean NOT NULL DEFAULT false,
  position int NOT NULL DEFAULT 0, alt jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS product_images_is_primary_idx ON public.product_images(is_primary);
CREATE INDEX IF NOT EXISTS product_images_src_idx ON public.product_images(src);
CREATE UNIQUE INDEX IF NOT EXISTS product_images_product_primary_uq ON public.product_images(product_id, is_primary);
DROP TRIGGER IF EXISTS product_images_set_updated_at ON public.product_images;
CREATE TRIGGER product_images_set_updated_at BEFORE UPDATE ON public.product_images FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
GRANT SELECT ON public.product_images TO anon, authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read images of published products" ON public.product_images;
CREATE POLICY "Public can read images of published products" ON public.product_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'PUBLISHED'));

CREATE TABLE IF NOT EXISTS public.product_videos (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  src text NOT NULL, poster text,
  provider public.media_provider NOT NULL DEFAULT 'SELF_HOSTED',
  duration_seconds int, title jsonb,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_videos_product_id_idx ON public.product_videos(product_id);
GRANT SELECT ON public.product_videos TO anon, authenticated;
GRANT ALL ON public.product_videos TO service_role;
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read videos of published products" ON public.product_videos;
CREATE POLICY "Public can read videos of published products" ON public.product_videos FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'PUBLISHED'));

CREATE TABLE IF NOT EXISTS public.product_documents (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  kind public.document_kind NOT NULL, src text NOT NULL,
  language public.language DEFAULT 'EN', size_bytes int, title jsonb,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS product_documents_product_id_idx ON public.product_documents(product_id);
GRANT SELECT ON public.product_documents TO anon, authenticated;
GRANT ALL ON public.product_documents TO service_role;
ALTER TABLE public.product_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read documents of published products" ON public.product_documents;
CREATE POLICY "Public can read documents of published products" ON public.product_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'PUBLISHED'));

CREATE TABLE IF NOT EXISTS public.specification_groups (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  key text NOT NULL, label jsonb NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, key)
);
GRANT SELECT ON public.specification_groups TO anon, authenticated;
GRANT ALL ON public.specification_groups TO service_role;
ALTER TABLE public.specification_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read spec groups of published products" ON public.specification_groups;
CREATE POLICY "Public can read spec groups of published products" ON public.specification_groups FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'PUBLISHED'));

CREATE TABLE IF NOT EXISTS public.specification_items (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id text NOT NULL REFERENCES public.specification_groups(id) ON DELETE CASCADE,
  key text NOT NULL, label jsonb NOT NULL, value jsonb NOT NULL,
  unit text, position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.specification_items TO anon, authenticated;
GRANT ALL ON public.specification_items TO service_role;
ALTER TABLE public.specification_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read spec items of published products" ON public.specification_items;
CREATE POLICY "Public can read spec items of published products" ON public.specification_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.specification_groups g JOIN public.products p ON p.id = g.product_id WHERE g.id = group_id AND p.status = 'PUBLISHED'));

CREATE TABLE IF NOT EXISTS public.certifications (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL, issuer text, reference text,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certifications TO anon, authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read certifications of published products" ON public.certifications;
CREATE POLICY "Public can read certifications of published products" ON public.certifications FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'PUBLISHED'));

CREATE TABLE IF NOT EXISTS public.faq_items (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  question jsonb NOT NULL, answer jsonb NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faq_items TO anon, authenticated;
GRANT ALL ON public.faq_items TO service_role;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read FAQ of published products" ON public.faq_items;
CREATE POLICY "Public can read FAQ of published products" ON public.faq_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'PUBLISHED'));

CREATE TABLE IF NOT EXISTS public.related_products (
  from_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  to_id   text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  PRIMARY KEY (from_id, to_id)
);
GRANT SELECT ON public.related_products TO anon, authenticated;
GRANT ALL ON public.related_products TO service_role;
ALTER TABLE public.related_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read related links when both sides are published" ON public.related_products;
CREATE POLICY "Public can read related links when both sides are published" ON public.related_products FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = from_id AND p.status = 'PUBLISHED')
    AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = to_id AND p.status = 'PUBLISHED'));

CREATE TABLE IF NOT EXISTS public.product_seo (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  product_id text UNIQUE NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title jsonb, description jsonb,
  keywords text[] NOT NULL DEFAULT '{}',
  canonical text, og_image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_seo TO anon, authenticated;
GRANT ALL ON public.product_seo TO service_role;
ALTER TABLE public.product_seo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read SEO of published products" ON public.product_seo;
CREATE POLICY "Public can read SEO of published products" ON public.product_seo FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.status = 'PUBLISHED'));

CREATE TABLE IF NOT EXISTS public.migration_log (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL, batch_name text NOT NULL,
  total_records int NOT NULL,
  processed_records int NOT NULL DEFAULT 0,
  failed_records int NOT NULL DEFAULT 0,
  error_log text, notes text
);
GRANT ALL ON public.migration_log TO service_role;
ALTER TABLE public.migration_log ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.company_profile (
  id text PRIMARY KEY DEFAULT 'default',
  name jsonb NOT NULL, mission jsonb, vision jsonb, history jsonb,
  certificates jsonb, contact jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT company_profile_single_row CHECK (id = 'default')
);
GRANT SELECT ON public.company_profile TO anon, authenticated;
GRANT ALL ON public.company_profile TO service_role;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read the company profile" ON public.company_profile;
CREATE POLICY "Public can read the company profile" ON public.company_profile FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.category_copy (
  slug text PRIMARY KEY,
  category_key public.product_category_key NOT NULL,
  title jsonb, short_description jsonb, full_description jsonb,
  usage jsonb, target_audience jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.category_copy TO anon, authenticated;
GRANT ALL ON public.category_copy TO service_role;
ALTER TABLE public.category_copy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read category copy" ON public.category_copy;
CREATE POLICY "Public can read category copy" ON public.category_copy FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.lead_kind NOT NULL,
  name TEXT, email TEXT NOT NULL,
  organization TEXT, message TEXT, locale TEXT, source TEXT,
  status public.lead_status NOT NULL DEFAULT 'new',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_kind_created_at_idx ON public.leads (kind, created_at DESC);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can submit leads" ON public.leads;
CREATE POLICY "Public can submit leads" ON public.leads FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND length(email) <= 255);
DROP POLICY IF EXISTS "Service role manages leads" ON public.leads;
CREATE POLICY "Service role manages leads" ON public.leads FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Release 1.1 — Search & Discovery
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS search_tsv tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      coalesce(name, '') || ' ' ||
      coalesce(code, '') || ' ' ||
      coalesce(slug, '') || ' ' ||
      coalesce(series            ->> 'fa', '') || ' ' ||
      coalesce(series            ->> 'en', '') || ' ' ||
      coalesce(series            ->> 'ar', '') || ' ' ||
      coalesce(short_description ->> 'fa', '') || ' ' ||
      coalesce(short_description ->> 'en', '') || ' ' ||
      coalesce(short_description ->> 'ar', '') || ' ' ||
      coalesce(description       ->> 'fa', '') || ' ' ||
      coalesce(description       ->> 'en', '') || ' ' ||
      coalesce(description       ->> 'ar', '')
    )
  ) STORED;
CREATE INDEX IF NOT EXISTS products_search_tsv_idx ON public.products USING GIN (search_tsv);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS products_name_trgm_idx ON public.products USING GIN (name gin_trgm_ops);
