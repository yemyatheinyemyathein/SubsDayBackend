"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendInvitation = exports.removeMember = exports.acceptInvitation = exports.getPendingInvitations = exports.getSharedSubscriptions = exports.inviteMember = exports.getConvertedPrice = exports.importCSV = exports.remove = exports.update = exports.create = exports.getById = exports.getAll = exports.updateValidation = exports.createValidation = void 0;
const express_validator_1 = require("express-validator");
const Subscription_1 = __importDefault(require("../models/Subscription"));
const currency_1 = require("../services/currency");
const email_1 = require("../services/email");
exports.createValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('currency').optional().isString(),
    (0, express_validator_1.body)('billingCycle')
        .optional()
        .isIn(['monthly', 'yearly', 'weekly', 'custom']),
    (0, express_validator_1.body)('nextBillingDate').isISO8601().withMessage('Valid date is required'),
    (0, express_validator_1.body)('startDate').optional({ values: 'null' }).isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.body)('endDate').optional({ values: 'null' }).isISO8601().withMessage('Valid end date is required'),
    (0, express_validator_1.body)('category').optional().isString(),
    (0, express_validator_1.body)('status').optional().isIn(['active', 'canceled']),
    (0, express_validator_1.body)('isShared').optional().isBoolean(),
    (0, express_validator_1.body)('sharedMembers').optional().isArray(),
    (0, express_validator_1.body)('sharedMembers.*.email').optional().isEmail().withMessage('Valid email required'),
    (0, express_validator_1.body)('sharedMembers.*.shareAmount').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('splitType').optional().isIn(['equal', 'custom']),
];
exports.updateValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid subscription ID'),
    (0, express_validator_1.body)('name').optional().trim().notEmpty(),
    (0, express_validator_1.body)('price').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('currency').optional().isString(),
    (0, express_validator_1.body)('billingCycle')
        .optional()
        .isIn(['monthly', 'yearly', 'weekly', 'custom']),
    (0, express_validator_1.body)('nextBillingDate').optional().isISO8601(),
    (0, express_validator_1.body)('startDate').optional({ values: 'null' }).isISO8601().withMessage('Valid start date is required'),
    (0, express_validator_1.body)('endDate').optional({ values: 'null' }).isISO8601().withMessage('Valid end date is required'),
    (0, express_validator_1.body)('category').optional().isString(),
    (0, express_validator_1.body)('status').optional().isIn(['active', 'canceled']),
    (0, express_validator_1.body)('isShared').optional().isBoolean(),
    (0, express_validator_1.body)('sharedMembers').optional().isArray(),
    (0, express_validator_1.body)('splitType').optional().isIn(['equal', 'custom']),
];
const getAll = async (req, res) => {
    const { status, category, sort = 'nextBillingDate', order = 'asc' } = req.query;
    const query = { user: req.user._id };
    if (status)
        query.status = status;
    if (category)
        query.category = category;
    const subscriptions = await Subscription_1.default.find(query)
        .sort({ [sort]: order === 'asc' ? 1 : -1 })
        .lean();
    res.json({ subscriptions });
};
exports.getAll = getAll;
const getById = async (req, res) => {
    const subscription = await Subscription_1.default.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
    }
    res.json({ subscription });
};
exports.getById = getById;
const create = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const subscription = new Subscription_1.default({
        ...req.body,
        user: req.user._id,
    });
    await subscription.save();
    res.status(201).json({ subscription });
};
exports.create = create;
const update = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    const subscription = await Subscription_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
    if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
    }
    res.json({ subscription });
};
exports.update = update;
const remove = async (req, res) => {
    const subscription = await Subscription_1.default.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
    }
    res.json({ message: 'Subscription deleted' });
};
exports.remove = remove;
const importCSV = async (req, res) => {
    if (!req.body.subscriptions || !Array.isArray(req.body.subscriptions)) {
        res.status(400).json({ error: 'Invalid data format' });
        return;
    }
    const subscriptions = req.body.subscriptions.map((sub) => ({
        ...sub,
        user: req.user._id,
        nextBillingDate: new Date(sub.nextBillingDate),
    }));
    const created = await Subscription_1.default.insertMany(subscriptions);
    res.status(201).json({ count: created.length, subscriptions: created });
};
exports.importCSV = importCSV;
const getConvertedPrice = async (price, currency, targetCurrency) => {
    if (currency === targetCurrency)
        return price;
    return (0, currency_1.convertCurrency)(price, currency, targetCurrency);
};
exports.getConvertedPrice = getConvertedPrice;
const inviteMember = async (req, res) => {
    const { id } = req.params;
    const { email, shareAmount } = req.body;
    if (!email || !shareAmount) {
        res.status(400).json({ error: 'Email and share amount are required' });
        return;
    }
    const subscription = await Subscription_1.default.findOne({ _id: id, user: req.user._id }).populate('user', 'name email');
    if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
    }
    const existingMember = subscription.sharedMembers?.find(m => m.email === email);
    if (existingMember) {
        res.status(400).json({ error: 'Member already invited' });
        return;
    }
    subscription.sharedMembers = subscription.sharedMembers || [];
    subscription.sharedMembers.push({
        email,
        shareAmount: Number(shareAmount),
        status: 'pending',
    });
    subscription.isShared = true;
    await subscription.save();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const acceptUrl = `${frontendUrl}/shared?accept=${subscription._id}&email=${encodeURIComponent(email)}`;
    const inviterName = subscription.user?.name || 'Someone';
    try {
        await (0, email_1.sendInvitationEmail)(email, inviterName, subscription.name, Number(shareAmount), subscription.currency || 'USD', acceptUrl);
    }
    catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
    }
    res.json({ subscription, emailSent: true });
};
exports.inviteMember = inviteMember;
const getSharedSubscriptions = async (req, res) => {
    const subscriptions = await Subscription_1.default.find({
        'sharedMembers.email': req.user.email,
        'sharedMembers.status': 'active',
    }).populate('user', 'name email');
    res.json({ subscriptions });
};
exports.getSharedSubscriptions = getSharedSubscriptions;
const getPendingInvitations = async (req, res) => {
    const invitations = await Subscription_1.default.find({
        'sharedMembers.email': req.user.email,
        'sharedMembers.status': 'pending',
    }).populate('user', 'name email');
    res.json({ invitations });
};
exports.getPendingInvitations = getPendingInvitations;
const acceptInvitation = async (req, res) => {
    const { id } = req.params;
    const subscription = await Subscription_1.default.findOne({
        _id: id,
        'sharedMembers.email': req.user.email,
        'sharedMembers.status': 'pending',
    }).populate('user', 'name email');
    if (!subscription) {
        res.status(404).json({ error: 'Invitation not found' });
        return;
    }
    const memberIndex = subscription.sharedMembers?.findIndex(m => m.email === req.user.email);
    if (memberIndex !== undefined && memberIndex >= 0) {
        const member = subscription.sharedMembers[memberIndex];
        subscription.sharedMembers[memberIndex].status = 'active';
        subscription.sharedMembers[memberIndex].joinedAt = new Date();
        subscription.sharedMembers[memberIndex].user = req.user._id;
        await subscription.save();
        const inviterEmail = subscription.user?.email;
        const inviterName = subscription.user?.name || 'Subscription Owner';
        const subscriberName = req.user.name || 'New Member';
        try {
            await (0, email_1.sendAcceptanceConfirmationEmail)(inviterEmail, subscriberName, subscription.name, member.shareAmount, subscription.currency || 'USD');
            await (0, email_1.sendWelcomeEmail)(req.user.email, subscriberName, subscription.name, member.shareAmount, subscription.currency || 'USD');
        }
        catch (emailError) {
            console.error('Failed to send confirmation emails:', emailError);
        }
    }
    res.json({ subscription, message: 'Invitation accepted successfully' });
};
exports.acceptInvitation = acceptInvitation;
const removeMember = async (req, res) => {
    const { id, memberEmail } = req.params;
    const subscription = await Subscription_1.default.findOne({ _id: id, user: req.user._id });
    if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
    }
    subscription.sharedMembers = subscription.sharedMembers?.filter(m => m.email !== memberEmail);
    if (!subscription.sharedMembers || subscription.sharedMembers.length === 0) {
        subscription.isShared = false;
    }
    await subscription.save();
    res.json({ subscription });
};
exports.removeMember = removeMember;
const resendInvitation = async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }
    const subscription = await Subscription_1.default.findOne({ _id: id, user: req.user._id }).populate('user', 'name email');
    if (!subscription) {
        res.status(404).json({ error: 'Subscription not found' });
        return;
    }
    const member = subscription.sharedMembers?.find(m => m.email === email);
    if (!member) {
        res.status(404).json({ error: 'Member not found' });
        return;
    }
    if (member.status !== 'pending') {
        res.status(400).json({ error: 'Invitation is not pending' });
        return;
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const acceptUrl = `${frontendUrl}/shared?accept=${subscription._id}&email=${encodeURIComponent(email)}`;
    const inviterName = subscription.user?.name || 'Someone';
    try {
        await (0, email_1.sendInvitationEmail)(email, inviterName, subscription.name, member.shareAmount, subscription.currency || 'USD', acceptUrl);
        res.json({ message: 'Invitation resent successfully', emailSent: true });
    }
    catch (emailError) {
        console.error('Failed to resend invitation email:', emailError);
        res.status(500).json({ error: 'Failed to send email' });
    }
};
exports.resendInvitation = resendInvitation;
//# sourceMappingURL=subscriptionController.js.map