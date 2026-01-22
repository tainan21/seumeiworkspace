import { prisma } from "~/lib/server/db";
import type { Wallet, WalletTransaction } from "@prisma/client";
import { WalletTransactionType } from "@prisma/client";

/**
 * Payload para adicionar transação
 */
export interface AddTransactionPayload {
    walletId: string;
    type: WalletTransactionType;
    amount: number;
    description: string;
    referenceType?: string;
    referenceId?: string;
}

/**
 * Busca wallet por workspace ID
 */
export async function getWalletByWorkspaceId(workspaceId: string): Promise<Wallet | null> {
    if (!workspaceId?.trim()) {
        return null;
    }

    return prisma.wallet.findUnique({
        where: { workspaceId },
    });
}

/**
 * Busca saldo da wallet
 */
export async function getBalance(workspaceId: string): Promise<number> {
    const wallet = await getWalletByWorkspaceId(workspaceId);
    return wallet?.balance.toNumber() ?? 0;
}

/**
 * Busca saldo disponível (balance - reservedBalance)
 */
export async function getAvailableBalance(workspaceId: string): Promise<number> {
    const wallet = await getWalletByWorkspaceId(workspaceId);

    if (!wallet) return 0;

    const balance = wallet.balance.toNumber();
    const reserved = wallet.reservedBalance.toNumber();

    return Math.max(0, balance - reserved);
}

/**
 * Adiciona uma transação à wallet
 * 
 * Esta função atualiza o saldo da wallet baseado no tipo de transação:
 * - ONBOARDING_BONUS, PLAN_REWARD, PROMOTION, MANUAL_CREDIT: aumentam o saldo
 * - EXTENSION_PURCHASE, AI_CONSUMPTION, MANUAL_DEBIT: diminuem o saldo
 * 
 * @param payload - Dados da transação
 * @returns Transação criada
 * @throws Error se saldo insuficiente ou wallet não encontrada
 */
export async function addTransaction(
    payload: AddTransactionPayload
): Promise<WalletTransaction> {
    if (!payload.walletId?.trim()) {
        throw new Error("ID da wallet é obrigatório");
    }

    if (payload.amount <= 0) {
        throw new Error("Valor da transação deve ser maior que zero");
    }

    // Tipos que aumentam o saldo
    const creditTypes: WalletTransactionType[] = [
        "ONBOARDING_BONUS",
        "PLAN_REWARD",
        "PROMOTION",
        "MANUAL_CREDIT",
    ];

    // Tipos que diminuem o saldo
    const debitTypes: WalletTransactionType[] = [
        "EXTENSION_PURCHASE",
        "AI_CONSUMPTION",
        "MANUAL_DEBIT",
    ];

    const isCredit = creditTypes.includes(payload.type);
    const isDebit = debitTypes.includes(payload.type);

    if (!isCredit && !isDebit) {
        throw new Error(`Tipo de transação inválido: ${payload.type}`);
    }

    // Executar em transação
    const result = await prisma.$transaction(async (tx) => {
        // Buscar wallet com lock
        const wallet = await tx.wallet.findUnique({
            where: { id: payload.walletId },
        });

        if (!wallet) {
            throw new Error("Wallet não encontrada");
        }

        const currentBalance = wallet.balance.toNumber();
        const amount = payload.amount;

        // Calcular novo saldo
        let newBalance: number;
        if (isCredit) {
            newBalance = currentBalance + amount;
        } else {
            // Débito - verificar saldo disponível
            const reserved = wallet.reservedBalance.toNumber();
            const available = currentBalance - reserved;

            if (available < amount) {
                throw new Error(
                    `Saldo insuficiente. Disponível: ${available.toFixed(2)} coins, Necessário: ${amount.toFixed(2)} coins`
                );
            }

            newBalance = currentBalance - amount;
        }

        // Atualizar saldo da wallet
        await tx.wallet.update({
            where: { id: payload.walletId },
            data: { balance: newBalance },
        });

        // Criar transação
        const transaction = await tx.walletTransaction.create({
            data: {
                walletId: payload.walletId,
                type: payload.type,
                amount: payload.amount,
                description: payload.description,
                referenceType: payload.referenceType,
                referenceId: payload.referenceId,
            },
        });

        return transaction;
    });

    return result;
}

/**
 * Reserva saldo na wallet (para compras pendentes)
 */
export async function reserveBalance(
    walletId: string,
    amount: number
): Promise<void> {
    if (!walletId?.trim()) {
        throw new Error("ID da wallet é obrigatório");
    }

    if (amount <= 0) {
        throw new Error("Valor a reservar deve ser maior que zero");
    }

    await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({
            where: { id: walletId },
        });

        if (!wallet) {
            throw new Error("Wallet não encontrada");
        }

        const currentBalance = wallet.balance.toNumber();
        const currentReserved = wallet.reservedBalance.toNumber();
        const available = currentBalance - currentReserved;

        if (available < amount) {
            throw new Error(
                `Saldo insuficiente para reserva. Disponível: ${available.toFixed(2)} coins`
            );
        }

        await tx.wallet.update({
            where: { id: walletId },
            data: {
                reservedBalance: currentReserved + amount,
            },
        });
    });
}

/**
 * Libera saldo reservado na wallet
 */
export async function releaseReservedBalance(
    walletId: string,
    amount: number
): Promise<void> {
    if (!walletId?.trim()) {
        throw new Error("ID da wallet é obrigatório");
    }

    if (amount <= 0) {
        throw new Error("Valor a liberar deve ser maior que zero");
    }

    await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({
            where: { id: walletId },
        });

        if (!wallet) {
            throw new Error("Wallet não encontrada");
        }

        const currentReserved = wallet.reservedBalance.toNumber();

        if (currentReserved < amount) {
            throw new Error(
                `Valor a liberar (${amount.toFixed(2)}) maior que saldo reservado (${currentReserved.toFixed(2)})`
            );
        }

        await tx.wallet.update({
            where: { id: walletId },
            data: {
                reservedBalance: currentReserved - amount,
            },
        });
    });
}

/**
 * Busca histórico de transações da wallet
 */
export async function getTransactionHistory(
    workspaceId: string,
    options?: {
        limit?: number;
        offset?: number;
        type?: WalletTransactionType;
    }
): Promise<WalletTransaction[]> {
    const wallet = await getWalletByWorkspaceId(workspaceId);

    if (!wallet) {
        return [];
    }

    return prisma.walletTransaction.findMany({
        where: {
            walletId: wallet.id,
            ...(options?.type && { type: options.type }),
        },
        orderBy: {
            createdAt: "desc",
        },
        take: options?.limit ?? 50,
        skip: options?.offset ?? 0,
    });
}

/**
 * Calcula total de ganhos (créditos)
 */
export async function getTotalEarnings(workspaceId: string): Promise<number> {
    const wallet = await getWalletByWorkspaceId(workspaceId);

    if (!wallet) {
        return 0;
    }

    const creditTypes: WalletTransactionType[] = [
        "ONBOARDING_BONUS",
        "PLAN_REWARD",
        "PROMOTION",
        "MANUAL_CREDIT",
    ];

    const result = await prisma.walletTransaction.aggregate({
        where: {
            walletId: wallet.id,
            type: { in: creditTypes },
        },
        _sum: {
            amount: true,
        },
    });

    return result._sum.amount?.toNumber() ?? 0;
}

/**
 * Calcula total de gastos (débitos)
 */
export async function getTotalSpending(workspaceId: string): Promise<number> {
    const wallet = await getWalletByWorkspaceId(workspaceId);

    if (!wallet) {
        return 0;
    }

    const debitTypes: WalletTransactionType[] = [
        "EXTENSION_PURCHASE",
        "AI_CONSUMPTION",
        "MANUAL_DEBIT",
    ];

    const result = await prisma.walletTransaction.aggregate({
        where: {
            walletId: wallet.id,
            type: { in: debitTypes },
        },
        _sum: {
            amount: true,
        },
    });

    return result._sum.amount?.toNumber() ?? 0;
}
