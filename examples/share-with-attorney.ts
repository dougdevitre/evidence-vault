/**
 * @example Share Evidence with Attorney
 * @description Demonstrates how to securely share vault evidence
 * with an attorney via a time-limited, watermarked link.
 *
 * This example covers:
 * - Looking up evidence by case ID
 * - Creating a time-limited sharing link with watermarking
 * - Validating the link before granting access
 * - Revoking access after the attorney has reviewed
 */

import {
  VaultStore,
  SecureShare,
  Watermarker,
  AuditLogger,
  AccessControl,
} from '../src';

async function main() {
  // ── 1. Initialize components ─────────────────────────────────────

  const vault = new VaultStore({ region: 'us-east-1', bucket: 'evidence-vault' });
  const share = new SecureShare();
  const watermarker = new Watermarker();
  const audit = new AuditLogger();
  const access = new AccessControl();

  const caseId = 'case-2024-7890';
  const itemId = 'item-evidence-001';
  const attorneyEmail = 'j.martinez@familylaw.com';
  const attorneyId = 'attorney-martinez-456';

  // ── 2. Verify the attorney has case access ───────────────────────

  const hasAccess = await access.checkAccess(attorneyId, itemId, 'view');
  if (!hasAccess) {
    console.log('Attorney does not have access. Granting view access...');
    await access.grantAccess(attorneyId, caseId, 'view');
  }

  // ── 3. Create a watermarked sharing link ─────────────────────────

  const link = await share.createLink({
    itemId,
    recipientEmail: attorneyEmail,
    expiresIn: '48h',
    watermark: true,
    accessLevel: 'view',
    maxAccesses: 5,
  });

  console.log('Secure sharing link created:');
  console.log('  Link ID:', link.id);
  console.log('  Token:', link.token);
  console.log('  Expires:', link.expiresAt);
  console.log('  Watermarked:', link.watermarked);
  console.log('  Max accesses:', link.maxAccesses);

  // Log the share event
  await audit.logShare(attorneyId, link.id, {
    recipientEmail: attorneyEmail,
    expiresAt: link.expiresAt,
    accessLevel: 'view',
  });

  // ── 4. Simulate attorney accessing the link ─────────────────────

  const isValid = await share.validateAccess(link.token);
  console.log('\nLink validation:', isValid ? 'VALID' : 'INVALID');

  if (isValid) {
    // Retrieve and watermark the evidence
    const encryptedData = await vault.retrieve(itemId);
    const watermarked = await watermarker.apply(encryptedData, attorneyId, 'image/png');
    console.log('Evidence retrieved and watermarked for attorney.');

    // Log the access event
    await audit.logAccess(attorneyId, itemId, {
      action: 'view',
      viaShareLink: link.id,
    });
  }

  // ── 5. Revoke access after review ────────────────────────────────

  console.log('\nRevoking sharing link...');
  await share.revokeLink(link.id);
  console.log('Link revoked. Attorney can no longer access via this link.');

  // Verify the link is now invalid
  const isStillValid = await share.validateAccess(link.token);
  console.log('Post-revocation validation:', isStillValid ? 'VALID' : 'INVALID');
}

main().catch(console.error);
