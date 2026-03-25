/**
 * @module ChainOfCustody Tests
 * @description Tests for the ChainOfCustody — recording access
 * and transfer events, hash chain verification.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ChainOfCustody } from '../src/custody/chain-tracker';

describe('ChainOfCustody', () => {
  let custody: ChainOfCustody;

  beforeEach(() => {
    custody = new ChainOfCustody();
  });

  describe('recordAccess', () => {
    it('should record an access event and return it', async () => {
      const event = await custody.recordAccess('item-123', {
        actorId: 'user-456',
        description: 'Viewed document',
      });

      expect(event.itemId).toBe('item-123');
      expect(event.type).toBe('accessed');
      expect(event.actorId).toBe('user-456');
      expect(event.timestamp).toBeTruthy();
    });

    it('should link events via previousHash', async () => {
      const event1 = await custody.recordAccess('item-123', {
        actorId: 'user-1',
        description: 'First access',
      });
      const event2 = await custody.recordAccess('item-123', {
        actorId: 'user-2',
        description: 'Second access',
      });

      expect(event2.previousHash).toBe(event1.eventHash);
    });

    it('should set previousHash to "0" for the first event', async () => {
      const event = await custody.recordAccess('item-new', {
        actorId: 'user-1',
        description: 'First event',
      });

      expect(event.previousHash).toBe('0');
    });
  });

  describe('recordTransfer', () => {
    it('should record a transfer event with recipient info', async () => {
      const event = await custody.recordTransfer('item-123', {
        actorId: 'user-sender',
        description: 'Transferred to opposing counsel',
        recipientId: 'user-recipient',
      });

      expect(event.type).toBe('transferred');
      expect(event.metadata?.recipientId).toBe('user-recipient');
    });
  });

  describe('getHistory', () => {
    it('should return empty array for items with no events', async () => {
      const history = await custody.getHistory('nonexistent');
      expect(history).toEqual([]);
    });

    it('should return all events in chronological order', async () => {
      await custody.recordAccess('item-123', { actorId: 'user-1', description: 'View' });
      await custody.recordAccess('item-123', { actorId: 'user-2', description: 'Download' });
      await custody.recordTransfer('item-123', {
        actorId: 'user-1',
        description: 'Transfer',
        recipientId: 'user-3',
      });

      const history = await custody.getHistory('item-123');
      expect(history).toHaveLength(3);
      expect(history[0].type).toBe('accessed');
      expect(history[2].type).toBe('transferred');
    });
  });

  describe('verify', () => {
    it('should return true for an empty chain', async () => {
      const valid = await custody.verify('nonexistent');
      expect(valid).toBe(true);
    });

    it('should return true for a valid chain', async () => {
      await custody.recordAccess('item-123', { actorId: 'user-1', description: 'View' });
      await custody.recordAccess('item-123', { actorId: 'user-2', description: 'Download' });

      const valid = await custody.verify('item-123');
      expect(valid).toBe(true);
    });

    it('should detect hash chain tampering', async () => {
      // TODO: Test by modifying an event's hash and verifying detection
    });
  });
});
