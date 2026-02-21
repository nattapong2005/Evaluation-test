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
exports.getProgress = exports.getNormalizedResults = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const getNormalizedResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield prismaClient_1.default.evaluationResult.findMany({
            where: {
                status: 'submitted',
            },
            include: {
                indicator: true,
            },
        });
        const normalizedResults = results.map((result) => {
            var _a, _b;
            let score = result.score_value || 0;
            let type = (_a = result.indicator) === null || _a === void 0 ? void 0 : _a.type;
            let weight = ((_b = result.indicator) === null || _b === void 0 ? void 0 : _b.weight) || 1;
            let finalScore = 0;
            if (type === 'score_1_4') {
                if (score >= 1 && score <= 4) {
                    finalScore = ((score - 1) / 3) * 60 * weight;
                }
            }
            else if (type === 'yes_no') {
                finalScore = score * 60 * weight;
            }
            return Object.assign(Object.assign({}, result), { normalized_score: finalScore });
        });
        res.json(normalizedResults);
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating report', error });
    }
});
exports.getNormalizedResults = getNormalizedResults;
const getProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departments = yield prismaClient_1.default.department.findMany({
            include: {
                users: {
                    include: {
                        evaluatee_assignments: {
                            include: {
                                results: true,
                            },
                        },
                    },
                },
            },
        });
        const progress = departments.map((dept) => {
            let totalAssignments = 0;
            let completedAssignments = 0;
            dept.users.forEach((user) => {
                user.evaluatee_assignments.forEach((assignment) => {
                    totalAssignments++;
                    const allSubmitted = assignment.results.every((r) => r.status === 'submitted' || r.status === 'locked');
                    if (allSubmitted && assignment.results.length > 0) {
                        completedAssignments++;
                    }
                });
            });
            return {
                department: dept.name,
                total: totalAssignments,
                completed: completedAssignments,
                percentage: totalAssignments === 0 ? 0 : (completedAssignments / totalAssignments) * 100,
            };
        });
        res.json(progress);
    }
    catch (error) {
        res.status(500).json({ message: 'Error generating progress report', error });
    }
});
exports.getProgress = getProgress;
