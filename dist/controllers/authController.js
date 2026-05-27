"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getMe = exports.login = exports.register = exports.loginValidation = exports.registerValidation = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
exports.registerValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
const register = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { name, email, password, baseCurrency } = req.body;
    const existingUser = await User_1.default.findOne({ email });
    if (existingUser) {
        res.status(400).json({ error: 'Email already exists' });
        return;
    }
    const user = new User_1.default({
        name,
        email,
        password,
        baseCurrency: baseCurrency || 'USD',
    });
    await user.save();
    const token = jsonwebtoken_1.default.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            baseCurrency: user.baseCurrency,
        },
        token,
    });
};
exports.register = register;
const login = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const { email, password } = req.body;
    const user = await User_1.default.findOne({ email });
    if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            baseCurrency: user.baseCurrency,
        },
        token,
    });
};
exports.login = login;
const getMe = async (req, res) => {
    res.json({
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            baseCurrency: req.user.baseCurrency,
        },
    });
};
exports.getMe = getMe;
const logout = async (_req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map