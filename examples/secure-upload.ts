/**
 * @example Secure Evidence Upload and Sharing
 * @description Demonstrates the full evidence lifecycle:
 * 1. Generate an encryption key
 * 2. Encrypt evidence client-side
 * 3. Upload to the vault
 * 4. Record chain-of-custody events
 * 5. Share securely with an attorney
 * 6. Export a court-ready package
 */

import {
  Encryptor,
  VaultStore,
  ChainOfCustody,
  SecureShare,
  CourtExport,
} from '../src';

async function main() {
  // ── 1. Initialize components ─────────────────────────────────────

  const encryptor = new Encryptor();
  const vault = new VaultStore({ region: 'us-east-1', bucket: 'evidence-vault' });
  const custody = new ChainOfCustody();
  const share = new SecureShare();
  const courtExport = new CourtExport();

  // ── 2. Encrypt evidence client-side ──────────────────────────────

  // Simulate reading a file (in practice, this comes from file input)
  const evidenceData = Buffer.from('Screenshot of text messages from Jan 15, 2024');

  const encryptionKey = await encryptor.generateKey();
  const encrypted = await encryptor.encrypt(evidenceData, encryptionKey);

  console.log('Evidence encrypted client-side.');
  console.log('Plaintext hash:', encrypted.plaintextHash);
  console.log('Ciphertext hash:', encrypted.ciphertextHash);

  // ── 3. Upload to the vault ───────────────────────────────────────

  const item = await vault.store({
    caseId: 'case-2024-1234',
    type: 'text-message',
    data: encrypted.ciphertext,
    metadata: {
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      plaintextHash: encrypted.plaintextHash,
      ciphertextHash: encrypted.ciphertextHash,
      description: 'Text messages between parties — January 2024',
      evidenceDate: '2024-01-15T00:00:00Z',
    },
  });

  console.log('Evidence uploaded. Item ID:', item.id);

  // ── 4. Record chain of custody ───────────────────────────────────

  await custody.recordAccess(item.id, {
    actorId: 'user-parent-789',
    description: 'Initial upload of text message evidence',
    ipAddress: '192.168.1.100',
  });

  console.log('Custody event recorded.');

  // ── 5. Share with attorney ───────────────────────────────────────

  const link = await share.createLink({
    itemId: item.id,
    recipientEmail: 'attorney@familylaw.com',
    expiresIn: '48h',
    watermark: true,
    accessLevel: 'view',
  });

  console.log('Secure sharing link created.');
  console.log('Expires:', link.expiresAt);
  console.log('Watermarked:', link.watermarked);

  // ── 6. Export court-ready package ────────────────────────────────

  const courtPackage = await courtExport.createPackage({
    caseId: 'case-2024-1234',
    itemIds: [item.id],
    createdBy: 'attorney-456',
  });

  console.log('Court package created.');
  console.log('Package ID:', courtPackage.id);
  console.log('Items included:', courtPackage.manifest.itemCount);
  console.log('Manifest hash:', courtPackage.manifest.manifestHash);

  // Verify the package integrity
  const isValid = await courtExport.verifyPackage(courtPackage);
  console.log('Package integrity verified:', isValid);
}

main().catch(console.error);
