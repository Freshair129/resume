# GraphRAG Quick Start Guide

## 🎯 Overview

EVA 9.1.0 ใช้ **Neo4j Graph Database** สำหรับ GraphRAG เพื่อเก็บและค้นหาความทรงจำแบบ Multi-dimensional ที่ผสมผสานระหว่าง:

- **Semantic Search** (ความหมายภาษา)
- **Bio-State Similarity** (ความคล้ายของสถานะฮอร์โมน)
- **Temporal Relationships** (ลำดับเวลา)
- **Cross-modal Links** (ความเชื่อมโยงข้าม Domain)

## 🚀 Installation

### Prerequisites

- Docker Desktop installed
- At least 4GB RAM free
- Port 7474 และ 7687 ว่าง

### Step 1: Start Neo4j

```bash
# Windows
setup_graph_db.bat

# หรือ Manual
docker-compose up -d neo4j
```

### Step 2: Initialize Database

```bash
python scripts/init_graph_db.py
```

### Step 3: Verify

เปิด Browser: <http://localhost:7474>

**Login:**

- Username: `neo4j`
- Password: `eva_graph_2026`

## 📊 Schema Overview

### Node Types

```cypher
// Episodic Memory
(:EPISODE {
  id: "EVA_EP001",
  text: "User input or EVA response",
  timestamp: datetime(),
  session_id: "SES_xxx",
  resonance_index: 0.85,
  text_embedding: [...]  // 768D vector
})

// Bio-State Snapshot
(:BIO_STATE {
  id: "BIO_xxx",
  cortisol: 0.8,
  dopamine: 0.3,
  serotonin: 0.5,
  adrenaline: 0.6,
  embedding: [...]  // 16D vector (all hormones)
})

// Semantic Concept
(:CONCEPT {
  id: "CONCEPT_Fear",
  name: "Fear",
  description: "...",
  related_blocks: ["Algo::Adrenaline_Spike"]
})

// Sensory/Qualia
(:QUALIA {
  id: "QUALIA_xxx",
  intensity: 0.9,
  depth: 0.7,
  tone: "tense"
})

// Stimulus
(:STIMULUS {
  id: "STM-001",
  name: "acute_threat",
  category: "Survival"
})
```

### Edge Types

```cypher
// Temporal
(e1:EPISODE)-[:PRECEDES]->(e2:EPISODE)

// State Association
(e:EPISODE)-[:HAS_STATE]->(b:BIO_STATE)

// Bio-State Similarity (auto-generated)
(b1:BIO_STATE)-[:SIMILAR_TO {score: 0.92}]->(b2:BIO_STATE)

// Semantic Association
(e:EPISODE)-[:EVOKES]->(c:CONCEPT)

// Sensory Detail
(e:EPISODE)-[:CONTAINS]->(q:QUALIA)

// Causal Relationship
(s:STIMULUS)-[:TRIGGERS]->(b:BIO_STATE)
```

## 🔍 Example Queries

### 1. หาความทรงจำที่มี Bio-State คล้ายกัน

```cypher
// Current state
WITH [0.8, 0.3, 0.5, 0.6] as current_bio_vector

// Find similar episodes
MATCH (e:EPISODE)-[:HAS_STATE]->(b:BIO_STATE)
WHERE b.embedding IS NOT NULL
WITH e, b, gds.similarity.euclidean(b.embedding, current_bio_vector) as similarity
WHERE similarity > 0.85
RETURN e.text, b.cortisol, similarity
ORDER BY similarity DESC
LIMIT 5
```

### 2. หาความทรงจำที่เกิดหลังจากเหตุการณ์คล้ายกัน

```cypher
MATCH (e1:EPISODE)-[:EVOKES]->(c:CONCEPT)<-[:EVOKES]-(e2:EPISODE)
WHERE e1.timestamp > e2.timestamp
  AND e1.id <> e2.id
RETURN e2.text as past_memory, 
       c.name as shared_concept,
       e1.resonance_index as current_intensity
ORDER BY e1.timestamp DESC
LIMIT 3
```

### 3. หา Causal Chain (Stimulus → Bio-State → Episode)

```cypher
MATCH path = (s:STIMULUS)-[:TRIGGERS]->(b:BIO_STATE)<-[:HAS_STATE]-(e:EPISODE)
WHERE s.category = "Survival"
RETURN s.name, b.cortisol, e.text
LIMIT 5
```

## 🐍 Python Integration

### Basic Connection

```python
from neo4j import GraphDatabase

class EVAGraphRAG:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            "bolt://localhost:7687",
            auth=("neo4j", "eva_graph_2026")
        )
    
    def close(self):
        self.driver.close()
    
    def find_similar_bio_states(self, current_state: dict, limit=5):
        """
        Find episodes with similar biological states
        
        Args:
            current_state: {"cortisol": 0.8, "dopamine": 0.3, ...}
        """
        with self.driver.session() as session:
            result = session.run("""
                MATCH (e:EPISODE)-[:HAS_STATE]->(b:BIO_STATE)
                WHERE abs(b.cortisol - $cortisol) < 0.2
                  AND abs(b.dopamine - $dopamine) < 0.2
                RETURN e.text, b.cortisol, b.dopamine
                ORDER BY abs(b.cortisol - $cortisol) + abs(b.dopamine - $dopamine)
                LIMIT $limit
            """, cortisol=current_state["cortisol"],
                dopamine=current_state["dopamine"],
                limit=limit)
            
            return [record.data() for record in result]

# Usage
graph = EVAGraphRAG()
matches = graph.find_similar_bio_states({
    "cortisol": 0.8,
    "dopamine": 0.3
})
for match in matches:
    print(f"Match: {match['e.text'][:50]}... (Cortisol: {match['b.cortisol']})")
graph.close()
```

## 📦 Data Migration

### Migrate Episodic Memory to Graph

```python
import json
from pathlib import Path
from neo4j import GraphDatabase

def migrate_episodes_to_graph(episodes_dir: Path, driver):
    """Migrate existing episodic JSON files to Neo4j"""
    
    with driver.session() as session:
        for ep_file in episodes_dir.glob("*.json"):
            with open(ep_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            for ep_id, episode in data.get("episodes_structure", {}).items():
                # Create Episode node
                session.run("""
                    MERGE (e:EPISODE {id: $id})
                    SET e.text = $text,
                        e.timestamp = datetime($timestamp),
                        e.session_id = $session_id,
                        e.resonance_index = $ri
                """, 
                    id=ep_id,
                    text=episode["turn_1"]["raw_text"],
                    timestamp=data["timestamp"],
                    session_id=data["session_id"],
                    ri=episode["state_snapshot"].get("Resonance_index", 0.0)
                )
                
                # Create Bio-State node
                matrix = episode["state_snapshot"]["EVA_matrix"]
                session.run("""
                    MERGE (b:BIO_STATE {id: $id})
                    SET b.stress_load = $stress,
                        b.social_warmth = $warmth,
                        b.joy_level = $joy
                    
                    WITH b
                    MATCH (e:EPISODE {id: $ep_id})
                    MERGE (e)-[:HAS_STATE]->(b)
                """,
                    id=f"BIO_{ep_id}",
                    stress=matrix["stress_load"],
                    warmth=matrix["social_warmth"],
                    joy=matrix["joy_level"],
                    ep_id=ep_id
                )

# Run migration
# driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "eva_graph_2026"))
# migrate_episodes_to_graph(Path("eva/consciousness/episodic_memory/episodes_user"), driver)
```

## 🛠️ Maintenance

### View Database Stats

```cypher
// Node counts
MATCH (n) RETURN labels(n)[0] as type, count(n) as count

// Relationship counts
MATCH ()-[r]->() RETURN type(r) as type, count(r) as count
```

### Clear All Data (Reset)

```cypher
MATCH (n) DETACH DELETE n
```

### Backup Database

```bash
docker exec eva-neo4j neo4j-admin database dump neo4j --to-path=/import/backup.dump
```

## 🔗 Next Steps

1. ✅ **Schema Design**: ขยาย Node/Edge Types ตามความต้องการ
2. ⏳ **Create graph_rag_engine.py**: Integration กับ Orchestrator
3. ⏳ **Migrate Data**: ย้าย Episodic Memory ทั้งหมด
4. ⏳ **Benchmark**: เปรียบเทียบกับ Agentic-RAG ปัจจุบัน

## 📚 Resources

- [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/)
- [Neo4j Python Driver](https://neo4j.com/docs/python-manual/current/)
- [Vector Indexes Guide](https://neo4j.com/docs/cypher-manual/current/indexes-for-vector-search/)
