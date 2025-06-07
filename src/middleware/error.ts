import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

export class AppError extends Error {
    statusCode: number;
    
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    if (err instanceof AppError) {
        logger.error(`[${err.name}] ${err.statusCode} - ${err.message}`);
        res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
        return;
    }

    // Handle other types of errors
    logger.error('Unhandled Error:', err);
    
    const statusCode = 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message || 'An unexpected error occurred';

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
};
