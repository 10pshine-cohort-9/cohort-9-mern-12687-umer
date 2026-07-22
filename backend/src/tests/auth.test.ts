import * as chai from "chai";
import { use, expect } from "chai";
import {request, default as chaiHttp} from "chai-http";
import sinon from "sinon";
import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js";
import app from "../app.js";
import logger from "../services/logger.js";

chai.use(chaiHttp);

async function cleanDatabase() {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

describe("Auth API", () => {
  let loggerInfoStub: sinon.SinonStub;
  let loggerErrorStub: sinon.SinonStub;

  before(async () => {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("Tests must run with NODE_ENV=test");
    }
  });

  beforeEach(async () => {
    await cleanDatabase();
    loggerInfoStub = sinon.stub(logger, "info");
    loggerErrorStub = sinon.stub(logger, "error");
  });

  afterEach(() => {
    sinon.restore();
  });

  after(async () => {
    await prisma.$disconnect();
  });

  // --------------------------------------------------------------------
  // POST /api/auth/register
  // --------------------------------------------------------------------
  describe("POST /api/auth/register", () => {
    const validUser = {
      username: "testuser",
      email: "test@example.com",
      password: "StrongPass123!",
    };

    it("should register a new user and return tokens + user object", async () => {
      const res = await request.execute(app)
        .post("/api/auth/register")
        .send(validUser);

      expect(res.status).to.equal(201);
      expect(res.body.success).to.be.true;
      expect(res.body.msg).to.equal("User registered successfully.");
      expect(res.body.accessToken).to.be.a("string");
      expect(res.body.user).to.deep.include({
        username: validUser.username,
        email: validUser.email,
      });
      expect(res.body.user).to.have.property("id");

      // Check that a refresh token cookie was set
      expect(res.headers["set-cookie"]).to.exist;
      const cookie = res.headers["set-cookie"]![0];
      expect(cookie).to.include("refreshToken=");
      expect(cookie).to.include("HttpOnly");
      expect(cookie).to.include("SameSite=Strict");
      if (process.env.NODE_ENV === "production") {
        expect(cookie).to.include("Secure");
      }
    });

    it("should return 409 if username already exists", async () => {
      await request.execute(app).post("/api/auth/register").send(validUser);

      const res = await request.execute(app)
        .post("/api/auth/register")
        .send({ ...validUser, email: "other@example.com" });

      expect(res.status).to.equal(409);
      expect(res.body.success).to.be.false;
      expect(res.body.error.message).to.equal("Username or email already exists.");
    });

    it("should return 409 if email already exists", async () => {
      await request.execute(app).post("/api/auth/register").send(validUser);

      const res = await request.execute(app)
        .post("/api/auth/register")
        .send({ ...validUser, username: "otheruser" });

      expect(res.status).to.equal(409);
      expect(res.body.error.message).to.equal("Username or email already exists.");
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request.execute(app)
        .post("/api/auth/register")
        .send({ username: "u" });

      expect(res.status).to.equal(400);
      expect(res.body.success).to.be.false;
      expect(res.body.error.message).to.be.a("string");
    });

    it("should return 400 for invalid email format", async () => {
      const res = await request.execute(app)
        .post("/api/auth/register")
        .send({ ...validUser, email: "notanemail" });

      expect(res.status).to.equal(400);
    });

    it("should return 400 for password too short (if enforced by schema)", async () => {
      const res = await request.execute(app)
        .post("/api/auth/register")
        .send({ ...validUser, password: "short" });

      expect(res.status).to.equal(400);
    });

    it("should log registration info", async () => {
      await request.execute(app).post("/api/auth/register").send(validUser);
      sinon.assert.calledWith(loggerInfoStub, "User registered successfully.");
    });
  });

  // --------------------------------------------------------------------
  // POST /api/auth/login
  // --------------------------------------------------------------------
  describe("POST /api/auth/login", () => {
    const testUser = {
      username: "loginuser",
      email: "login@example.com",
      password: "Secret123!",
    };

    beforeEach(async () => {
      // Pre-register a user for login tests
      await request.execute(app).post("/api/auth/register").send(testUser);
    });

    it("should login with username and return tokens + user", async () => {
      const res = await request.execute(app).post("/api/auth/login").send({
        identifier: testUser.username,
        password: testUser.password,
      });

      expect(res.status).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.msg).to.equal("Logged in successfully.");
      expect(res.body.accessToken).to.be.a("string");
      expect(res.body.user).to.deep.include({
        username: testUser.username,
        email: testUser.email,
      });
      expect(res.headers["set-cookie"]).to.exist;
    });

    it("should login with email", async () => {
      const res = await request.execute(app).post("/api/auth/login").send({
        identifier: testUser.email,
        password: testUser.password,
      });

      expect(res.status).to.equal(200);
      expect(res.body.user.email).to.equal(testUser.email);
    });

    it("should return 404 if user not found (unknown username)", async () => {
      const res = await request.execute(app).post("/api/auth/login").send({
        identifier: "nonexistent",
        password: testUser.password,
      });

      expect(res.status).to.equal(404);
      expect(res.body.error.message).to.equal("User not found.");
    });

    it("should return 404 if user not found (unknown email)", async () => {
      const res = await request.execute(app).post("/api/auth/login").send({
        identifier: "no@user.com",
        password: testUser.password,
      });

      expect(res.status).to.equal(404);
    });

    it("should return 401 for invalid password", async () => {
      const res = await request.execute(app).post("/api/auth/login").send({
        identifier: testUser.username,
        password: "wrongpassword",
      });

      expect(res.status).to.equal(401);
      expect(res.body.error.message).to.equal("Invalid credentials.");
    });

    it("should return 400 for missing identifier/password", async () => {
      const res = await request.execute(app).post("/api/auth/login").send({});

      expect(res.status).to.equal(400);
    });

    it("should log login events (info and error)", async () => {
      await request.execute(app).post("/api/auth/login").send({
        identifier: testUser.username,
        password: testUser.password,
      });
      sinon.assert.calledWith(loggerInfoStub, "Logged in successfully.");
      await request.execute(app)
        .post("/api/auth/login")
        .send({ identifier: testUser.username, password: "bad" });
      sinon.assert.called(loggerErrorStub);
    });
  });
});
