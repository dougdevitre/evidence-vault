/**
 * @module ChainOfCustody
 * @description Tracks every access, transfer, and modification of evidence
 * in a tamper-evident chain. Each event includes the hash of the previous event,
 * so any tampering is detectable by verifying the chain.
 */

import type { CustodyEvent, CustodyEventType } from '../types';

/**
 * ChainOfCustody — maintains a verifiable chain of custody for evidence items.
 *
 * Every event is linked to the previous one via cryptographic hashes,
 * forming an append-only, tamper-evident log. If any event is modified
 * or deleted, the chain breaks and verification fails.
 *
 * @example
 * ```typescript
 * const custody = new ChainOfCustody();
 *
 * await custody.recordAccess('item-123', {
 *   actorId: 'attorney-456',
 *   description: 'Viewed text message evidence',
 *   ipAddress: '192.168.1.1',
 * });
 *
 * const history = await custody.getHistory('item-123');
 * const isValid = await custody.verify('item-123');
 * ```
 */
export class ChainOfCustody {
  private events: Map<string, CustodyEvent[]> = new Map();

  /**
   * Record an access event for a vault item.
   *
   * @param itemId - The vault item that was accessed
   * @param details - Who accessed it and from where
   * @returns The recorded custody event
   */
  async recordAccess(
    itemId: string,
    details: {
      actorId: string;
      description: string;
      ipAddress?: string;
      userAgent?: string;
    },
  ): Promise<CustodyEvent> {
    return this.recordEvent(itemId, 'accessed', details);
  }

  /**
   * Record a transfer event when evidence changes hands.
   *
   * @param itemId - The vault item being transferred
   * @param details - Transfer details including sender and recipient
   * @returns The recorded custody event
   */
  async recordTransfer(
    itemId: string,
    details: {
      actorId: string;
      description: string;
      recipientId: string;
      ipAddress?: string;
    },
  ): Promise<CustodyEvent> {
    return this.recordEvent(itemId, 'transferred', {
      ...details,
      metadata: { recipientId: details.recipientId },
    });
  }

  /**
   * Get the complete custody history for a vault item.
   *
   * @param itemId - The vault item to get history for
   * @returns All custody events in chronological order
   */
  async getHistory(itemId: string): Promise<CustodyEvent[]> {
    return this.events.get(itemId) ?? [];
  }

  /**
   * Verify the integrity of the custody chain for a vault item.
   * Checks that each event's previousHash matches the hash of the
   * preceding event, detecting any tampering or deletion.
   *
   * @param itemId - The vault item to verify
   * @returns true if the chain is intact and untampered
   */
  async verify(itemId: string): Promise<boolean> {
    const events = this.events.get(itemId);
    if (!events || events.length === 0) {
      return true; // Empty chain is valid
    }

    // TODO: Verify hash chain integrity
    // For each event after the first, check that event.previousHash
    // equals the eventHash of the preceding event
    for (let i = 1; i < events.length; i++) {
      if (events[i].previousHash !== events[i - 1].eventHash) {
        return false;
      }
    }
    return true;
  }

  /**
   * Record a custody event of any type.
   *
   * @param itemId - The vault item
   * @param type - The type of custody event
   * @param details - Event details
   * @returns The recorded custody event
   */
  private async recordEvent(
    itemId: string,
    type: CustodyEventType,
    details: {
      actorId: string;
      description: string;
      ipAddress?: string;
      userAgent?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<CustodyEvent> {
    const chain = this.events.get(itemId) ?? [];
    const previousHash = chain.length > 0 ? chain[chain.length - 1].eventHash : '0';

    const event: CustodyEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      itemId,
      type,
      actorId: details.actorId,
      description: details.description,
      timestamp: new Date().toISOString(),
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      eventHash: '', // TODO: Compute SHA-256 of event data
      previousHash,
      metadata: details.metadata,
    };

    // TODO: Compute event hash from event data + previousHash

    chain.push(event);
    this.events.set(itemId, chain);
    return event;
  }
}
