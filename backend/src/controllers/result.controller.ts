import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Role } from '@prisma/client';

const formatResult = (assignment: any) => {
    let totalScore = 0;
    const details = assignment.scores.map((s: any) => {
        totalScore += s.calculatedScore;
        return {
            topic: s.indicator.topic.name,
            indicator: s.indicator.name,
            score: s.rawScore,
            weight: s.indicator.weight,
            calculatedScore: s.calculatedScore
        };
    });

    return {
        evaluatee: assignment.evaluatee.name,
        evaluation: assignment.evaluation.name,
        totalScore,
        details
    };
};

// GET /api/results/me -> Evaluatees
export const getMyResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user!.id;

        if ((req as any).user!.role !== Role.EVALUATEE) {
            res.status(403).json({ error: 'Only evaluatees can access this route' });
            return;
        }

        const assignments = await prisma.assignment.findMany({
            where: { evaluateeId: userId },
            include: {
                evaluatee: true,
                evaluation: true,
                scores: {
                    include: {
                        indicator: {
                            include: {
                                topic: true
                            }
                        }
                    }
                }
            }
        });

        const results = assignments.map(formatResult);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/results/my-evaluations -> Evaluators
export const getMyEvaluations = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user!.id;

        if ((req as any).user!.role !== Role.EVALUATOR) {
            res.status(403).json({ error: 'Only evaluators can access this route' });
            return;
        }

        const assignments = await prisma.assignment.findMany({
            where: { evaluatorId: userId },
            include: {
                evaluatee: true,
                evaluation: true,
                scores: {
                    include: {
                        indicator: {
                            include: {
                                topic: true
                            }
                        }
                    }
                }
            }
        });

        const results = assignments.map(formatResult);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// GET /api/results -> Admins
export const getAllResults = async (req: Request, res: Response): Promise<void> => {
    try {
        if ((req as any).user!.role !== Role.ADMIN) {
            res.status(403).json({ error: 'Only admins can access this route' });
            return;
        }

        const assignments = await prisma.assignment.findMany({
            include: {
                evaluatee: true,
                evaluation: true,
                scores: {
                    include: {
                        indicator: {
                            include: {
                                topic: true
                            }
                        }
                    }
                }
            }
        });

        const results = assignments.map(formatResult);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
