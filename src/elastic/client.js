import { Client } from "@elastic/elasticsearch";
import { ConsoleColor } from "../utils/ConsoleColor.js";
import dotenv from "dotenv";
dotenv.config();

export const client = new Client({
  node: process.env.ELASTIC_NODE_URL,
  auth: {
    username: process.env.ELASTIC_USER,
    password: process.env.ELASTIC_PASSWORD,
  },
  ssl: {
    ca: process.env.ELASTIC_CERTIFICATE_FILE_PATH,
    rejectUnauthorized: false,
  },
});
