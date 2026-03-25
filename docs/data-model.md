# Data Model — Evidence Vault

Entity-relationship diagram showing the core data structures and their relationships.

```mermaid
erDiagram
    VaultItem {
        string id PK
        string caseId FK
        string type "text-message | email | photograph | ..."
        string description
        string storageKey
        string originalFileName
        int originalFileSize
        string mimeType
        string evidenceDate
        string uploadedAt
        string uploadedBy
        string[] tags
    }

    EncryptionMetadata {
        string itemId FK
        string algorithm "AES-256-GCM"
        string iv
        string authTag
        string plaintextHash
        string ciphertextHash
        string salt
        int iterations
    }

    CustodyEvent {
        string id PK
        string itemId FK
        string type "created | accessed | transferred | ..."
        string actorId
        string description
        string timestamp
        string ipAddress
        string userAgent
        string eventHash
        string previousHash
        json metadata
    }

    ShareLink {
        string id PK
        string itemId FK
        string token
        string recipientEmail
        string accessLevel "view | download | manage | admin"
        boolean watermarked
        string expiresAt
        string createdAt
        string createdBy
        int accessCount
        int maxAccesses
        boolean revoked
    }

    AccessLog {
        string id PK
        string actorId
        string action
        string resourceType "item | share | package | case"
        string resourceId FK
        string timestamp
        string ipAddress
        json details
    }

    CourtPackage {
        string id PK
        string caseId FK
        string[] itemIds
        string signature
        string createdAt
        string createdBy
    }

    PackageManifest {
        string packageId FK
        string version
        int itemCount
        string manifestHash
    }

    VaultItem ||--|| EncryptionMetadata : "has"
    VaultItem ||--|{ CustodyEvent : "tracked by"
    VaultItem ||--|{ ShareLink : "shared via"
    VaultItem }|--|| CourtPackage : "included in"
    CourtPackage ||--|| PackageManifest : "contains"
    CourtPackage ||--|{ CustodyEvent : "includes report"
    VaultItem ||--|{ AccessLog : "audited by"
    ShareLink ||--|{ AccessLog : "audited by"
    CourtPackage ||--|{ AccessLog : "audited by"
```

## Entity Descriptions

| Entity | Purpose |
|--------|---------|
| **VaultItem** | A single piece of evidence stored in encrypted form |
| **EncryptionMetadata** | Cryptographic parameters needed to decrypt a vault item |
| **CustodyEvent** | A tamper-evident event in the chain of custody |
| **ShareLink** | A time-limited, tokenized URL for sharing evidence |
| **AccessLog** | An audit entry recording who accessed what and when |
| **CourtPackage** | A sealed bundle of evidence prepared for court submission |
| **PackageManifest** | An integrity manifest listing items and their hashes |
