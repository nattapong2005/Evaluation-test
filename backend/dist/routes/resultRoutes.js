"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resultController_1 = require("../controllers/resultController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const idorGuard_1 = require("../middleware/idorGuard");
const fileUpload_1 = require("../middleware/fileUpload");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateToken);
router.patch('/:id', idorGuard_1.idorGuard, fileUpload_1.upload.single('file'), resultController_1.updateResult);
exports.default = router;
