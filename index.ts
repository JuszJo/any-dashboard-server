import express from "express";
import useRoutes from "./routes/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

useRoutes(app);

// Only start the server if this file is being run directly
if (require.main === module) {
    const PORT = Number(process.env.PORT as string) || 3000; // Note: changed | to ||

    app.listen(PORT, () => {
        console.log(`Listening on http://localhost:${PORT}`);
    });

    // async function gracefulShutdown(server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>) {
    //     console.log('Received shutdown signal. Shutting down gracefully...');
    
    //     // Close the Express server
    //     server.close(async () => {
    //         console.log('Express server closed.');
    
    //         // Close the Mongoose connection
    //         await mongoose.connection.close();
    //         console.log('MongoDB connection closed.');
    
    //         // Exit the process
    //         process.exit(0);
    //     });
    // };

    // // Listen for SIGTERM and SIGINT signals
    // process.on('SIGTERM', () => gracefulShutdown(server));
    // process.on('SIGINT', () => gracefulShutdown(server));
}

export { app };