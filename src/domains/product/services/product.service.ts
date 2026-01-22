import { prisma } from "~/lib/server/db";
import type { Product } from "@prisma/client";

export interface CreateProductPayload {
    name: string;
    price: number;
    description?: string;
    sku?: string;
    images?: string[];
    workspaceId: string;
}

/**
 * Cria um novo produto
 */
export async function createProduct(payload: CreateProductPayload): Promise<Product> {
    if (!payload.name) throw new Error("Nome do produto obrigatório");
    if (!payload.workspaceId) throw new Error("Workspace ID obrigatório");

    return prisma.product.create({
        data: {
            name: payload.name,
            price: payload.price,
            description: payload.description,
            sku: payload.sku,
            images: payload.images || [],
            workspaceId: payload.workspaceId,
            status: "ACTIVE",
        },
    });
}
