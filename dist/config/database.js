"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined");
        }
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=database.js.map