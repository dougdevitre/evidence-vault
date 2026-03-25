/**
 * @module @justice-os/evidence-vault/types
 * @description Core type definitions for the Evidence Vault.
 * Defines the shape of vault items, encryption metadata,
 * custody events, share links, and court packages.
 */

/** Types of custody events tracked in the chain */
export type CustodyEventType =
  | 'created'
  | 'accessed'
  | 'downloaded'
  | 'transferred'
  | 'shared'
  | 'exported'
  | 'modified'
  | 'deleted'
  | 'key_rotated';

/** Access levels for vault items */
export type AccessLevel = 'view' | 'download' | 'manage' | 'admin';

/** Supported evidence types */
export type EvidenceType =
  | 'text-message'
  | 'email'
  | 'photograph'
  | 'video'
  | 'audio-recording'
  | 'document'
  | 'screenshot'
  | 'social-media'
  | 'financial-record'
  | 'other';

/**
 * Metadata about the encryption applied to a vault item.
 * Stored separately from the encrypted data itself.
 */
export interface EncryptionMetadata {
  /** Encryption algorithm used */
  algorithm: 'AES-256-GCM';
  /** Initialization vector (base64-encoded) */
  iv: string;
  /** Authentication tag (base64-encoded) */
  authTag: string;
  /** SHA-256 hash of the plaintext (for integrity verification) */
  plaintextHash: string;
  /** SHA-256 hash of the ciphertext (for storage verification) */
  ciphertextHash: string;
  /** Key derivation salt if password-based (base64-encoded) */
  salt?: string;
  /** Key derivation iteration count */
  iterations?: number;
}

/**
 * A single item stored in the evidence vault.
 */
export interface VaultItem {
  /** Unique identifier for this item */
  id: string;
  /** ID of the case this evidence belongs to */
  caseId: string;
  /** Type of evidence */
  type: EvidenceType;
  /** Human-readable description */
  description: string;
  /** Reference to the encrypted blob in storage */
  storageKey: string;
  /** Encryption metadata needed for decryption */
  encryption: EncryptionMetadata;
  /** Original file name */
  originalFileName?: string;
  /** Original file size in bytes */
  originalFileSize?: number;
  /** MIME type of the original file */
  mimeType?: string;
  /** ISO timestamp when the evidence was captured/created */
  evidenceDate: string;
  /** ISO timestamp when uploaded to the vault */
  uploadedAt: string;
  /** ID of the user who uploaded this item */
  uploadedBy: string;
  /** Custom metadata tags */
  tags: string[];
}

/**
 * A single event in the chain of custody for a vault item.
 * Each event contains the hash of the previous event, forming a tamper-evident chain.
 */
export interface CustodyEvent {
  /** Unique event identifier */
  id: string;
  /** ID of the vault item this event belongs to */
  itemId: string;
  /** Type of custody event */
  type: CustodyEventType;
  /** ID of the user or system that performed the action */
  actorId: string;
  /** Human-readable description of what happened */
  description: string;
  /** ISO timestamp of the event */
  timestamp: string;
  /** IP address of the actor (if available) */
  ipAddress?: string;
  /** User agent string (if available) */
  userAgent?: string;
  /** Hash of this event's data */
  eventHash: string;
  /** Hash of the previous event in the chain */
  previousHash: string;
  /** Additional event-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * A time-limited, secure sharing link for a vault item.
 */
export interface ShareLink {
  /** Unique link identifier */
  id: string;
  /** ID of the vault item being shared */
  itemId: string;
  /** Access token embedded in the URL */
  token: string;
  /** Email address of the intended recipient */
  recipientEmail: string;
  /** What the recipient can do */
  accessLevel: AccessLevel;
  /** Whether the shared view includes an invisible watermark */
  watermarked: boolean;
  /** ISO timestamp when the link expires */
  expiresAt: string;
  /** ISO timestamp when the link was created */
  createdAt: string;
  /** ID of the user who created the link */
  createdBy: string;
  /** Number of times the link has been accessed */
  accessCount: number;
  /** Maximum allowed accesses (null = unlimited) */
  maxAccesses?: number;
  /** Whether the link has been revoked */
  revoked: boolean;
}

/**
 * A tamper-evident package of evidence prepared for court submission.
 */
export interface CourtPackage {
  /** Unique package identifier */
  id: string;
  /** ID of the case this package is for */
  caseId: string;
  /** IDs of the vault items included */
  itemIds: string[];
  /** Manifest with item metadata and hashes */
  manifest: PackageManifest;
  /** Complete custody chain for all included items */
  custodyReport: CustodyEvent[];
  /** Digital signature of the package contents */
  signature: string;
  /** ISO timestamp when the package was created */
  createdAt: string;
  /** ID of the user who created the package */
  createdBy: string;
}

/**
 * Manifest included in a court package, listing all items and their integrity hashes.
 */
export interface PackageManifest {
  /** Package version identifier */
  version: string;
  /** Total number of items in the package */
  itemCount: number;
  /** List of items with their hashes */
  items: Array<{
    itemId: string;
    fileName: string;
    hash: string;
    type: EvidenceType;
    evidenceDate: string;
  }>;
  /** SHA-256 hash of the entire manifest */
  manifestHash: string;
}
