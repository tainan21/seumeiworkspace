/**
 * Whitelist Domain Types
 * 
 * Tipos e interfaces para o domínio de whitelist/waitlist
 */

export enum WaitlistEntryStatus {
  PENDING = "PENDING",
  NOTIFIED = "NOTIFIED",
  CONVERTED = "CONVERTED",
}

export interface WaitlistEntry {
  id: string;
  email: string;
  status: WaitlistEntryStatus;
  notifiedAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscribeToWaitlistInput {
  email: string;
}

export interface SubscribeToWaitlistOutput {
  success: boolean;
  message?: string;
  entryId?: string;
}

export interface GetWaitlistStatsOutput {
  total: number;
  pending: number;
  notified: number;
  converted: number;
}

