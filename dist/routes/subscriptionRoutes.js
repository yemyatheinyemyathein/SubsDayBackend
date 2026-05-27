"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptionController_1 = require("../controllers/subscriptionController");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
router.get('/', subscriptionController_1.getAll);
router.post('/', subscriptionController_1.createValidation, validate_1.validate, subscriptionController_1.create);
router.get('/:id', subscriptionController_1.getById);
router.put('/:id', subscriptionController_1.updateValidation, validate_1.validate, subscriptionController_1.update);
router.delete('/:id', subscriptionController_1.remove);
router.post('/import', subscriptionController_1.importCSV);
// Shared subscription routes
router.post('/:id/invite', subscriptionController_1.inviteMember);
router.post('/:id/resend-invite', subscriptionController_1.resendInvitation);
router.get('/shared/mine', subscriptionController_1.getSharedSubscriptions);
router.get('/shared/invitations', subscriptionController_1.getPendingInvitations);
router.post('/:id/accept', subscriptionController_1.acceptInvitation);
router.delete('/:id/members/:memberEmail', subscriptionController_1.removeMember);
exports.default = router;
//# sourceMappingURL=subscriptionRoutes.js.map