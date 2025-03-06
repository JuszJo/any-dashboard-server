import { Express } from "express";
import cors from "cors"

import { verifyTokenMiddleware } from "../middleware/auth.middleware";

import welcomeRoute from "./welcome.route";
import authRoute from "./auth.route";

export default function useRoutes(app: Express) {
    app.use(cors({origin: "*"}));
    
    app.use("/api", authRoute);

    app.use("/api", verifyTokenMiddleware);

    app.use("/api", welcomeRoute);
}