import * as mongodb from "mongodb";
import { Timespan } from "./timespanModel";
import { Project } from "./projectModel";

export const collections: {
  timespans?: mongodb.Collection<Timespan>;
  projects?: mongodb.Collection<Project>;
} = {};

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

  const projectsCollection = db.collection<Project>("projects");
  const timespansCollection = db.collection<Timespan>("timespans");
  collections.projects = projectsCollection;
  collections.timespans = timespansCollection;
}

async function applySchemaValidation(db: mongodb.Db) {
  console.log("Applying schema validation...");

  const timespansJsonSchema = {
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

  const projectsJsonSchema = {
    $jsonSchema: {
      bsonType: "object",
      additionalProperties: true,
      properties: {
        _id: {},
        name: {
          bsonType: "string",
          description: "'name' is required and is a string",
        },
      },
    },
  };

  // Try applying the modification to the collection, if the collection doesn't exist, create it
  await db
    .command({
      collMod: "timespans",
      validator: timespansJsonSchema,
    })
    .catch(async (error: mongodb.MongoServerError) => {
      if (error.codeName === "NamespaceNotFound") {
        console.log(
          `Failed to find the timespans collection. Creating new collection...`
        );
        await db
          .createCollection("timespans", { validator: timespansJsonSchema })
          .then(() => console.log("Created new collection"))
          .catch((error) => {
            console.error(error);
          });
        await applySchemaValidation(db);
      }
    });

  await db
    .command({
      collMod: "projects",
      validator: projectsJsonSchema,
    })
    .catch(async (error: mongodb.MongoServerError) => {
      if (error.codeName === "NamespaceNotFound") {
        console.log(
          `Failed to find the projects collection. Creating new collection...`
        );
        await db
          .createCollection("projects", { validator: timespansJsonSchema })
          .then(() => console.log("Created new collection"))
          .catch((error) => {
            console.error(error);
          });
        await applySchemaValidation(db);
      }
    });
}