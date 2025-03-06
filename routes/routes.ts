import { Express } from "express";

import welcomeRoute from "./welcome.route";

export default function useRoutes(app: Express) {
    app.use("/api", welcomeRoute);
}