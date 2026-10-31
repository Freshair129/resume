-- Curated repository facts remain governed by the existing publication state.
ALTER TABLE projects DROP CONSTRAINT projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK(status IN ('concept','prototype','tested','deployed','released','archived','source-verified'));
CREATE TABLE portfolio_catalogs (
 id uuid PRIMARY KEY,
 content_hash text UNIQUE NOT NULL,
 manifest jsonb NOT NULL,
 observed_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE portfolio_catalog_entries (
 project_id uuid PRIMARY KEY REFERENCES projects(id),
 catalog_id uuid NOT NULL REFERENCES portfolio_catalogs(id),
 data jsonb NOT NULL,
 content_hash text NOT NULL,
 revision integer NOT NULL,
 approved boolean NOT NULL DEFAULT false
);
ALTER TABLE portfolio_catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_catalog_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON portfolio_catalogs,portfolio_catalog_entries FROM PUBLIC;
