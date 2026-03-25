/**
 * @module AccessControl
 * @description Role-based and case-linked access control for vault items.
 * Permissions are granted per case and per role (attorney, judge, party, etc.).
 */

import type { AccessLevel } from '../types';

/** An access grant record */
export interface AccessGrant {
  /** The user who was granted access */
  userId: string;
  /** The case the grant applies to */
  caseId: string;
  /** The access level granted */
  level: AccessLevel;
  /** Who granted the access */
  grantedBy: string;
  /** ISO timestamp when access was granted */
  grantedAt: string;
  /** Optional expiry for the grant */
  expiresAt?: string;
}

/** Access level hierarchy (higher index = more permissions) */
const ACCESS_HIERARCHY: AccessLevel[] = ['view', 'download', 'manage', 'admin'];

/**
 * AccessControl — determines who can access what evidence and at what level.
 *
 * Implements role-based access control (RBAC) scoped to individual cases.
 * Access grants are audited and can be time-limited.
 *
 * @example
 * ```typescript
 * const ac = new AccessControl();
 * await ac.grantAccess('user-123', 'case-456', 'view', 'admin-789');
 * const allowed = await ac.checkAccess('user-123', 'item-001', 'view');
 * ```
 */
export class AccessControl {
  private grants: AccessGrant[] = [];

  /**
   * Check if a user has the required access level for a vault item.
   *
   * @param userId - The user requesting access
   * @param itemId - The vault item being accessed
   * @param requiredLevel - The minimum access level required
   * @returns true if the user has sufficient access
   */
  async checkAccess(userId: string, itemId: string, requiredLevel: AccessLevel): Promise<boolean> {
    // TODO: Look up the item's caseId
    // TODO: Find the user's grant for that case
    // TODO: Compare access levels using hierarchy
    throw new Error('Not implemented');
  }

  /**
   * Grant access to a user for a specific case.
   *
   * @param userId - The user to grant access to
   * @param caseId - The case to grant access for
   * @param level - The access level to grant
   * @param grantedBy - The admin/user granting the access (default: 'system')
   * @param expiresAt - Optional expiry date
   */
  async grantAccess(
    userId: string,
    caseId: string,
    level: AccessLevel,
    grantedBy: string = 'system',
    expiresAt?: string,
  ): Promise<void> {
    this.grants.push({
      userId,
      caseId,
      level,
      grantedBy,
      grantedAt: new Date().toISOString(),
      expiresAt,
    });
    // TODO: Persist to database and log in audit trail
    throw new Error('Not implemented');
  }

  /**
   * Revoke a user's access to a case.
   *
   * @param userId - The user whose access to revoke
   * @param caseId - The case to revoke access for
   */
  async revokeAccess(userId: string, caseId: string): Promise<void> {
    this.grants = this.grants.filter(
      (g) => !(g.userId === userId && g.caseId === caseId),
    );
    // TODO: Persist revocation and log in audit trail
    throw new Error('Not implemented');
  }

  /**
   * List all permissions for a specific user.
   *
   * @param userId - The user to list permissions for
   * @returns Array of access grants
   */
  async listPermissions(userId: string): Promise<AccessGrant[]> {
    return this.grants.filter((g) => g.userId === userId);
  }

  /**
   * Compare two access levels to determine if one is sufficient.
   *
   * @param granted - The level the user has
   * @param required - The level needed
   * @returns true if the granted level is >= the required level
   */
  isLevelSufficient(granted: AccessLevel, required: AccessLevel): boolean {
    const grantedIdx = ACCESS_HIERARCHY.indexOf(granted);
    const requiredIdx = ACCESS_HIERARCHY.indexOf(required);
    return grantedIdx >= requiredIdx;
  }
}
