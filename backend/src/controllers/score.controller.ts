import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { IndicatorType, AssignmentStatus } from '@prisma/client';

export const submitScore = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assignmentId } = req.params;
        const { indicatorId, score, remarks } = req.body;
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

        // Check if assignment is locked or submitted? 
        // Usually edits are allowed in DRAFT, maybe not in SUBMITTED/LOCKED.
        if (assignment.status === AssignmentStatus.LOCKED || assignment.status === AssignmentStatus.SUBMITTED) {
             res.status(403).json({ error: 'Assignment is submitted or locked. Cannot edit scores.' });
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
            // Formula: ((score - 1) / 3) * weight
            calculatedScore = ((score - 1) / 3) * indicator.weight;
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
        // Req 3.3: If indicator.type = yes_no AND yes_no = 1 AND no file -> 400
        // Also generalized: if requireEvidence is true, check file.
        // The req specifically says "If yes_no = 1 ... but no file".
        // It implies for score_1_4, maybe evidence is always required if 'requireEvidence' is true?
        // Let's stick to the stricter req: "If yes_no = 1".
        // But also generic "requireEvidence" flag.
        
        if (indicator.requireEvidence) {
             // For YES_NO, only if score == 1 (True).
             // If score == 0 (False), maybe evidence not needed?
             // But for SCALE_1_4, evidence is needed regardless of score?
             // Let's assume strict check based on 'requireEvidence' flag for now, 
             // but if YES_NO and 0, maybe skip?
             // Req 3.3 explicitly says: "if indicator.type = yes_no AND value = 1 AND no file".
             // This implies if value = 0, no file needed.
             
             let evidenceNeeded = true;
             if (indicator.indicatorType === IndicatorType.YES_NO && score === 0) {
                 evidenceNeeded = false;
             }
             
             if (evidenceNeeded) {
                const evidence = await prisma.evidence.findUnique({
                    where: {
                        indicatorId_evaluateeId: {
                            indicatorId: indicator.id,
                            evaluateeId: assignment.evaluateeId
                        }
                    }
                });

                if (!evidence) {
                    res.status(400).json({ error: 'EVIDENCE_REQUIRED' });
                    return;
                }
             }
        }

        const existingScore = await prisma.score.findUnique({
            where: {
                assignmentId_indicatorId: {
                    assignmentId: assignment.id,
                    indicatorId: indicator.id
                }
            }
        });

        let savedScore;

        if (existingScore) {
            // Check for changes
            const scoreChanged = existingScore.rawScore !== score;
            const remarksChanged = (existingScore.remarks || '') !== (remarks || '');

            if (scoreChanged || remarksChanged) {
                // Record history before update
                await prisma.scoreHistory.create({
                    data: {
                        scoreId: existingScore.id,
                        updaterId: evaluatorId,
                        oldScore: existingScore.rawScore,
                        newScore: score,
                        oldRemarks: existingScore.remarks,
                        newRemarks: remarks || null
                    }
                });

                savedScore = await prisma.score.update({
                    where: { id: existingScore.id },
                    data: {
                        rawScore: score,
                        calculatedScore: calculatedScore,
                        remarks: remarks || null
                    }
                });
            } else {
                savedScore = existingScore; // No change
            }
        } else {
            savedScore = await prisma.score.create({
                data: {
                    assignmentId: assignment.id,
                    indicatorId: indicator.id,
                    rawScore: score,
                    calculatedScore: calculatedScore,
                    remarks: remarks || null
                }
            });
        }

        res.status(201).json(savedScore);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAssignmentHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assignmentId } = req.params;
        const userId = (req as any).user!.id;
        const userRole = (req as any).user!.role;

        const assignment = await prisma.assignment.findUnique({
            where: { id: parseInt(assignmentId as string, 10) },
            include: {
                scores: {
                    include: {
                        indicator: {
                            include: {
                                topic: true
                            }
                        },
                        history: {
                            include: {
                                updater: true
                            },
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        });

        if (!assignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }

        // Authorization
        if (userRole !== 'ADMIN') {
            if (userRole === 'EVALUATOR' && assignment.evaluatorId !== userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            if (userRole === 'EVALUATEE' && assignment.evaluateeId !== userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
        }

        const history = assignment.scores.flatMap(score => 
            score.history.map(h => ({
                id: h.id,
                topic: score.indicator.topic.name,
                indicator: score.indicator.name,
                oldScore: h.oldScore,
                newScore: h.newScore,
                oldRemarks: h.oldRemarks,
                newRemarks: h.newRemarks,
                updatedBy: h.updater.name,
                updatedAt: h.createdAt
            }))
        ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
