import * as express from "express";
import { Payload } from "./types.ts";

declare global {
  namespace Express {
    interface Request {
      user: Payload; // Now required
    }
  }
}