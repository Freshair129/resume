├─ operation_system/               # [CORE] Resonance Bus & Bridges
│  ├── configs/                    # Bus Registry & SSOT
│  ├── llm_bridge/                 # LLM Interfaces (Gemini/Ollama)
│  ├── logs/audit/                 # Streaming Telemetry Logs (*.jsonl)
│  ├── resonance_bus.py            # Hybrid Streaming Engine
│  └── verify_resonance_loop.py    # Validation Scripts
│
├─ eva/
│  ├── identity/                  # [storage] persona / soul / cognition
│  │   ├── persona.yaml
│  │   ├── cognition.yaml
│  │   └── soul.md
│  │
│  ├── consciousness/            # [storage] lived experience and persistence memory space 
│  │   ├── episodic_memory/      # working memory
│  │   ├── semantic_memory/      # working memory
│  │   ├── sensory_memory/       # working memory
│  │   ├── session_memory/       # Short-term memory    
│  │   ├── core_memory/          # Long-term memory and identity
│  │   ├── sphere_memory/        # Long-term memory and principles
│  │   ├── state_memory/         # working memory, current state 
│  │   ├── context_memory/       # working memory, current situational context, summary context, goal context     
│  │   └── indexes/              # [indexes]
│  │
│  ├── memory/                   # [storage] structured self-knowledge
│  │   ├── user_profile/         # [user_profile]
│  │   ├── state_storage/        # [state_storage]
│  │   ├── context_storage/      # [context_storage]
│  │   ├── archival_memory/      # [archival_memory]
│  │   └── indexes/              # [indexes]
│  │
│  └── memory_os/                # [system] Memory n soul Passport (stateless, replaceable)
│      ├── configs/              # [configs]
│      ├── contracts/            # [contracts]
│      ├── logic/                # [logic]
│      ├── schemas/              # [schemas]
│      ├── write_policies/       # [write_policies]
│      ├── validators/           # [validators]
│      ├── journaling/           # [journaling]
│      └── msp.py
│
├── orchestrator/              # [BRAIN] Decision Making
│  ├── cin/                    # [node] Context Injection Node
│  │   ├── configs/            # CIN Configs
│  │   │   ├── CIN_configs.yaml
│  │   │   └── CIN_Interface.yaml
│  │   ├── contract/           # Payload Contract (Locked)
│  │   │   └── CIN_Payload_Contract.yaml
│  │   ├── schema/             # Payload Schema (Locked)
│  │   │   └── CIN_Payload_Schema.yaml
│  │   └── cin.py             # CIN Engine
│  ├── pmt/                    # [engine] Prompt Rule Layer (Identity and personality locked)
│  │   ├── configs/            # PMT Configs
│  │   │   ├── PMT_configs.yaml
│  │   │   └── PMT_Interface.yaml
│  │   ├── contract/           # Payload Contract (Locked)
│  │   │   └── PMT_Payload_Contract.yaml
│  │   ├── schema/             # Payload Schema (Locked)
│  │   │   └── PMT_Payload_Schema.yaml
│  │   └── pmt.py             # PMT Engine
│  ├── Dual-Phase/             # [engine] Dual-Phase Processing
│  │   ├── configs/            # Dual-Phase Configs
│  │   │   ├── Dual-Phase_configs.yaml
│  │   └── dual_phase.py       # Dual-Phase Engine
│  └── orchestrator.py         # Main Execution Loop  
│  
├── physio_core/                # [BODY] Biological Simulation
│  ├── configs/                # Hormone Specs & Parameters (Locked)
│  │   ├── physio_interface.yaml  # Bus bindings
│  │   └── physio_configs.yaml
│  ├── contract/               # Payload Contract (Locked)
│  │   └── physio_payload_contract.yaml
│  ├── schema/                 # Payload Schema (Locked)
│  │   └── physio_payload_schema.yaml
│  ├── logic/                  # 37 subsystem files (Locked)
│  ├── validation/             # Validation modules (Locked)
│  ├── docs/                   # Conceptual docs (Locked)
│  │   └── physio_core.md
│  ├── tests/                  # Unit tests (Locked)
│  ├── archive/                # Deprecated files
│  └── physio_core.py          # Bio-Engine
│  
├── resonance_memory_system/    # [ENCODING] Resonance Memory System
│  ├── configs/                # RMS Configs
│  │   ├── RMS_Interface.yaml  # Bus bindings
│  │   └── RMS_configs.yaml
│  ├── contract/               # RMS Payload Contract (Locked)
│  │   └── rms_payload_contract.yaml
│  ├── schema/                 # RMS Payload Schema v2 (Locked)
│  │   └── rms_payload_schema.yaml
│  ├── docs/                   # rms concept (Locked)
│  │   └── rms.md
│  ├── tests/                  # Unit tests (Locked)
│  └── rms.py           # Encoding Engine (Locked)
│  
├── eva_matrix/                # [MIND] Psychological State          
│  ├── configs/                # Matrix Configs (Locked)
│  ├── contract/               # Payload Contract (Locked)
│  │   └── matrix_payload_contract.yaml
│  ├── schema/                 # Payload Schema (Locked)
│  │   └── matrix_payload_schema.yaml
│  ├── docs/                   # matrix concept (Locked)
│  │   └── eva_matrix.md
│  ├── tests/                  # Unit tests (Locked)
│  └── eva_matrix.py    # Psyche-Engine (Locked)
│  │
├── artifact_qualia/            # [SOUL] Phenomenological Texture
│  ├── configs/                # Qualia Configs (Locked)
│  ├── contract/               # Payload Contract (Locked)
│  │   └── qualia_payload_contract.yaml
│  ├── schema/                 # Payload Schema (Locked)
│  │   └── qualia_payload_schema.yaml
│  ├── docs/                   # qualia concept (Locked)
│  │   └── artifact_qualia.md
│  ├── tests/                  # Unit tests (Locked)
│  └── artifact_qualia.py # Phenomenology-Engine (Locked)
│   
tools/                           # [tool] (query-only / stateless)
│  ├── resonance_index/          # [engine]
│  │   ├── configs/              # [configs]
│  │   ├── contracts/            # [contracts]
│  │   ├── logic/                # [logic]
│  │   ├── schemas/              # [schemas]
│  │   ├── validators/           # [validators]
│  │   └── cin.py
│  │
│  ├── resonance_impact/         # [engine]
│  │   ├── configs/              # [configs]
│  │   ├── contracts/            # [contracts]
│  │   ├── logic/                # [logic]
│  │   ├── schemas/              # [schemas]
│  │   ├── validators/           # [validators]
│  │   └── pmt.py
│  │
│  ├── agentic_rag/                        # [TOOL] Knowledge Retrieval Read-only retrieval engine (query-only / stateless)
│  │   ├── configs/                              # RAG Configs
│  │   │   ├── agentic_rag_interface.yaml
│  │   │   └── agentic_rag_configs.yaml
│  │   ├── contract/                             # Payload Contract (Locked)
│  │   │   └── agentic_rag_payload_contract.yaml
│  │   ├── schema/                               # Payload Schema (Locked)
│  │   │   └── agentic_rag_payload_schema.yaml
│  │   ├── docs/                                 # agentic_rag concept (Locked)
│  │   │   └── agentic_rag.md
│  │   ├── tests/                                # Unit tests (Locked)
│  │   └── agentic_rag.py                        # Vector Search Engine (Locked)
│  │   