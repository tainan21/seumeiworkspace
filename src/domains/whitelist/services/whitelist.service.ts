/**
 * WhitelistService - Lógica de negócio pura para whitelist
 * 
 * ⚠️ ATENÇÃO: Este service contém apenas lógica de domínio
 * - Sem dependências de framework
 * - Validações semânticas apenas
 * - Sem rate limiting (vai no action)
 */

import { prisma } from "~/lib/server/db";
import type {
  WaitlistEntry,
  WaitlistEntryStatus,
  GetWaitlistStatsOutput,
} from "../types";

export class WhitelistService {
  /**
   * Valida formato de email
   * Regex simples para validação básica
   */
  validateEmail(email: string): boolean {
    if (!email || typeof email !== "string") {
      return false;
    }

    const trimmed = email.trim();
    if (trimmed.length === 0) {
      return false;
    }

    // Validação básica: deve conter @ e pelo menos um ponto após o @
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  }

  /**
   * Verifica se email já existe na waitlist
   */
  async checkDuplicate(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.waitlistEntry.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    return !!existing;
  }

  /**
   * Cria nova entrada na waitlist com status PENDING
   */
  async createEntry(email: string): Promise<WaitlistEntry> {
    const normalizedEmail = email.trim().toLowerCase();

    const entry = await prisma.waitlistEntry.create({
      data: {
        email: normalizedEmail,
        status: "PENDING",
      },
    });

    return {
      id: entry.id,
      email: entry.email,
      status: entry.status as WaitlistEntryStatus,
      notifiedAt: entry.notifiedAt,
      metadata: entry.metadata as Record<string, unknown> | null,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  /**
   * Retorna total de inscritos na waitlist
   */
  async getTotalCount(): Promise<number> {
    return prisma.waitlistEntry.count();
  }

  /**
   * Retorna estatísticas por status
   */
  async getStats(): Promise<GetWaitlistStatsOutput> {
    const [total, pending, notified, converted] = await Promise.all([
      prisma.waitlistEntry.count(),
      prisma.waitlistEntry.count({ where: { status: "PENDING" } }),
      prisma.waitlistEntry.count({ where: { status: "NOTIFIED" } }),
      prisma.waitlistEntry.count({ where: { status: "CONVERTED" } }),
    ]);

    return {
      total,
      pending,
      notified,
      converted,
    };
  }

  /**
   * Busca última entrada por email (para rate limiting)
   * Usado pelo action, não pelo service diretamente
   */
  async getLastEntryByEmail(email: string): Promise<WaitlistEntry | null> {
    const normalizedEmail = email.trim().toLowerCase();

    const entry = await prisma.waitlistEntry.findUnique({
      where: { email: normalizedEmail },
    });

    if (!entry) {
      return null;
    }

    return {
      id: entry.id,
      email: entry.email,
      status: entry.status as WaitlistEntryStatus,
      notifiedAt: entry.notifiedAt,
      metadata: entry.metadata as Record<string, unknown> | null,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }
}

