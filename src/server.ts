// Load environment variables first
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Then import other modules
import app from './app.js';
import logger from './utils/logger.js';

const port = process.env.PORT || 3000;

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    // Consider whether to exit the process in production
    // process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Consider whether to exit the process in production
    // process.exit(1);
});

// Start the server
const server = app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    // Handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            logger.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});