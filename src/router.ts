import * as express from "express";
import * as mongodb from "mongodb";
import { collections } from "./database";
import { Project } from "./projectModel";

export const appRouter = express.Router();
appRouter.use(express.json());

// Read Timespans
appRouter.get("/api/timespans", async (req, res) => {
  try {
    const timespans = await collections.timespans?.find({}).toArray();
    res.status(200);
    res.send(timespans);
  } catch (error: any) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// Create Timespan
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

// Read Projects
appRouter.get("/api/projects", async (req, res) => {
  try {
    const projects = await collections.projects?.find({}).toArray();
    res.status(200);
    res.send(projects);
  } catch (error: any) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

appRouter.post("/api/projects", async (req, res) => {
    try {
      const project = req.body;
      console.log(`Creating new project ${project.name}...`);
      if (collections.projects) {
        const result = await collections.projects.insertOne(project);
        if (result.acknowledged) {
          res
            .status(201)
            .send(`Created a new project: ID ${result.insertedId}`);
        } else {
          res.status(500).send("Failed to create a new project");
        }
      }
    } catch (error: any) {
      console.error(error);
      res.status(400).send(error.message);
    }
});

async function hasDuplicates(project: Project): Promise<boolean> {
  let hasDuplicates: boolean = false;
  const projects$ = await collections.projects?.find({}).toArray();
  if (projects$) {
    projects$.forEach((project$) => {
      if (project$.name == project.name) {
        hasDuplicates = true;
        return;
      }
    });
  }
  return hasDuplicates;
}
