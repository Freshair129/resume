CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE projects (
 id uuid PRIMARY KEY, slug text UNIQUE NOT NULL CHECK(slug ~ '^[a-z0-9-]{1,80}$'),
 title jsonb NOT NULL, summary jsonb NOT NULL, category text NOT NULL,
 status text NOT NULL CHECK(status IN ('concept','prototype','tested','deployed','released','archived')),
 visibility text NOT NULL DEFAULT 'review' CHECK(visibility IN ('review','private','public')),
 approved boolean NOT NULL DEFAULT false, revision integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sources (id uuid PRIMARY KEY, uri text NOT NULL, sha text NOT NULL, path text NOT NULL, content_hash text NOT NULL, access_scope text NOT NULL CHECK(access_scope='public'), fetched_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE source_documents (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id), source_id uuid NOT NULL REFERENCES sources(id), text text NOT NULL, hash text NOT NULL, approved boolean NOT NULL DEFAULT false, version integer NOT NULL DEFAULT 1);
CREATE TABLE kb_chunks (id uuid PRIMARY KEY, document_id uuid NOT NULL REFERENCES source_documents(id), chunk_index integer NOT NULL, text text NOT NULL, checksum text NOT NULL, UNIQUE(document_id,chunk_index));
CREATE TABLE index_generations (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id), revision integer NOT NULL, model text NOT NULL, dimension integer NOT NULL CHECK(dimension BETWEEN 1 AND 65535), collection text UNIQUE NOT NULL, state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','verified','active','revoked','failed')), verified_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE publication_state (project_id uuid PRIMARY KEY REFERENCES projects(id), active_generation uuid REFERENCES index_generations(id), desired_generation uuid REFERENCES index_generations(id), epoch bigint NOT NULL DEFAULT 0, revoked boolean NOT NULL DEFAULT true);
CREATE TABLE knowledge_index_records (generation_id uuid NOT NULL REFERENCES index_generations(id), chunk_id uuid NOT NULL REFERENCES kb_chunks(id), node_id text UNIQUE NOT NULL, verified_at timestamptz, PRIMARY KEY(generation_id,chunk_id));
CREATE TABLE knowledge_outbox (id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id), generation_id uuid NOT NULL REFERENCES index_generations(id), operation text NOT NULL CHECK(operation IN ('index','revoke')), state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','done','blocked')), attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(), error_code text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(generation_id,operation));
CREATE TABLE claims (id uuid PRIMARY KEY, project_id uuid REFERENCES projects(id), document_id uuid NOT NULL REFERENCES source_documents(id), assertion text NOT NULL, kind text NOT NULL, verified boolean NOT NULL DEFAULT false);
CREATE TABLE profile (id integer PRIMARY KEY CHECK(id=1), data jsonb NOT NULL, approved boolean NOT NULL DEFAULT false, version integer NOT NULL DEFAULT 1);
CREATE TABLE experiences (id uuid PRIMARY KEY, data jsonb NOT NULL, approved boolean NOT NULL DEFAULT false);
CREATE TABLE skills (id uuid PRIMARY KEY, data jsonb NOT NULL, approved boolean NOT NULL DEFAULT false);
CREATE TABLE resume_variants (track text PRIMARY KEY, label text NOT NULL, approved boolean NOT NULL DEFAULT false);
INSERT INTO resume_variants(track,label) VALUES ('ai-automation','AI Automation'),('martech','MarTech'),('product-operations','Product & Operations'),('content-coordinator','Content Coordinator'),('performance-marketer','Performance Marketer'),('synnex-pm','Product Manager');
CREATE TABLE project_links (id uuid PRIMARY KEY, project_id uuid REFERENCES projects(id), uri text NOT NULL, approved boolean NOT NULL DEFAULT false);
CREATE TABLE assets (id uuid PRIMARY KEY, project_id uuid REFERENCES projects(id), uri text NOT NULL, license text, approved boolean NOT NULL DEFAULT false);
CREATE TABLE ingestion_jobs (id uuid PRIMARY KEY, source_uri text, state text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE api_clients (id uuid PRIMARY KEY, token_hash text UNIQUE NOT NULL, scope text NOT NULL CHECK(scope IN ('owner','public:read')), revoked boolean NOT NULL DEFAULT false);
CREATE TABLE audit_events (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor text NOT NULL, action text NOT NULL, resource_id text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE chat_sessions (id uuid PRIMARY KEY, channel text NOT NULL, expires_at timestamptz NOT NULL);
CREATE TABLE chat_messages (id uuid PRIMARY KEY, session_id uuid REFERENCES chat_sessions(id), decision text NOT NULL, citations jsonb NOT NULL, expires_at timestamptz NOT NULL);
CREATE TABLE line_deliveries (id text PRIMARY KEY, payload jsonb, state text NOT NULL DEFAULT 'pending', attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT now()+interval '1 minute', error_code text);
-- No direct public database grants. API role has explicit table privileges via deployment provisioning.
-- RLS denies unprivileged roles with no policy. The trusted server owns canonical joins.
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON projects,source_documents,kb_chunks,profile,experiences,skills,knowledge_outbox,publication_state FROM PUBLIC;

ALTER TABLE knowledge_outbox ADD COLUMN lease_token uuid, ADD COLUMN lease_until timestamptz;

ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE index_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_index_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_deliveries ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX ingestion_jobs_source_unique ON ingestion_jobs(source_uri);
