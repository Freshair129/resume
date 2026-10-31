/** Pinned source inspected and built for the portfolio REST adapter. */
export const GENESIS_MANIFEST = Object.freeze({
  engineRepository: 'https://github.com/Freshair129/GenesisBlock',
  engineCommit: '2527a8644f4be5d6c1e8722b24e71717e5ca9e4f',
  engineVersion: '0.2.10',
  buildProfile: 'portfolio-transaction-impact-v1',
  clientNamespace: 'portfolio',
  schemaRef: 'portfolio://knowledge/v1',
  schemaVersion: '1.0.0',
  labels: ['Project', 'Experience', 'Skill', 'Technology', 'Claim', 'SourceDocument', 'Chunk', 'Evidence'],
  relations: ['HAS_CHUNK', 'HAS_CLAIM', 'SUPPORTED_BY', 'USES_TECH', 'DEMONSTRATES_SKILL', 'PART_OF_PROJECT', 'RELATED_TO'],
  physicalDeletion: false,
  nativeLexical: false,
  nativeHybridGraphQualified: true,
  nativeHybridGraphQualificationReason: 'The portfolio-transaction-impact-v1 build patch passed real BGE-M3 transaction graph ablation and crash restart. assertQualified must also verify the running build; unpatched upstream remains unqualified.',
});

/** IDs are client-owned, immutable within a generation, and never authorization. */
export function projectionNodeId(kind, canonicalId, generation) {
  for (const value of [kind, canonicalId, generation]) {
    if (typeof value !== 'string' || !value.length) throw new TypeError('Projection identity fields are required');
  }
  return `portfolio:${encodeURIComponent(kind)}:${encodeURIComponent(canonicalId)}:${encodeURIComponent(generation)}`;
}
