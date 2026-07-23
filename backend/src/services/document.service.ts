import prisma from "../utils/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { Prisma } from "../../prisma/generated/prisma/client.js";
import logger from "./logger.js";

// The TipTap "empty document" shape — every new document gets exactly one
// RICH_TEXT block seeded with this. v2 adds MARKDOWN / WHITEBOARD / CODE as
// additional block types; this function and the schema underneath it don't
// change when that happens.
const EMPTY_RICH_TEXT_CONTENT = {
    type: "doc",
    content: [{ type: "paragraph" }],
};

export async function createDocumentForUser(userId: number, title: string) {
    return prisma.$transaction(async (tx) => {
        const doc = await tx.document.create({ data: { title, userId } });
        await tx.block.create({
            data: {
                documentId: doc.id,
                type: "RICH_TEXT",
                content: EMPTY_RICH_TEXT_CONTENT,
                position: 0,
            },
        });
        return doc;
    });
}

export async function listDocumentsForUser(userId: number) {
    return prisma.document.findMany({
        where: { userId },
        include: { blocks: true },
        orderBy: { updatedAt: "desc" },
    });
}

// Scoped by userId in the query itself (not filtered after the fact) so a
// document that exists but belongs to someone else looks identical to one
// that doesn't exist at all — 404 either way, nothing to enumerate.
export async function getDocumentForUser(userId: number, documentId: number) {
    const document = await prisma.document.findFirst({
        where: { id: documentId, userId },
        include: { blocks: true },
    });

    if (!document) {
        throw new AppError(404, "Document not found");
    }

    return document;
}

export async function updateDocumentForUser(
    userId: number,
    documentId: number,
    title: string,
    content: Prisma.InputJsonValue
) {
    const existing = await getDocumentForUser(userId, documentId);
    const primaryBlock = existing.blocks[0];

    if (!primaryBlock) {
        throw new AppError(500, "Document has no blocks");
    }

    return prisma.$transaction(async (tx) => {
        const doc = await tx.document.update({
            where: { id: existing.id },
            data: { title },
        });
        await tx.block.update({
            where: { id: primaryBlock.id },
            data: { content },
        });
        return doc;
    });
}

export async function deleteDocumentForUser(userId: number, documentId: number) {
    const existing = await getDocumentForUser(userId, documentId);

    logger.info({ documentId: existing.id, userId }, "Deleting document");

    await prisma.document.delete({
        where: {
            id: existing.id,
        },
    });
}


export function getPrimaryContent(document: any): any {
  // The first RICH_TEXT block's content (null if none)
  return document.blocks?.[0]?.content ?? null;
}