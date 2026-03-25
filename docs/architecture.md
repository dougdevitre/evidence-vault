# Evidence Vault — Architecture

## Overview

The Evidence Vault uses a defense-in-depth architecture: client-side encryption ensures the server never sees plaintext, chain-of-custody tracking records every access event, and tamper-evident hashing proves integrity. The system is designed so that no single compromise can expose evidence.

## 1. Encryption Flow

```mermaid
sequenceDiagram
    participant U as User Client
    participant E as Encryptor
    participant KM as Key Manager
    participant S as Vault Store
    participant M as Metadata Store

    U->>KM: deriveKey(userPassword, salt)
    KM-->>U: encryptionKey

    U->>E: encrypt(evidence, key)
    E->>E: Generate IV (96-bit)
    E->>E: AES-256-GCM encrypt
    E->>E: Compute SHA-256 hash
    E-->>U: { ciphertext, iv, authTag, hash }

    U->>S: store(ciphertext)
    S-->>U: storageId

    U->>M: store({ storageId, iv, hash, metadata })
    M-->>U: itemId
```

## 2. Storage Architecture

```mermaid
graph TB
    subgraph ClientSide["Client Side"]
        EC[Encryptor<br/>AES-256-GCM]
        IC[Integrity Checker<br/>SHA-256]
    end

    subgraph ServerSide["Server Side"]
        VS[Vault Store<br/>Encrypted Blobs]
        MS[Metadata Store<br/>Searchable Index]
        RP[Retention Policy<br/>Auto-Deletion]
    end

    subgraph Storage["Storage Backend"]
        S3[S3 / Object Store<br/>Encrypted at Rest]
        DB[DynamoDB / Postgres<br/>Metadata Only]
    end

    EC --> VS
    IC --> VS
    VS --> S3
    MS --> DB
    RP --> VS
    RP --> MS
```

## 3. Chain-of-Custody Model

```mermaid
graph LR
    subgraph Events["Custody Events"]
        CR[Created]
        AC[Accessed]
        TR[Transferred]
        SH[Shared]
        EX[Exported]
        DL[Deleted]
    end

    Events --> CT[Chain Tracker]
    CT --> CL[Custody Log<br/>Append-Only]

    CL --> HV[Hash Verification<br/>Each entry hashes<br/>previous entry]

    subgraph Verification
        TD[Tamper Detector]
        IV[Integrity Validator]
    end

    CL --> Verification

    Verification --> REP[Custody Report<br/>Court-Ready]
```

## 4. Secure Sharing Flow

```mermaid
sequenceDiagram
    participant O as Owner
    participant SS as Secure Share
    participant WM as Watermarker
    participant R as Recipient
    participant AL as Audit Logger

    O->>SS: createLink({ itemId, recipient, expiry })
    SS->>SS: Generate token + expiry
    SS->>AL: log(share_created)
    SS-->>O: shareLink

    O->>R: Send link (out-of-band)

    R->>SS: accessLink(token)
    SS->>SS: Validate token + expiry
    SS->>AL: log(share_accessed)
    SS->>WM: addWatermark(evidence, recipientId)
    WM-->>R: Watermarked evidence (view only)
```

## 5. Court Export Pipeline

```mermaid
graph TB
    subgraph Input
        EV[Evidence Items]
        CL[Custody Logs]
        AM[Access Metadata]
    end

    Input --> CE[Court Export Engine]

    subgraph Package["Tamper-Evident Package"]
        MF[Manifest<br/>Item list + hashes]
        EF[Evidence Files<br/>Decrypted copies]
        CR[Custody Report<br/>Full chain]
        TS[Timestamps<br/>Cryptographic proofs]
        SIG[Digital Signature<br/>Package integrity]
    end

    CE --> Package
    Package --> ZIP[Sealed Archive<br/>.zip with checksum]
    ZIP --> COURT[Court E-Filing System]
```

## Key Design Decisions

1. **Client-side encryption** — the server never has access to plaintext evidence or encryption keys, protecting against server-side breaches.
2. **Hash-chain custody log** — each custody event includes the hash of the previous event, making tampering detectable without blockchain overhead.
3. **Separation of data and metadata** — encrypted blobs and searchable metadata are stored in different systems, so metadata queries never touch evidence data.
4. **Watermarked sharing** — shared evidence includes invisible watermarks tied to the recipient, enabling leak tracing.
5. **Court-ready export** — the export pipeline produces self-contained, tamper-evident packages that satisfy evidence admission requirements.
