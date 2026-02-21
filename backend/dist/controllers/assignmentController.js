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
exports.getAssignments = exports.createAssignment = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const createAssignment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { evaluator_id, evaluatee_id, period_id } = req.body;
    try {
        const existingAssignment = yield prismaClient_1.default.assignment.findUnique({
            where: {
                evaluator_id_evaluatee_id_period_id: {
                    evaluator_id,
                    evaluatee_id,
                    period_id,
                },
            },
        });
        if (existingAssignment) {
            return res.status(409).json({ message: 'Duplicate assignment' });
        }
        const assignment = yield prismaClient_1.default.assignment.create({
            data: {
                evaluator_id,
                evaluatee_id,
                period_id,
            },
        });
        res.status(201).json(assignment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating assignment', error });
    }
});
exports.createAssignment = createAssignment;
const getAssignments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, pageSize = 10, sort, q } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);
    let orderBy;
    if (sort) {
        const [field, direction] = sort.split(':');
        orderBy = { [field]: direction };
    }
    const where = {};
    if (q) {
        // Basic search implementation - expand based on needs
        where.OR = [
            { evaluator: { name: { contains: q } } },
            { evaluatee: { name: { contains: q } } },
        ];
    }
    try {
        const assignments = yield prismaClient_1.default.assignment.findMany({
            skip,
            take,
            orderBy,
            where,
            include: {
                evaluator: { select: { id: true, name: true, email: true } },
                evaluatee: { select: { id: true, name: true, email: true } },
                period: true,
            },
        });
        const total = yield prismaClient_1.default.assignment.count({ where });
        res.json({ data: assignments, total, page: Number(page), pageSize: Number(pageSize) });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching assignments', error });
    }
});
exports.getAssignments = getAssignments;
