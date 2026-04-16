import { MongoClient } from "mongodb";
import { hash } from "bcrypt";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/patas-arriba";

export const SEED_ADMIN = {
  email: "admin@e2e-test.com",
  username: "e2eadmin",
  fullName: "e2e admin",
  phoneCode: 34,
  phoneNumber: "600000001",
  role: "admin",
  password: "AdminPass1",
};

export const SEED_USER = {
  email: "user@e2e-test.com",
  username: "e2euser",
  fullName: "e2e user",
  phoneCode: 34,
  phoneNumber: "600000002",
  role: "user",
  password: "UserPass1",
};

export default async function globalSetup() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection("users");

    for (const seed of [SEED_ADMIN, SEED_USER]) {
      const hashedPassword = await hash(seed.password, 12);

      await users.updateOne(
        { email: seed.email },
        {
          $set: {
            email: seed.email,
            username: seed.username,
            fullName: seed.fullName,
            phoneCode: seed.phoneCode,
            phoneNumber: seed.phoneNumber,
            role: seed.role,
            password: hashedPassword,
          },
        },
        { upsert: true }
      );
    }

    console.log("E2E seed: admin and user accounts ready");
  } finally {
    await client.close();
  }
}