import * as express from "express";
import * as mongodb from "mongodb";
import { collections } from "./database";

export const appRouter = express.Router();
appRouter.use(express.json());

// Read
appRouter.get("/api/timespans", async (req, res) => {
  try {
    const timespans = await collections.timespans?.find({}).toArray()
    res.status(200);
    res.send(timespans);
  } catch (error: any) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// Create
appRouter.post("/api/timespans", async (req, res) => {
  try {
    const timespan = req.body;
    if (collections.timespans) {
      const result = await collections.timespans.insertOne(timespan);

      if (result.acknowledged) {
        res.status(201).send(`Created a new timespan: ID ${result.insertedId}`);
      } else {
        res.status(500).send("Failed to create a new timespan");
      }
    }
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});
