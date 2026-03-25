/**
 * @module AuditLogger
 * @description Logs all access events for compliance and forensics.
 * Every vault operation — read, write, share, export — is recorded
 * in an append-only, tamper-evident audit log.
 */

/** A single audit log entry */
export interface AuditEntry {
  /** Unique entry identifier */
  id: string;
  /** ISO timestamp of the event */
  timestamp: string;
  /** ID of the user or system that performed the action */
  actorId: string;
  /** The action performed */
  action: string;
  /** Type of resource affected */
  resourceType: 'item' | 'share' | 'package' | 'case';
  /** ID of the affected resource */
  resourceId: string;
  /** Additional event details */
  details: Record<string, unknown>;
  /** IP address of the actor */
  ipAddress?: string;
}

/** Parameters for querying audit logs */
export interface AuditQueryParams {
  /** Filter by actor ID */
  actorId?: string;
  /** Filter by resource ID */
  resourceId?: string;
  /** Filter by action type */
  action?: string;
  /** Filter events after this ISO timestamp */
  since?: string;
  /** Filter events before this ISO timestamp */
  until?: string;
  /** Maximum results to return */
  limit?: number;
}

/**
 * AuditLogger — records all vault access events in an append-only log.
 *
 * Provides specialized logging methods for common operations
 * (access, share, export) and a general query interface for
 * compliance reporting and forensic analysis.
 *
 * @example
 * ```typescript
 * const logger = new AuditLogger();
 * await logger.logAccess('user-123', 'item-456', { action: 'download' });
 * const events = await logger.query({ actorId: 'user-123', since: '2024-01-01' });
 * ```
 */
export class AuditLogger {
  private entries: AuditEntry[] = [];

  /**
   * Log a generic audit event.
   *
   * @param entry - The event data (id and timestamp are auto-generated)
   * @returns The complete audit entry with generated fields
   */
  async log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
    const full: AuditEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.entries.push(full);
    // TODO: Persist to append-only audit store
    throw new Error('Not implemented');
  }

  /**
   * Log an evidence access event (view, download).
   *
   * @param actorId - Who accessed the evidence
   * @param itemId - Which item was accessed
   * @param details - Access details (action, IP, etc.)
   */
  async logAccess(actorId: string, itemId: string, details: Record<string, unknown> = {}): Promise<AuditEntry> {
    return this.log({
      actorId,
      action: 'access',
      resourceType: 'item',
      resourceId: itemId,
      details,
    });
  }

  /**
   * Log a sharing event (link created, link revoked).
   *
   * @param actorId - Who shared the evidence
   * @param shareId - The share link ID
   * @param details - Share details (recipient, expiry, etc.)
   */
  async logShare(actorId: string, shareId: string, details: Record<string, unknown> = {}): Promise<AuditEntry> {
    return this.log({
      actorId,
      action: 'share',
      resourceType: 'share',
      resourceId: shareId,
      details,
    });
  }

  /**
   * Log a court export event (package created).
   *
   * @param actorId - Who created the export
   * @param packageId - The court package ID
   * @param details - Export details (items included, etc.)
   */
  async logExport(actorId: string, packageId: string, details: Record<string, unknown> = {}): Promise<AuditEntry> {
    return this.log({
      actorId,
      action: 'export',
      resourceType: 'package',
      resourceId: packageId,
      details,
    });
  }

  /**
   * Query audit logs with flexible filtering.
   *
   * @param params - Query parameters (actor, resource, action, time range)
   * @returns Matching audit entries, sorted by timestamp descending
   */
  async query(params: AuditQueryParams): Promise<AuditEntry[]> {
    let results = [...this.entries];

    if (params.actorId) results = results.filter((e) => e.actorId === params.actorId);
    if (params.resourceId) results = results.filter((e) => e.resourceId === params.resourceId);
    if (params.action) results = results.filter((e) => e.action === params.action);
    if (params.since) results = results.filter((e) => e.timestamp >= params.since!);
    if (params.until) results = results.filter((e) => e.timestamp <= params.until!);

    results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    if (params.limit) results = results.slice(0, params.limit);

    return results;
  }

  /**
   * Export the audit log for a specific resource or time period.
   *
   * @param params - Export filter parameters
   * @returns JSON string of matching audit entries
   */
  async exportLog(params: AuditQueryParams): Promise<string> {
    const entries = await this.query(params);
    return JSON.stringify(entries, null, 2);
  }
}
