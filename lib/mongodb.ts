import { MongoClient, Db } from "mongodb";

// The URI is stored in .env.local
// Password contains @ which must be URL-encoded as %40
const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error(
    "⚠️  MONGODB_URI is not set. Add it to .env.local:\n" +
    "MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/digitalityfarming?..."
  );
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // Prevent multiple MongoClient instances during Next.js hot-reload
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

/**
 * Returns the connected Db instance for 'digitalityfarming'
 * (matches the MongoDB Atlas database used by the Express backend)
 */
export async function getDb(): Promise<Db> {
  const c = await clientPromise;
  return c.db("digitalityfarming");
}

export default clientPromise;
