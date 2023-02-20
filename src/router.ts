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

appRouter.get("/api/projects/:name?", async (req, res) => {
  try {
    const projectName = req?.params?.name;
    const query = { name: projectName };
    const project = await collections.projects?.findOne(query);

    if (project) {
      res.status(200).send(project);
    } else {
      res.status(404).send(`Failed to find the project ${projectName}`);
    }
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

// Create Projects
appRouter.post("/api/projects", async (req, res) => {
  try {
    const project = req.body;
    if (collections.projects) {
      if (await hasDuplicates(project)) {
        res.status(400).send(`Project ${project.name} must have unique name`);
      }
      const result = await collections.projects.insertOne(project);
      if (result.acknowledged) {
        res.status(201).send(`Created a new project: ID ${result.insertedId}`);
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

// Update Project
appRouter.put("/api/projects/:id", async (req, res) => {
  try {
    if (collections.projects) {
      const id = req?.params?.id;
      
      const project: Project = req.body;
      const query = { _id: new mongodb.ObjectId(id) };

      const result = await collections.projects.updateOne(query, {
        $set: {
          name: project.name,
          _id: new mongodb.ObjectId(id)
        },
      });
  
      if (result && result.matchedCount) {
        res.status(200).send(`Update an project: ID ${id}`);
        return;
      }
      if (!result.matchedCount) {
        res.status(404).send(`Could not find proejct: ID ${id}`);
        return;
      }
      res.status(304).send(`Failed to update project: ID ${id}`);
    }
  } catch (error: any) {
    console.error(error);
    res.status(400).send(error.message);
  }
});
