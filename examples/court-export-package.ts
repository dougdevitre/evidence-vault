/**
 * @example Court Export Package
 * @description Demonstrates creating a tamper-evident evidence package
 * for court submission. The package includes evidence files, complete
 * custody chains, a manifest, and a digital signature.
 *
 * This example covers:
 * - Selecting evidence items for a case
 * - Generating a package manifest with integrity hashes
 * - Signing the package digitally
 * - Verifying the package before submission
 */

import {
  VaultStore,
  CourtExport,
  ChainOfCustody,
  IntegrityChecker,
  AuditLogger,
} from '../src';

async function main() {
  // ── 1. Initialize components ─────────────────────────────────────

  const vault = new VaultStore({ region: 'us-east-1', bucket: 'evidence-vault' });
  const courtExport = new CourtExport();
  const custody = new ChainOfCustody();
  const integrity = new IntegrityChecker();
  const audit = new AuditLogger();

  const caseId = 'case-2024-5555';
  const attorneyId = 'attorney-kim-789';
  const evidenceItems = ['item-texts-001', 'item-photo-002', 'item-email-003'];

  console.log('=== Court Export Package Builder ===\n');

  // ── 2. Verify evidence integrity before packaging ────────────────

  console.log('Verifying evidence integrity...');
  for (const itemId of evidenceItems) {
    const metadata = await vault.getMetadata(itemId);
    if (!metadata) {
      console.error(`Item ${itemId} not found in vault!`);
      return;
    }

    const data = await vault.retrieve(itemId);
    const hashValid = await integrity.verify(data, metadata.encryption.ciphertextHash);
    console.log(`  ${itemId}: ${hashValid ? 'PASS' : 'FAIL'}`);

    if (!hashValid) {
      console.error('INTEGRITY CHECK FAILED — aborting package creation.');
      return;
    }
  }

  // ── 3. Verify custody chain integrity ────────────────────────────

  console.log('\nVerifying custody chains...');
  for (const itemId of evidenceItems) {
    const history = await custody.getHistory(itemId);
    const chainValid = await custody.verify(itemId);
    console.log(`  ${itemId}: ${chainValid ? 'PASS' : 'FAIL'} (${history.length} events)`);
  }

  // ── 4. Create the court package ──────────────────────────────────

  console.log('\nCreating court package...');
  const courtPackage = await courtExport.createPackage({
    caseId,
    itemIds: evidenceItems,
    createdBy: attorneyId,
  });

  console.log('Package created:');
  console.log('  Package ID:', courtPackage.id);
  console.log('  Case ID:', courtPackage.caseId);
  console.log('  Items included:', courtPackage.manifest.itemCount);
  console.log('  Manifest hash:', courtPackage.manifest.manifestHash);
  console.log('  Signature:', courtPackage.signature.substring(0, 20) + '...');
  console.log('  Created at:', courtPackage.createdAt);

  // ── 5. Verify the package ────────────────────────────────────────

  console.log('\nVerifying package integrity...');
  const packageValid = await courtExport.verifyPackage(courtPackage);
  console.log('Package verification:', packageValid ? 'PASS' : 'FAIL');

  // ── 6. Log the export ────────────────────────────────────────────

  await audit.logExport(attorneyId, courtPackage.id, {
    caseId,
    itemCount: evidenceItems.length,
    manifestHash: courtPackage.manifest.manifestHash,
  });

  console.log('\nExport logged in audit trail.');
  console.log('Package is ready for court submission.');
}

main().catch(console.error);
