import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  function signin(id?: string): string[];
}

jest.mock("../nats-wrapper");

process.env.STRIPE_KEY ='sk_test_51KL3xyBNqXsqme30LpyJkw3RATIMkfnhVsWnfJRKVPSko7UzcgCHOHTYYNO0kWTEW7yXR3iIuuiqD0t0RAgM354h00GJPLGxHE'

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "asd";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // Build a JWT payload. {id,email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };
  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // Build session object {jwt:MY_JWT}
  const session = { jwt: token };
  // session into JSON
  const sessionJSON = JSON.stringify(session);
  // encode to base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  // return a string thats the cookie with the encoded data
  return [`session=${base64}`];
};
