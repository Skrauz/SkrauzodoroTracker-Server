import * as dotenv from "dotenv";
import cors from "cors";
import express from "express";

import { appRouter } from "./router"; 

import { connectToDatabase } from "./database";

dotenv.config();

const { SERVER_URI } = process.env;
const { PORT } = process.env;

if (!SERVER_URI) {
  console.error(
    "No SERVER_URI environment variable defined in the config file"
  );
  process.exit(1);
}

connectToDatabase(SERVER_URI)
  .then(() => {
    const app = express();
    app.use(cors());

    app.use("/", appRouter)

    app.listen(PORT, () => {
      console.log(`App running on port ${PORT}...`);
    });
  })
  .catch((error) => {
    console.error(`An error has occured: ${error}`);
  });
