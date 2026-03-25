/**
 * @module @justice-os/evidence-vault
 * @description Privacy-first encrypted evidence storage with
 * chain-of-custody tracking and secure sharing.
 */

export { Encryptor } from './encryption/encryptor';
export type { EncryptionResult } from './encryption/encryptor';
export { KeyManager } from './encryption/key-manager';
export { IntegrityChecker } from './encryption/integrity';

export { VaultStore } from './storage/vault-store';
export type { VaultStoreConfig } from './storage/vault-store';
export { MetadataStore } from './storage/metadata-store';
export { RetentionPolicy } from './storage/retention';

export { ChainOfCustody } from './custody/chain-tracker';
export { TamperDetector } from './custody/tamper-detector';

export { SecureShare } from './sharing/secure-share';
export { Watermarker } from './sharing/watermarker';
export { CourtExport } from './sharing/court-export';

export { AccessControl } from './access/access-control';
export { AuditLogger } from './access/audit-logger';
export type { AuditEntry } from './access/audit-logger';

export type {
  VaultItem,
  EncryptionMetadata,
  CustodyEvent,
  CustodyEventType,
  ShareLink,
  AccessLevel,
  EvidenceType,
  CourtPackage,
  PackageManifest,
} from './types';
