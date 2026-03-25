/**
 * @module SecureShare Tests
 * @description Tests for SecureShare — link creation,
 * validation, revocation, and expiry.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SecureShare } from '../src/sharing/secure-share';

describe('SecureShare', () => {
  let share: SecureShare;

  beforeEach(() => {
    share = new SecureShare();
  });

  describe('createLink', () => {
    it('should create a sharing link with a token', async () => {
      const link = await share.createLink({
        itemId: 'item-123',
        recipientEmail: 'attorney@firm.com',
        expiresIn: '48h',
        watermark: true,
      });

      expect(link.token).toBeTruthy();
      expect(link.itemId).toBe('item-123');
      expect(link.recipientEmail).toBe('attorney@firm.com');
      expect(link.watermarked).toBe(true);
      expect(link.revoked).toBe(false);
    });

    it('should set default access level to view', async () => {
      const link = await share.createLink({
        itemId: 'item-123',
        recipientEmail: 'test@test.com',
        expiresIn: '24h',
      });

      expect(link.accessLevel).toBe('view');
    });

    it('should set expiration based on expiresIn', async () => {
      const before = Date.now();
      const link = await share.createLink({
        itemId: 'item-123',
        recipientEmail: 'test@test.com',
        expiresIn: '1h',
      });

      const expiresAt = new Date(link.expiresAt).getTime();
      const expectedMin = before + 3_600_000 - 1000;
      const expectedMax = before + 3_600_000 + 5000;
      expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt).toBeLessThanOrEqual(expectedMax);
    });
  });

  describe('revokeLink', () => {
    it('should mark a link as revoked', async () => {
      const link = await share.createLink({
        itemId: 'item-123',
        recipientEmail: 'test@test.com',
        expiresIn: '48h',
      });

      await share.revokeLink(link.id);

      const resolved = await share.resolveToken(link.token);
      expect(resolved).toBeNull();
    });
  });

  describe('validateAccess', () => {
    it('should return true for a valid, non-expired link', async () => {
      const link = await share.createLink({
        itemId: 'item-123',
        recipientEmail: 'test@test.com',
        expiresIn: '1h',
      });

      const isValid = await share.validateAccess(link.token);
      expect(isValid).toBe(true);
    });

    it('should return false for a revoked link', async () => {
      const link = await share.createLink({
        itemId: 'item-123',
        recipientEmail: 'test@test.com',
        expiresIn: '1h',
      });

      await share.revokeLink(link.id);
      const isValid = await share.validateAccess(link.token);
      expect(isValid).toBe(false);
    });

    it('should return false for an unknown token', async () => {
      const isValid = await share.validateAccess('unknown-token');
      expect(isValid).toBe(false);
    });
  });

  describe('resolveToken', () => {
    it('should return the link for a valid token', async () => {
      const link = await share.createLink({
        itemId: 'item-123',
        recipientEmail: 'test@test.com',
        expiresIn: '1h',
      });

      const resolved = await share.resolveToken(link.token);
      expect(resolved?.id).toBe(link.id);
    });

    it('should return null for a revoked token', async () => {
      const link = await share.createLink({
        itemId: 'item-123',
        recipientEmail: 'test@test.com',
        expiresIn: '1h',
      });

      await share.revokeLink(link.id);
      const resolved = await share.resolveToken(link.token);
      expect(resolved).toBeNull();
    });
  });
});
