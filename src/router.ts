import * as express from "express";
import * as mongodb from "mongodb";
import { collections } from "./database";

export const appRouter = express.Router();
appRouter.use(express.json());
