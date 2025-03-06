import { Express } from "express";

import { verifyTokenMiddleware } from "../middleware/auth.middleware";

import welcomeRoute from "./welcome.route";
import authRoute from "./auth.route";

export default function useRoutes(app: Express) {
    app.use("/api/auth", authRoute);

    app.use("/api", verifyTokenMiddleware);

    app.use("/api", welcomeRoute);
}