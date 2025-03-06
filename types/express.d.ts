import * as express from "express";
import { VerifiedPayload } from "./types.ts";

declare global {
  namespace Express {
    interface Request {
      user: VerifiedPayload; // Now required
    }
  }
}