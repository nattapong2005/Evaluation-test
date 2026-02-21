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
exports.updateResult = void 0;
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const updateResult = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { score_value, note, status } = req.body;
    const file = req.file;
    try {
        const result = yield prismaClient_1.default.evaluationResult.findUnique({
            where: { id: parseInt(id) },
            include: {
                indicator: true,
                attachments: true,
            },
        });
        if (!result) {
            return res.status(404).json({ message: 'Evaluation result not found' });
        }
        if (((_a = result.indicator) === null || _a === void 0 ? void 0 : _a.type) === 'yes_no' && status === 'submitted' && score_value === 1 && !file && result.attachments.length === 0) {
            return res.status(400).json({ message: 'EVIDENCE REQUIRED' });
        }
        const updatedResult = yield prismaClient_1.default.evaluationResult.update({
            where: { id: parseInt(id) },
            data: {
                score_value,
                note,
                status,
                submitted_at: status === 'submitted' ? new Date() : undefined,
            },
        });
        if (file) {
            yield prismaClient_1.default.attachment.create({
                data: {
                    result_id: updatedResult.id,
                    file_path: file.path,
                    file_type: file.mimetype,
                },
            });
        }
        res.json(updatedResult);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating result', error });
    }
});
exports.updateResult = updateResult;
