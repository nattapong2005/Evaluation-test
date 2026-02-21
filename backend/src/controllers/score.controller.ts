import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { IndicatorType } from '@prisma/client';

export const submitScore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assignmentId } = req.params;
        const { indicatorId, score } = req.body;
        const evaluatorId = (req as any).user!.id;

        if (typeof score !== 'number') {
            res.status(400).json({ error: 'score must be a number' });
            return;
        }

        const assignment = await prisma.assignment.findUnique({
            where: { id: parseInt(assignmentId as string, 10) },
            include: {
                evaluation: true,
            }
        });

        if (!assignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }

        if (assignment.evaluatorId !== evaluatorId) {
            res.status(403).json({ error: 'You are not the assigned evaluator' });
            return;
        }

        const evaluation = assignment.evaluation;
        const now = new Date();
        const isWithinDateRange = now >= evaluation.startDate && now <= evaluation.endDate;

        if (!evaluation.isOpen || !isWithinDateRange) {
            res.status(403).json({ error: 'Evaluation is closed or outside of date range. Scoring not allowed.' });
            return;
        }

        const indicator = await prisma.indicator.findUnique({
            where: { id: indicatorId },
            include: {
                topic: true
            }
        });

        if (!indicator || indicator.topic.evaluationId !== assignment.evaluationId) {
            res.status(400).json({ error: 'Invalid indicator for this assignment' });
            return;
        }

        // Validation for indicator type
        let calculatedScore = 0;
        if (indicator.indicatorType === IndicatorType.SCALE_1_4) {
            if (score < 1 || score > 4) {
                res.status(400).json({ error: 'Score must be between 1 and 4 for SCALE_1_4' });
                return;
            }
            calculatedScore = (score / 4) * indicator.weight;
        } else if (indicator.indicatorType === IndicatorType.YES_NO) {
            if (score !== 0 && score !== 1) {
                res.status(400).json({ error: 'Score must be 0 or 1 for YES_NO' });
                return;
            }
            calculatedScore = (score === 1 ? 1 : 0) * indicator.weight;
        } else {
            res.status(400).json({ error: 'Unknown indicator type' });
            return;
        }

        // Evidence check
        if (indicator.requireEvidence) {
            const evidence = await prisma.evidence.findUnique({
                where: {
                    indicatorId_evaluateeId: {
                        indicatorId: indicator.id,
                        evaluateeId: assignment.evaluateeId
                    }
                }
            });

            if (!evidence) {
                res.status(400).json({ error: 'Evidence is required for this indicator before scoring' });
                return;
            }
        }

        const newScore = await prisma.score.upsert({
            where: {
                assignmentId_indicatorId: {
                    assignmentId: assignment.id,
                    indicatorId: indicator.id
                }
            },
            update: {
                rawScore: score,
                calculatedScore: calculatedScore
            },
            create: {
                assignmentId: assignment.id,
                indicatorId: indicator.id,
                rawScore: score,
                calculatedScore: calculatedScore
            }
        });

        res.status(201).json(newScore);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
