import express from "express";
import useRoutes from "./routes/routes";
import { db } from "./config/db.config";
import mongoose from "mongoose";
import { Server } from "http";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

useRoutes(app);

const PORT = Number(process.env.PORT as string) || 3000;

// Only start the server if this file is being run directly
if (require.main === module) {
    async function main() {
        try {
            console.log("Starting mongo connection");
    
            await mongoose.connect(db);
    
            // while (mongoose.connection.readyState !== 1) {
            //     console.log(`Current connection state: ${mongoose.connection.readyState}`);
    
            //     await new Promise(resolve => setTimeout(resolve, 2000));
            // }
    
            console.log("MongoDB connection fully established");
    
            const server = app.listen(PORT, () => {
                console.log(`Listening on http://localhost:${PORT}`);
            });
    
            async function gracefulShutdown(server: Server) {
                console.log('Received shutdown signal. Shutting down gracefully...');
    
                // Close the Express server
                server.close(async () => {
                    console.log('Express server closed.');
    
                    await mongoose.connection.close();
                    console.log('MongoDB connection closed.');
    
                    process.exit(0);
                });
            };
    
            // Listen for SIGTERM and SIGINT signals
            process.on('SIGTERM', () => gracefulShutdown(server));
            process.on('SIGINT', () => gracefulShutdown(server));
        }
        catch (error) {
            console.error(error);
        }
    }

    main();
}

export { app };