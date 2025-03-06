import dotenv from "dotenv";

dotenv.config();

const devDB = process.env.DEV_MONGO_URL as string;
const prodDB = process.env.PROD_MONGO_URL as string;

const db = process.env.NODE_ENV == "production" ? prodDB : devDB;

export { db }