import * as mongodb from "mongodb";
import { Timespan } from "./timespanModel";

export const collections: { timespans?: mongodb.Collection<Timespan> } = {};

export async function connectToDatabase(uri: string) {
  console.log(`Connecting to the database...`);
  const client = new mongodb.MongoClient(uri);
  await client
    .connect()
    .then(() => {
      console.log(`Connected to the database at ${uri}`);
    })
    .catch((error) => {
      console.log(`Failed to connect to the database at ${uri}`);
      console.error(error);
    });

  const db = client.db("SkrauzodoroDatabase");
  await applySchemaValidation(db);

  const timespansCollection = db.collection<Timespan>("timespans");
  collections.timespans = timespansCollection;
}

async function applySchemaValidation(db: mongodb.Db) {
  console.log("Applying schema validation...")
  const jsonSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["mode", "startTime", "endTime"],
      additionalProperties: true,
      properties: {
        _id: {},
        mode: {
          bsonType: "string",
          description:
            "'mode' is required and is one of 'tracker' or 'pomodoro'",
          enum: ["tracker", "pomodoro"],
        },
        startDate: {
          bsonType: "date",
          description: "'startDate' is required and is a date",
        },
        endDate: {
          bsonType: "date",
          description: "'endDate' is required and is a aate",
        },
      },
    },
  };

  // Try applying the modification to the collection, if the collection doesn't exist, create it
  await db
    .command({
      collMod: "timespans",
      validator: jsonSchema,
    })
    .catch(async (error: mongodb.MongoServerError) => {
      if (error.codeName === "NamespaceNotFound") {
        console.log(
          `Failed to find the collection. Creating new collection...`
        );
        await db
          .createCollection("timespans", { validator: jsonSchema })
          .then(() => console.log("Created new collection"))
          .catch((error) => {
            console.error(error);
          });
      }
    });
}
