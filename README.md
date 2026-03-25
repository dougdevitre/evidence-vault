# 🔐 Privacy-First Evidence Vault — Secure Storage for Sensitive Legal Data

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript 5.0](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg)](https://www.typescriptlang.org/)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen.svg)](CONTRIBUTING.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](https://github.com/dougdevitre/evidence-vault/pulls)

## The Problem

Sensitive legal evidence — texts, photos, recordings, documents — is stored insecurely. Parents in custody cases keep screenshots on their phones. Domestic violence survivors email evidence to themselves. Attorneys share files through unencrypted cloud storage. Chain-of-custody is broken the moment evidence leaves the device. Sharing with courts or attorneys is ad-hoc, unverifiable, and inadmissible.

## The Solution

End-to-end encrypted evidence storage with chain-of-custody tracking, access audit logs, and secure sharing with courts and attorneys. Every piece of evidence is encrypted client-side before upload, timestamped with tamper-evident hashes, and tracked through every access event.

```mermaid
graph LR
    EU[Evidence Upload] --> CSE[Client-Side Encryption<br/>AES-256-GCM]
    CSE --> ES[Encrypted Storage<br/>S3/equivalent]
    ES --> AC[Access Control<br/>Role-Based + Case-Linked]
    AC --> COC[Chain-of-Custody<br/>Logger]
    COC --> SS[Secure Share<br/>Time-Limited Links<br/>+ Watermarking]
    SS --> CE[Court Export<br/>Tamper-Evident Package]
```

## Who This Helps

- **Parents in custody cases** — securely preserve text messages, photos, and communications as evidence
- **Domestic violence survivors** — safely store evidence without risk of abuser access
- **Attorneys** — receive and manage evidence with verifiable chain-of-custody
- **Guardians ad litem** — access case evidence through controlled, audited channels
- **Court evidence officers** — receive tamper-evident evidence packages ready for proceedings

## Features

- **End-to-end encryption (AES-256-GCM)** — evidence encrypted on the client before upload; server never sees plaintext
- **Chain-of-custody tracking** — every access, transfer, and modification logged with cryptographic timestamps
- **Tamper-evident timestamps** — hash-chain verification proves evidence has not been altered since upload
- **Role-based access control** — permissions tied to case roles (attorney, judge, guardian, party)
- **Secure sharing with time-limited links** — share evidence with expiring, watermarked links
- **Court-ready evidence packages** — export tamper-evident bundles with custody logs for court proceedings
- **Complete access audit trail** — who accessed what, when, from where, and what they did with it

## Quick Start

```bash
npm install @justice-os/evidence-vault
```

```typescript
import { Encryptor, VaultStore, SecureShare } from '@justice-os/evidence-vault';

// Upload evidence with client-side encryption
const encryptor = new Encryptor();
const vault = new VaultStore({ region: 'us-east-1', bucket: 'evidence' });

const key = await encryptor.generateKey();
const encrypted = await encryptor.encrypt(fileBuffer, key);

const item = await vault.store({
  caseId: 'case-2024-1234',
  type: 'text-message',
  data: encrypted.ciphertext,
  metadata: {
    iv: encrypted.iv,
    timestamp: new Date().toISOString(),
    hash: encrypted.hash,
    description: 'Text messages from Jan 2024',
  },
});

// Share securely with attorney
const share = new SecureShare();
const link = await share.createLink({
  itemId: item.id,
  recipientEmail: 'attorney@lawfirm.com',
  expiresIn: '48h',
  watermark: true,
  accessLevel: 'view',
});
```

## Project Structure

```
src/
├── index.ts
├── encryption/
│   ├── encryptor.ts           # Encryptor — AES-256-GCM client-side
│   ├── key-manager.ts         # KeyManager — key derivation, rotation
│   └── integrity.ts           # IntegrityChecker — hash verification
├── storage/
│   ├── vault-store.ts         # VaultStore — encrypted CRUD
│   ├── metadata-store.ts      # MetadataStore — searchable metadata
│   └── retention.ts           # RetentionPolicy — auto-deletion rules
├── custody/
│   ├── chain-tracker.ts       # ChainOfCustody — every access logged
│   └── tamper-detector.ts     # TamperDetector — integrity validation
├── sharing/
│   ├── secure-share.ts        # SecureShare — time-limited links
│   ├── watermarker.ts         # Watermarker — invisible watermarks
│   └── court-export.ts        # CourtExport — tamper-evident packages
├── access/
│   ├── access-control.ts      # AccessControl — role + case based
│   └── audit-logger.ts        # AuditLogger — all access events
└── types/
    └── index.ts
```

## Roadmap

- [ ] Zero-knowledge proof of evidence existence without revealing contents
- [ ] Mobile app for on-device evidence capture with automatic encryption
- [ ] Integration with court e-filing systems for direct submission
- [ ] Multi-party key sharing for collaborative case access
- [ ] Automated retention policy enforcement with legal hold support
- [ ] Blockchain-anchored timestamps for independent verification

---

## Justice OS Ecosystem

This repository is part of the **Justice OS** open-source ecosystem — 22 interconnected projects building the infrastructure for accessible justice technology.

### Core System Layer
| Repository | Description |
|-----------|-------------|
| [justice-os](https://github.com/dougdevitre/justice-os) | Core modular platform — the foundation |
| [justice-api-gateway](https://github.com/dougdevitre/justice-api-gateway) | Interoperability layer for courts |
| [legal-identity-layer](https://github.com/dougdevitre/legal-identity-layer) | Universal legal identity and auth |

### User Experience Layer
| Repository | Description |
|-----------|-------------|
| [justice-navigator](https://github.com/dougdevitre/justice-navigator) | Google Maps for legal problems |
| [mobile-court-access](https://github.com/dougdevitre/mobile-court-access) | Mobile-first court access kit |
| [cognitive-load-ui](https://github.com/dougdevitre/cognitive-load-ui) | Design system for stressed users |
| [multilingual-justice](https://github.com/dougdevitre/multilingual-justice) | Real-time legal translation |

### AI + Intelligence Layer
| Repository | Description |
|-----------|-------------|
| [vetted-legal-ai](https://github.com/dougdevitre/vetted-legal-ai) | RAG engine with citation validation |
| [justice-knowledge-graph](https://github.com/dougdevitre/justice-knowledge-graph) | Open data layer for laws and procedures |
| [legal-ai-guardrails](https://github.com/dougdevitre/legal-ai-guardrails) | AI safety SDK for justice use |

### Infrastructure + Trust Layer
| Repository | Description |
|-----------|-------------|
| [evidence-vault](https://github.com/dougdevitre/evidence-vault) | Privacy-first secure evidence storage |
| [court-notification-engine](https://github.com/dougdevitre/court-notification-engine) | Smart deadline and hearing alerts |
| [justice-analytics](https://github.com/dougdevitre/justice-analytics) | Bias detection and disparity dashboards |
| [evidence-timeline](https://github.com/dougdevitre/evidence-timeline) | Evidence timeline builder |

### Tools + Automation Layer
| Repository | Description |
|-----------|-------------|
| [court-doc-engine](https://github.com/dougdevitre/court-doc-engine) | TurboTax for legal filings |
| [justice-workflow-engine](https://github.com/dougdevitre/justice-workflow-engine) | Zapier for legal processes |
| [pro-se-toolkit](https://github.com/dougdevitre/pro-se-toolkit) | Self-represented litigant tools |
| [justice-score-engine](https://github.com/dougdevitre/justice-score-engine) | Access-to-justice measurement |

### Adoption Layer
| Repository | Description |
|-----------|-------------|
| [digital-literacy-sim](https://github.com/dougdevitre/digital-literacy-sim) | Digital literacy simulator |
| [legal-resource-discovery](https://github.com/dougdevitre/legal-resource-discovery) | Find the right help instantly |
| [court-simulation-sandbox](https://github.com/dougdevitre/court-simulation-sandbox) | Practice before the real thing |
| [justice-components](https://github.com/dougdevitre/justice-components) | Reusable component library |

> Built with purpose. Open by design. Justice for all.
