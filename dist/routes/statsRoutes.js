"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statsController_1 = require("../controllers/statsController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, statsController_1.getStats);
exports.default = router;
//# sourceMappingURL=statsRoutes.js.map