import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import logger from "../services/logger.js";
import {
    createDocumentForUser,
    listDocumentsForUser,
    getDocumentForUser,
    updateDocumentForUser,
    deleteDocumentForUser,
} from "../services/document.service.js";

// Defense-in-depth: authenticate() already rejects requests with no valid
// user, so this should never actually throw in normal operation. It's here
// so a controller never silently trusts req.user.
function requireUserId(req: Request): number {
    if (!req.user?.userId) {
        throw new AppError(401, "Authentication required.");
    }
    return Number(req.user.userId);
}

export async function createDocument(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUserId(req);
        const { title } = req.body;

        const document = await createDocumentForUser(userId, title);

        logger.info(`Document created: ${document.id}`);

        return res.status(201).json({
            success: true,
            message: "Document created",
            document,
        });
    } catch (err) {
        next(err);
    }
}

export async function getUserDocuments(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUserId(req);
        const documents = await listDocumentsForUser(userId);

        logger.info(`Fetched ${documents.length} documents for user ${userId}`);

        return res.status(200).json({
            success: true,
            documents,
        });
    } catch (err) {
        next(err);
    }
}

export async function getUserDocumentById(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUserId(req);
        const document = await getDocumentForUser(userId, Number(req.params.id));

        // Add a flat 'content' field taken from the first block
        const documentWithContent = {
            ...document,
            content: document.blocks?.[0]?.content ?? null,
        };

        logger.info(`Fetched document ${document.id}`);

        return res.status(200).json({
            success: true,
            document: documentWithContent,
        });
    } catch (err) {
        next(err);
    }
}

export async function updateUserDocument(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUserId(req);
        const { title, content } = req.body;

        // Convert a plain string into a Tiptap-compatible JSON
        let tiptapContent = content;
        if (typeof content === 'string') {
            tiptapContent = {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [{ type: 'text', text: content }],
                    },
                ],
            };
        }

        const document = await updateDocumentForUser(
            userId,
            Number(req.params.id),
            title,
            tiptapContent
        );

        // Attach the flat content field for the response, same as GET
        const documentWithContent = {
            ...document,
            content: tiptapContent,
        };

        logger.info(`Document updated: ${document.id}`);

        return res.status(200).json({
            success: true,
            message: 'Document updated',
            document: documentWithContent,
        });
    } catch (err) {
        next(err);
    }
}

export async function deleteUserDocument(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = requireUserId(req);
        const documentId = Number(req.params.id);

        await deleteDocumentForUser(userId, documentId);

        logger.info(`Document deleted: ${documentId}`);

        return res.status(200).json({
            success: true,
            msg: "Document deleted successfully",
        });
    } catch (err) {
        next(err);
    }
}
