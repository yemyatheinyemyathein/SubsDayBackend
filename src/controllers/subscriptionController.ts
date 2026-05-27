import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import Subscription from '../models/Subscription';
import User from '../models/User';
import { convertCurrency } from '../services/currency';
import { sendInvitationEmail, sendAcceptanceConfirmationEmail, sendWelcomeEmail } from '../services/email';

export const createValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('currency').optional().isString(),
  body('billingCycle')
    .optional()
    .isIn(['monthly', 'yearly', 'weekly', 'custom']),
  body('nextBillingDate').isISO8601().withMessage('Valid date is required'),
  body('startDate').optional({ values: 'null' }).isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional({ values: 'null' }).isISO8601().withMessage('Valid end date is required'),
  body('category').optional().isString(),
  body('status').optional().isIn(['active', 'canceled']),
  body('isShared').optional().isBoolean(),
  body('sharedMembers').optional().isArray(),
  body('sharedMembers.*.email').optional().isEmail().withMessage('Valid email required'),
  body('sharedMembers.*.shareAmount').optional().isFloat({ min: 0 }),
  body('splitType').optional().isIn(['equal', 'custom']),
];

export const updateValidation = [
  param('id').isMongoId().withMessage('Invalid subscription ID'),
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('currency').optional().isString(),
  body('billingCycle')
    .optional()
    .isIn(['monthly', 'yearly', 'weekly', 'custom']),
  body('nextBillingDate').optional().isISO8601(),
  body('startDate').optional({ values: 'null' }).isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional({ values: 'null' }).isISO8601().withMessage('Valid end date is required'),
  body('category').optional().isString(),
  body('status').optional().isIn(['active', 'canceled']),
  body('isShared').optional().isBoolean(),
  body('sharedMembers').optional().isArray(),
  body('splitType').optional().isIn(['equal', 'custom']),
];

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { status, category, sort = 'nextBillingDate', order = 'asc' } = req.query;

  const query: any = { user: req.user!._id };
  if (status) query.status = status;
  if (category) query.category = category;

  const subscriptions = await Subscription.find(query)
    .sort({ [sort as string]: order === 'asc' ? 1 : -1 })
    .lean();

  res.json({ subscriptions });
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const subscription = await Subscription.findOne({
    _id: req.params.id,
    user: req.user!._id,
  });

  if (!subscription) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }

  res.json({ subscription });
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const subscription = new Subscription({
    ...req.body,
    user: req.user!._id,
  });

  await subscription.save();
  res.status(201).json({ subscription });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const subscription = await Subscription.findOneAndUpdate(
    { _id: req.params.id, user: req.user!._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!subscription) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }

  res.json({ subscription });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const subscription = await Subscription.findOneAndDelete({
    _id: req.params.id,
    user: req.user!._id,
  });

  if (!subscription) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }

  res.json({ message: 'Subscription deleted' });
};

export const importCSV = async (req: Request, res: Response): Promise<void> => {
  if (!req.body.subscriptions || !Array.isArray(req.body.subscriptions)) {
    res.status(400).json({ error: 'Invalid data format' });
    return;
  }

  const subscriptions = req.body.subscriptions.map((sub: any) => ({
    ...sub,
    user: req.user!._id,
    nextBillingDate: new Date(sub.nextBillingDate),
  }));

  const created = await Subscription.insertMany(subscriptions);
  res.status(201).json({ count: created.length, subscriptions: created });
};

export const getConvertedPrice = async (
  price: number,
  currency: string,
  targetCurrency: string
): Promise<number> => {
  if (currency === targetCurrency) return price;
  return convertCurrency(price, currency, targetCurrency);
};

export const inviteMember = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { email, shareAmount } = req.body;

  if (!email || !shareAmount) {
    res.status(400).json({ error: 'Email and share amount are required' });
    return;
  }

  const subscription = await Subscription.findOne({ _id: id, user: req.user!._id }).populate('user', 'name email');
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
  const inviterName = (subscription.user as any)?.name || 'Someone';

  try {
    await sendInvitationEmail(
      email,
      inviterName,
      subscription.name,
      Number(shareAmount),
      subscription.currency || 'USD',
      acceptUrl
    );
  } catch (emailError) {
    console.error('Failed to send invitation email:', emailError);
  }

  res.json({ subscription, emailSent: true });
};

export const getSharedSubscriptions = async (req: Request, res: Response): Promise<void> => {
  const subscriptions = await Subscription.find({
    'sharedMembers.email': req.user!.email,
    'sharedMembers.status': 'active',
  }).populate('user', 'name email');

  res.json({ subscriptions });
};

export const getPendingInvitations = async (req: Request, res: Response): Promise<void> => {
  const invitations = await Subscription.find({
    'sharedMembers.email': req.user!.email,
    'sharedMembers.status': 'pending',
  }).populate('user', 'name email');

  res.json({ invitations });
};

export const acceptInvitation = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const subscription = await Subscription.findOne({
    _id: id,
    'sharedMembers.email': req.user!.email,
    'sharedMembers.status': 'pending',
  }).populate('user', 'name email');

  if (!subscription) {
    res.status(404).json({ error: 'Invitation not found' });
    return;
  }

  const memberIndex = subscription.sharedMembers?.findIndex(
    m => m.email === req.user!.email
  );
  if (memberIndex !== undefined && memberIndex >= 0) {
    const member = subscription.sharedMembers![memberIndex];
    subscription.sharedMembers![memberIndex].status = 'active';
    subscription.sharedMembers![memberIndex].joinedAt = new Date();
    subscription.sharedMembers![memberIndex].user = req.user!._id as any;
    await subscription.save();

    const inviterEmail = (subscription.user as any)?.email;
    const inviterName = (subscription.user as any)?.name || 'Subscription Owner';
    const subscriberName = req.user!.name || 'New Member';

    try {
      await sendAcceptanceConfirmationEmail(
        inviterEmail,
        subscriberName,
        subscription.name,
        member.shareAmount,
        subscription.currency || 'USD'
      );

      await sendWelcomeEmail(
        req.user!.email,
        subscriberName,
        subscription.name,
        member.shareAmount,
        subscription.currency || 'USD'
      );
    } catch (emailError) {
      console.error('Failed to send confirmation emails:', emailError);
    }
  }

  res.json({ subscription, message: 'Invitation accepted successfully' });
};

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  const { id, memberEmail } = req.params;

  const subscription = await Subscription.findOne({ _id: id, user: req.user!._id });
  if (!subscription) {
    res.status(404).json({ error: 'Subscription not found' });
    return;
  }

  subscription.sharedMembers = subscription.sharedMembers?.filter(
    m => m.email !== memberEmail
  );

  if (!subscription.sharedMembers || subscription.sharedMembers.length === 0) {
    subscription.isShared = false;
  }

  await subscription.save();
  res.json({ subscription });
};

export const resendInvitation = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const subscription = await Subscription.findOne({ _id: id, user: req.user!._id }).populate('user', 'name email');
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
  const inviterName = (subscription.user as any)?.name || 'Someone';

  try {
    await sendInvitationEmail(
      email,
      inviterName,
      subscription.name,
      member.shareAmount,
      subscription.currency || 'USD',
      acceptUrl
    );
    res.json({ message: 'Invitation resent successfully', emailSent: true });
  } catch (emailError) {
    console.error('Failed to resend invitation email:', emailError);
    res.status(500).json({ error: 'Failed to send email' });
  }
};
