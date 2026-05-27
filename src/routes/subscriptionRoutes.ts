import { Router } from 'express';
import {
  getAll,
  getById,
  create,
  update,
  remove,
  importCSV,
  inviteMember,
  getSharedSubscriptions,
  getPendingInvitations,
  acceptInvitation,
  removeMember,
  resendInvitation,
  createValidation,
  updateValidation,
} from '../controllers/subscriptionController';
import { auth } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.use(auth);

router.get('/', getAll);
router.post('/', createValidation, validate, create);
router.get('/:id', getById);
router.put('/:id', updateValidation, validate, update);
router.delete('/:id', remove);
router.post('/import', importCSV);

// Shared subscription routes
router.post('/:id/invite', inviteMember);
router.post('/:id/resend-invite', resendInvitation);
router.get('/shared/mine', getSharedSubscriptions);
router.get('/shared/invitations', getPendingInvitations);
router.post('/:id/accept', acceptInvitation);
router.delete('/:id/members/:memberEmail', removeMember);

export default router;
