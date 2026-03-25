/**
 * @module Encryptor Tests
 * @description Tests for the Encryptor — AES-256-GCM encryption,
 * decryption, key generation, and key derivation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Encryptor } from '../src/encryption/encryptor';

describe('Encryptor', () => {
  let encryptor: Encryptor;

  beforeEach(() => {
    encryptor = new Encryptor();
  });

  describe('generateKey', () => {
    it('should generate a 32-byte (256-bit) key', async () => {
      const key = await encryptor.generateKey();
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    it('should generate unique keys each time', async () => {
      const key1 = await encryptor.generateKey();
      const key2 = await encryptor.generateKey();
      expect(key1.equals(key2)).toBe(false);
    });
  });

  describe('encrypt', () => {
    it('should encrypt data and return ciphertext with metadata', async () => {
      const key = await encryptor.generateKey();
      const plaintext = Buffer.from('Confidential evidence data');
      const result = await encryptor.encrypt(plaintext, key);

      expect(result.ciphertext).toBeInstanceOf(Buffer);
      expect(result.ciphertext.length).toBeGreaterThan(0);
      expect(result.iv).toBeTruthy();
      expect(result.authTag).toBeTruthy();
      expect(result.plaintextHash).toBeTruthy();
      expect(result.ciphertextHash).toBeTruthy();
    });

    it('should produce different ciphertext for the same plaintext (due to random IV)', async () => {
      const key = await encryptor.generateKey();
      const plaintext = Buffer.from('Same data');
      const result1 = await encryptor.encrypt(plaintext, key);
      const result2 = await encryptor.encrypt(plaintext, key);

      expect(result1.iv).not.toBe(result2.iv);
    });
  });

  describe('decrypt', () => {
    it('should decrypt ciphertext back to the original plaintext', async () => {
      const key = await encryptor.generateKey();
      const original = Buffer.from('Evidence text messages from January 2024');
      const encrypted = await encryptor.encrypt(original, key);
      const decrypted = await encryptor.decrypt(encrypted.ciphertext, key, encrypted.iv, encrypted.authTag);

      expect(decrypted.equals(original)).toBe(true);
    });

    it('should fail to decrypt with the wrong key', async () => {
      const key1 = await encryptor.generateKey();
      const key2 = await encryptor.generateKey();
      const encrypted = await encryptor.encrypt(Buffer.from('secret'), key1);

      await expect(
        encryptor.decrypt(encrypted.ciphertext, key2, encrypted.iv, encrypted.authTag),
      ).rejects.toThrow();
    });

    it('should fail to decrypt with a tampered auth tag', async () => {
      const key = await encryptor.generateKey();
      const encrypted = await encryptor.encrypt(Buffer.from('secret'), key);
      const badAuthTag = 'tampered-auth-tag';

      await expect(
        encryptor.decrypt(encrypted.ciphertext, key, encrypted.iv, badAuthTag),
      ).rejects.toThrow();
    });
  });

  describe('deriveKey', () => {
    it('should derive a consistent key from the same password and salt', async () => {
      const salt = Buffer.from('test-salt-16bytes');
      const key1 = await encryptor.deriveKey('my-password', salt, 1000);
      const key2 = await encryptor.deriveKey('my-password', salt, 1000);

      expect(key1.equals(key2)).toBe(true);
    });

    it('should derive different keys for different passwords', async () => {
      const salt = Buffer.from('test-salt-16bytes');
      const key1 = await encryptor.deriveKey('password-1', salt, 1000);
      const key2 = await encryptor.deriveKey('password-2', salt, 1000);

      expect(key1.equals(key2)).toBe(false);
    });
  });
});
