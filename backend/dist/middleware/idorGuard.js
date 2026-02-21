"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.idorGuard = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const idorGuard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    const { id: userId, role } = req.user;
    const resourceId = parseInt(req.params.id);
    if (role === 'Admin') {
        return next();
    }
    // Example: Check access to assignments
    if (req.baseUrl.includes('assignments')) {
        const assignment = yield prismaClient_1.default.assignment.findUnique({
            where: { id: resourceId },
        });
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        if (role === 'Evaluator' && assignment.evaluator_id === userId) {
            return next();
        }
        // Evaluatees shouldn't be modifying/viewing other assignments details directly usually, but logic depends on specific endpoints
        if (role === 'Evaluatee' && assignment.evaluatee_id === userId) {
            return next();
        }
    }
    // Example: Check access to results
    if (req.baseUrl.includes('results')) {
        const result = yield prismaClient_1.default.evaluationResult.findUnique({
            where: { id: resourceId },
            include: { assignment: true },
        });
        if (!result || !result.assignment) {
            return res.status(404).json({ message: 'Result not found' });
        }
        if (role === 'Evaluator' && result.assignment.evaluator_id === userId) {
            return next();
        }
        if (role === 'Evaluatee' && result.assignment.evaluatee_id === userId) {
            return next(); // Evaluatee can view their own result
        }
    }
    // Default deny for unhandled resources or unauthorized access
    return res.status(403).json({ message: 'Access denied: IDOR Guard' });
});
exports.idorGuard = idorGuard;
