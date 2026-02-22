import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Role, AssignmentStatus } from '@prisma/client';

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { evaluationId, evaluatorId, evaluateeId, isActive } = req.body;

        const evaluation = await prisma.evaluation.findUnique({ where: { id: parseInt(evaluationId as string, 10) } });
        if (!evaluation) {
            res.status(404).json({ error: 'Evaluation not found' });
            return;
        }

        const evaluator = await prisma.user.findUnique({ where: { id: parseInt(evaluatorId as string, 10) } });
        if (!evaluator || evaluator.role !== Role.EVALUATOR) {
            res.status(400).json({ error: 'Invalid evaluator' });
            return;
        }

        const evaluatee = await prisma.user.findUnique({ where: { id: parseInt(evaluateeId as string, 10) } });
        if (!evaluatee || evaluatee.role !== Role.EVALUATEE) {
            res.status(400).json({ error: 'Invalid evaluatee' });
            return;
        }

        const assignment = await prisma.assignment.create({
            data: {
                evaluationId: parseInt(evaluationId as string, 10),
                evaluatorId: parseInt(evaluatorId as string, 10),
                evaluateeId: parseInt(evaluateeId as string, 10),
                isActive: isActive ?? true
            },
        });

        res.status(201).json(assignment);
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'DUPLICATE_ASSIGNMENT' });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assignmentId } = req.params;
        const { evaluatorId, evaluateeId, isActive } = req.body;

        const id = parseInt(assignmentId as string, 10);
        const existingAssignment = await prisma.assignment.findUnique({ where: { id } });

        if (!existingAssignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }

        const updateData: any = {};

        if (isActive !== undefined) updateData.isActive = isActive;

        if (evaluatorId) {
            const evaluator = await prisma.user.findUnique({ where: { id: parseInt(evaluatorId, 10) } });
            if (!evaluator || evaluator.role !== Role.EVALUATOR) {
                res.status(400).json({ error: 'Invalid evaluator' });
                return;
            }
            updateData.evaluatorId = parseInt(evaluatorId, 10);
        }

        if (evaluateeId) {
            const evaluatee = await prisma.user.findUnique({ where: { id: parseInt(evaluateeId, 10) } });
            if (!evaluatee || evaluatee.role !== Role.EVALUATEE) {
                res.status(400).json({ error: 'Invalid evaluatee' });
                return;
            }
            updateData.evaluateeId = parseInt(evaluateeId, 10);
        }

        const assignment = await prisma.assignment.update({
            where: { id },
            data: updateData,
        });

        res.json(assignment);
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'DUPLICATE_ASSIGNMENT' });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMyAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user!.id;
        const role = (req as any).user!.role;
        const status = req.query.status as string; // draft, submitted, locked
        const periodId = req.query.periodId as string;

        const where: any = {
            isActive: true // Default to active assignments only
        };

        if (periodId) {
            where.evaluationId = parseInt(periodId, 10);
        }

        if (status) {
            where.status = status.toUpperCase() as AssignmentStatus;
        }

        if (role === Role.EVALUATOR) {
            where.evaluatorId = userId;
        } else if (role === Role.EVALUATEE) {
            where.evaluateeId = userId;
        } else {
            res.status(403).json({ error: 'Unauthorized role for this action' });
            return;
        }

        const assignments = await prisma.assignment.findMany({
            where,
            include: {
                evaluation: {
                    include: {
                        topics: {
                            where: { isActive: true },
                            include: {
                                indicators: {
                                    include: {
                                        evidences: {
                                            where: { evaluateeId: role === Role.EVALUATEE ? userId : undefined }
                                        },
                                        scores: {
                                            where: { assignment: { evaluatorId: role === Role.EVALUATOR ? userId : undefined } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                evaluator: true,
                evaluatee: true
            }
        });

        res.json(assignments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const submitAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assignmentId } = req.params;
        const evaluatorId = (req as any).user!.id;

        const assignment = await prisma.assignment.findUnique({
            where: { id: parseInt(assignmentId as string, 10) }
        });

        if (!assignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }

        if (assignment.evaluatorId !== evaluatorId) {
            res.status(403).json({ error: 'You are not the assigned evaluator' });
            return;
        }

        if (assignment.status === AssignmentStatus.SUBMITTED || assignment.status === AssignmentStatus.LOCKED) {
            res.status(400).json({ error: 'Assignment already submitted or locked' });
            return;
        }

        const updatedAssignment = await prisma.assignment.update({
            where: { id: assignment.id },
            data: {
                status: AssignmentStatus.SUBMITTED
            }
        });

        res.json(updatedAssignment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
