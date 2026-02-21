import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const uploadEvidence = async (req: Request, res: Response): Promise<void> => {
    try {
        const { indicatorId } = req.params;
        const { fileUrl } = req.body;
        const evaluateeId = (req as any).user!.id;

        if (!fileUrl) {
            res.status(400).json({ error: 'fileUrl is required' });
            return;
        }

        const indId = parseInt(indicatorId as string, 10);
        const indicator = await prisma.indicator.findUnique({
            where: { id: indId },
            include: {
                topic: {
                    include: {
                        evaluation: true
                    }
                }
            }
        });

        if (!indicator) {
            res.status(404).json({ error: 'Indicator not found' });
            return;
        }

        const evaluation = indicator.topic.evaluation;
        const now = new Date();
        const isWithinDateRange = now >= evaluation.startDate && now <= evaluation.endDate;

        // Check if open logic applies
        if (!evaluation.isOpen || !isWithinDateRange) {
            res.status(403).json({ error: 'Evaluation is closed or outside of date range. Cannot upload evidence.' });
            return;
        }

        // Check if assigned to this evaluation
        const assignment = await prisma.assignment.findFirst({
            where: {
                evaluationId: evaluation.id,
                evaluateeId: evaluateeId
            }
        });

        if (!assignment) {
            res.status(403).json({ error: 'You are not assigned to this evaluation' });
            return;
        }

        const evidence = await prisma.evidence.upsert({
            where: {
                indicatorId_evaluateeId: {
                    indicatorId: indId,
                    evaluateeId: evaluateeId
                }
            },
            update: {
                fileUrl: fileUrl,
                uploadedAt: new Date()
            },
            create: {
                indicatorId: indId,
                evaluateeId: evaluateeId,
                fileUrl: fileUrl
            }
        });

        res.status(201).json(evidence);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
