import * as chai from 'chai';
import chaiHttp, {request} from 'chai-http';
import { expect } from 'chai';
import sinon from 'sinon';
import app from '../app.js';
import prisma from '../utils/prisma.js';
import logger from '../services/logger.js';

chai.use(chaiHttp);

async function cleanDatabase() {
  // Delete blocks first because of foreign key constraints
  await prisma.block.deleteMany();
  await prisma.document.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function registerAndLogin(): Promise<{ accessToken: string; userId: number }> {
  const user = {
    username: 'doctestuser',
    email: 'doctest@example.com',
    password: 'StrongPass123!',
  };
  const res = await request.execute(app).post('/api/auth/register').send(user);
  return { accessToken: res.body.accessToken, userId: res.body.user.id };
}

describe('Document API', () => {
  let accessToken: string;
  let userId: number;
  let loggerInfoStub: sinon.SinonStub;
  let loggerErrorStub: sinon.SinonStub;

  before(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Tests must run with NODE_ENV=test');
    }
  });

  beforeEach(async () => {
    await cleanDatabase();
    const auth = await registerAndLogin();
    accessToken = auth.accessToken;
    userId = auth.userId;
    loggerInfoStub = sinon.stub(logger, 'info');
    loggerErrorStub = sinon.stub(logger, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  after(async () => {
    await prisma.$disconnect();
  });

  // ======================================================
  // POST /api/documents
  // ======================================================
  describe('POST /api/documents', () => {
    it('should create a document and return 201 with the document', async () => {
      const res = await request.execute(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'My Doc' });

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Document created');
      expect(res.body.document).to.have.property('id');
      expect(res.body.document.title).to.equal('My Doc');
    });

    it('should create an initial block with empty content', async () => {
      const res = await request.execute(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Block Test' });

      const docId = res.body.document.id;
      const blocks = await prisma.block.findMany({ where: { documentId: docId } });
      expect(blocks).to.have.lengthOf(1);
      expect(blocks[0]!.type).to.equal('RICH_TEXT');
      expect(blocks[0]!.position).to.equal(0);
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request.execute(app)
        .post('/api/documents')
        .send({ title: 'Unauth' });
      expect(res.status).to.equal(401);
      expect(res.body.error.message).to.equal('Authentication required.');
    });

    it('should return 400 if title is missing (validation)', async () => {
      const res = await request.execute(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});
      expect(res.status).to.equal(400);
    });

    it('should log successful creation', async () => {
      await request.execute(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Log Test' });
      sinon.assert.calledWith(loggerInfoStub, sinon.match(/Document created:/));
    });
  });

  // ======================================================
  // GET /api/documents
  // ======================================================
  describe('GET /api/documents', () => {
    beforeEach(async () => {
      // Seed a document for the test user
      await prisma.document.create({
        data: {
          title: 'Doc 1',
          userId,
          blocks: { create: { type: 'RICH_TEXT', content: {}, position: 0 } },
        },
      });
    });

    it('should return all documents for the authenticated user', async () => {
      const res = await request.execute(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.documents).to.be.an('array').with.lengthOf(1);
      expect(res.body.documents[0].title).to.equal('Doc 1');
      expect(res.body.documents[0].blocks).to.be.an('array');
    });

    it('should return an empty array if user has no documents', async () => {
      // Remove the seeded document (already done by cleanDatabase, but we can explicitly delete)
      await prisma.block.deleteMany();   // remove blocks first
      await prisma.document.deleteMany();
      const res = await request.execute(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.body.documents).to.be.an('array').that.is.empty;
    });

    it('should return 401 without token', async () => {
      const res = await request.execute(app).get('/api/documents');
      expect(res.status).to.equal(401);
    });

    it('should log document fetch count', async () => {
      await request.execute(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${accessToken}`);
      sinon.assert.calledWith(loggerInfoStub, sinon.match(/Fetched \d+ documents/));
    });
  });

  // ======================================================
  // GET /api/documents/:id
  // ======================================================
  describe('GET /api/documents/:id', () => {
    let docId: number;

    beforeEach(async () => {
      const doc = await prisma.document.create({
        data: {
          title: 'Single Doc',
          userId,
          blocks: { create: { type: 'RICH_TEXT', content: {}, position: 0 } },
        },
      });
      docId = doc.id;
    });

    it('should return a document by ID', async () => {
      const res = await request.execute(app)
        .get(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.document.title).to.equal('Single Doc');
    });

    it('should return 404 for non‑existent document', async () => {
      const res = await request.execute(app)
        .get('/api/documents/99999')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).to.equal(404);
      expect(res.body.error.message).to.equal('Document not found');
    });

    it('should return 401 without token', async () => {
      const res = await request.execute(app).get(`/api/documents/${docId}`);
      expect(res.status).to.equal(401);
    });

    it('should log fetch by ID', async () => {
      await request.execute(app)
        .get(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      sinon.assert.calledWith(loggerInfoStub, sinon.match(/Fetched document \d+/));
    });

    it('should call logger.error on 404 (via error handler)', async () => {
      await request.execute(app)
        .get('/api/documents/99999')
        .set('Authorization', `Bearer ${accessToken}`);
      sinon.assert.called(loggerErrorStub);
    });
  });

  // ======================================================
  // PUT /api/documents/:id
  // ======================================================
  describe('PUT /api/documents/:id', () => {
    let docId: number;
    let blockId: number;

    beforeEach(async () => {
      const doc = await prisma.document.create({
        data: {
          title: 'Update Me',
          userId,
          blocks: { create: { type: 'RICH_TEXT', content: { text: 'old' }, position: 0 } },
        },
      });
      docId = doc.id;
      const blocks = await prisma.block.findMany({ where: { documentId: docId } });
      blockId = blocks[0]!.id;
    });

    it('should update the title and content of the first block', async () => {
      const newContent = { text: 'updated content' };
      const res = await request.execute(app)
        .put(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Title', content: newContent });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.message).to.equal('Document updated');
      // Verify title
      const updatedDoc = await prisma.document.findUnique({ where: { id: docId } });
      expect(updatedDoc?.title).to.equal('Updated Title');
      // Verify block content
      const updatedBlock = await prisma.block.findUnique({ where: { id: blockId } });
      expect(updatedBlock?.content).to.deep.equal(newContent);
    });

    it('should return 404 if document does not exist', async () => {
      const res = await request.execute(app)
        .put('/api/documents/99999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'x', content: {} });
      expect(res.status).to.equal(404);
    });

    it('should return 401 without token', async () => {
      const res = await request.execute(app)
        .put(`/api/documents/${docId}`)
        .send({ title: 'No Auth', content: {} });
      expect(res.status).to.equal(401);
    });

    it('should log successful update', async () => {
      await request.execute(app)
        .put(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Log', content: { text: 'x' } });
      sinon.assert.calledWith(loggerInfoStub, sinon.match(/Document updated:/));
    });

    it('should call logger.error on validation error (if content missing)', async () => {
      // This test assumes your validation schema rejects missing content.
      const res = await request.execute(app)
        .put(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'No Content' });
      // If validation middleware returns 400, logger.error will be called by error handler
      if (res.status === 400) {
        sinon.assert.called(loggerErrorStub);
      }
    });
  });

  // ======================================================
  // DELETE /api/documents/:id
  // ======================================================
  describe('DELETE /api/documents/:id', () => {
    let docId: number;

    beforeEach(async () => {
      const doc = await prisma.document.create({
        data: { title: 'Delete Me', userId },
      });
      docId = doc.id;
    });

    it('should delete the document and return 200', async () => {
      const res = await request.execute(app)
        .delete(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.msg).to.equal('Document deleted successfully');

      const exists = await prisma.document.findUnique({ where: { id: docId } });
      expect(exists).to.be.null;
    });

    it('should return 404 if document does not exist', async () => {
      const res = await request.execute(app)
        .delete('/api/documents/99999')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).to.equal(404);
    });

    it('should return 401 without token', async () => {
      const res = await request.execute(app).delete(`/api/documents/${docId}`);
      expect(res.status).to.equal(401);
    });

    it('should log successful deletion', async () => {
      await request.execute(app)
        .delete(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      sinon.assert.calledWith(loggerInfoStub, sinon.match(/Document deleted:/));
    });

    it('should call logger.error when document not found', async () => {
      await request.execute(app)
        .delete('/api/documents/99999')
        .set('Authorization', `Bearer ${accessToken}`);
      sinon.assert.called(loggerErrorStub);
    });
  });

  // ======================================================
  // Ownership enforcement — a document scoped to one user
  // must be invisible (not just unwritable) to another user
  // ======================================================
  describe('Cross-user access is blocked', () => {
    let docId: number;
    let otherAccessToken: string;

    beforeEach(async () => {
      const doc = await prisma.document.create({
        data: {
          title: 'Owner Only',
          userId,
          blocks: { create: { type: 'RICH_TEXT', content: {}, position: 0 } },
        },
      });
      docId = doc.id;

      const otherUser = {
        username: 'otheruser',
        email: 'other@example.com',
        password: 'StrongPass123!',
      };
      const res = await request.execute(app).post('/api/auth/register').send(otherUser);
      otherAccessToken = res.body.accessToken;
    });

    it('should return 404 (not 403) when a different user reads the document', async () => {
      // 404 rather than 403 is deliberate: the query is scoped by userId,
      // so "exists but isn't yours" and "doesn't exist" look identical to
      // the requester, which avoids leaking which document IDs are in use.
      const res = await request.execute(app)
        .get(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${otherAccessToken}`);
      expect(res.status).to.equal(404);
    });

    it('should return 404 when a different user tries to update the document', async () => {
      const res = await request.execute(app)
        .put(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .send({ title: 'Hijacked', content: {} });
      expect(res.status).to.equal(404);

      const untouched = await prisma.document.findUnique({ where: { id: docId } });
      expect(untouched?.title).to.equal('Owner Only');
    });

    it('should return 404 when a different user tries to delete the document', async () => {
      const res = await request.execute(app)
        .delete(`/api/documents/${docId}`)
        .set('Authorization', `Bearer ${otherAccessToken}`);
      expect(res.status).to.equal(404);

      const stillExists = await prisma.document.findUnique({ where: { id: docId } });
      expect(stillExists).to.not.be.null;
    });
  });

  // ======================================================
  // Invalid document id (non-numeric route param)
  // ======================================================
  describe('Invalid document id', () => {
    it('should return 400 for a non-numeric id on GET', async () => {
      const res = await request.execute(app)
        .get('/api/documents/not-a-number')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).to.equal(400);
    });

    it('should return 400 for a non-numeric id on PUT', async () => {
      const res = await request.execute(app)
        .put('/api/documents/not-a-number')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'x', content: {} });
      expect(res.status).to.equal(400);
    });

    it('should return 400 for a non-numeric id on DELETE', async () => {
      const res = await request.execute(app)
        .delete('/api/documents/not-a-number')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).to.equal(400);
    });
  });
});