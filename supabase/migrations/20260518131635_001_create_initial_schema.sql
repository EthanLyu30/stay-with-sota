/*
  # Create initial SOTA Daily schema

  1. New Tables
    - `sources` — Data source configurations (GitHub, ArXiv, HuggingFace, etc.)
      - `id` (uuid, primary key)
      - `type` (text, source type: github-trending, arxiv, huggingface, etc.)
      - `name` (text, display name)
      - `url` (text, optional URL for RSS/custom sources)
      - `config` (jsonb, source-specific configuration)
      - `enabled` (boolean, whether source is active)
      - `created_at` (timestamptz)
    - `digests` — Daily digest summaries
      - `id` (uuid, primary key)
      - `date` (date, the digest date)
      - `title` (text, digest title)
      - `total_fetched` (integer, total items fetched)
      - `total_filtered` (integer, items after AI filtering)
      - `email_sent` (boolean, whether email was sent)
      - `created_at` (timestamptz)
    - `digest_items` — Individual items within a digest
      - `id` (uuid, primary key)
      - `digest_id` (uuid, foreign key to digests)
      - `source_type` (text, type of source)
      - `source_name` (text, display name of source)
      - `title` (text, item title)
      - `summary` (text, AI-generated summary)
      - `url` (text, link to original content)
      - `relevance_score` (integer, AI relevance score 0-100)
      - `tags` (text[], array of tags)
      - `metadata` (jsonb, optional extra data)
      - `sort_order` (integer, ordering within digest)

  2. Security
    - Enable RLS on all tables
    - Sources: anyone can read, only authenticated can write
    - Digests: anyone can read, only service role can write
    - Digest items: anyone can read, only service role can write

  3. Indexes
    - digests by date (unique)
    - digest_items by digest_id
    - digest_items by source_type
    - sources by type
*/

-- Sources table
CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  name text NOT NULL,
  url text DEFAULT '',
  config jsonb DEFAULT '{}'::jsonb,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Digests table
CREATE TABLE IF NOT EXISTS digests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  title text NOT NULL,
  total_fetched integer DEFAULT 0,
  total_filtered integer DEFAULT 0,
  email_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Digest items table
CREATE TABLE IF NOT EXISTS digest_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  digest_id uuid NOT NULL REFERENCES digests(id) ON DELETE CASCADE,
  source_type text NOT NULL,
  source_name text NOT NULL,
  title text NOT NULL,
  summary text DEFAULT '',
  url text NOT NULL,
  relevance_score integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  sort_order integer DEFAULT 0
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_digests_date ON digests(date);
CREATE INDEX IF NOT EXISTS idx_digest_items_digest_id ON digest_items(digest_id);
CREATE INDEX IF NOT EXISTS idx_digest_items_source_type ON digest_items(source_type);
CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(type);

-- Enable RLS
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_items ENABLE ROW LEVEL SECURITY;

-- Sources policies: public read, authenticated write
CREATE POLICY "Anyone can read sources"
  ON sources FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sources"
  ON sources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sources"
  ON sources FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete sources"
  ON sources FOR DELETE
  TO authenticated
  USING (true);

-- Digests policies: public read, service role write
CREATE POLICY "Anyone can read digests"
  ON digests FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can insert digests"
  ON digests FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update digests"
  ON digests FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Digest items policies: public read, service role write
CREATE POLICY "Anyone can read digest items"
  ON digest_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can insert digest items"
  ON digest_items FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update digest items"
  ON digest_items FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed default sources
INSERT INTO sources (id, type, name, config, enabled) VALUES
  ('00000000-0000-0000-0000-000000000001', 'github-trending', 'GitHub Trending', '{"languages": ["python", "typescript", "rust"], "since": "daily"}'::jsonb, true),
  ('00000000-0000-0000-0000-000000000002', 'arxiv', 'ArXiv AI Papers', '{"categories": ["cs.AI", "cs.CL", "cs.CV", "cs.LG"]}'::jsonb, true),
  ('00000000-0000-0000-0000-000000000003', 'huggingface', 'HuggingFace Daily Papers', '{}'::jsonb, true),
  ('00000000-0000-0000-0000-000000000004', 'hackernews', 'Hacker News AI', '{"keywords": ["AI", "LLM", "GPT", "LLaMA", "transformer", "machine learning", "deep learning", "neural"]}'::jsonb, true)
ON CONFLICT (id) DO NOTHING;
