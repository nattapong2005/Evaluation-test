import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Role } from '@prisma/client';

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { evaluationId, evaluatorId, evaluateeId } = req.body;

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
            },
        });

        res.status(201).json(assignment);
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Assignment already exists' });
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

        const where: any = {};
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
