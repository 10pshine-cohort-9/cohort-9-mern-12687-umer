import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentIdParamSchema,
} from '../validation/document.schema.js';
import {
  createDocument,
  getUserDocuments,
  getUserDocumentById,
  updateUserDocument,
  deleteUserDocument,
} from '../controllers/documentController.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createDocumentSchema), createDocument);
router.get('/', getUserDocuments);
router.get('/:id', validate(documentIdParamSchema), getUserDocumentById);
router.put('/:id', validate(updateDocumentSchema), updateUserDocument);
router.delete('/:id', validate(documentIdParamSchema), deleteUserDocument);

export default router;
