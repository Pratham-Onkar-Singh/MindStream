import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/database.js";
import { PORT } from "./config/environment.js";
import apiRoutes from "./routes/index.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to database
connectDatabase();

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Route not found' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

export default app;
