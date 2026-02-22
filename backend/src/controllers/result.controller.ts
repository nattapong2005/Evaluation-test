import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { Role, AssignmentStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';

const formatResult = (assignment: any) => {
    let totalScore = 0;
    const details = assignment.scores.map((s: any) => {
        totalScore += s.calculatedScore;
        return {
            topic: s.indicator.topic.name,
            indicator: s.indicator.name,
            score: s.rawScore,
            weight: s.indicator.weight,
            calculatedScore: s.calculatedScore,
            remarks: s.remarks
        };
    });

    return {
        assignmentId: assignment.id,
        evaluatee: assignment.evaluatee.name,
        department: assignment.evaluatee.department,
        evaluator: assignment.evaluator.name,
        evaluation: assignment.evaluation.name,
        status: assignment.status,
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
                evaluator: true,
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
                evaluator: true,
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

        const { page = 1, pageSize = 10, department, evaluationId, q } = req.query;
        const skip = (Number(page) - 1) * Number(pageSize);
        const take = Number(pageSize);

        const where: any = {};
        if (department) {
            where.evaluatee = { department: department as string };
        }
        if (evaluationId) {
            where.evaluationId = parseInt(evaluationId as string, 10);
        }
        if (q) {
            where.evaluatee = {
                ...where.evaluatee,
                name: { contains: q as string }
            };
        }

        const [assignments, total] = await Promise.all([
            prisma.assignment.findMany({
                where,
                skip,
                take,
                include: {
                    evaluatee: true,
                    evaluator: true,
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
                },
                orderBy: { id: 'desc' }
            }),
            prisma.assignment.count({ where })
        ]);

        const results = assignments.map(formatResult);
        
        res.json({
            data: results,
            meta: {
                total,
                page: Number(page),
                pageSize: Number(pageSize),
                totalPages: Math.ceil(total / Number(pageSize))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const exportResults = async (req: Request, res: Response): Promise<void> => {
    try {
        if ((req as any).user!.role !== Role.ADMIN) {
            res.status(403).json({ error: 'Only admins can access this route' });
            return;
        }

        const { department, evaluationId } = req.query;

        const where: any = {};
        if (department) {
            where.evaluatee = { department: department as string };
        }
        if (evaluationId) {
            where.evaluationId = parseInt(evaluationId as string, 10);
        }

        const assignments = await prisma.assignment.findMany({
            where,
            include: {
                evaluatee: true,
                evaluator: true,
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

        // Simple CSV generation
        const header = 'AssignmentID,Evaluation,Evaluatee,Department,Evaluator,TotalScore,Status\n';
        const rows = results.map((r: any) => 
            `${r.assignmentId},"${r.evaluation}","${r.evaluatee}","${r.department || ''}","${r.evaluator}",${r.totalScore},${r.status}`
        ).join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('results.csv');
        res.send(header + rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getDepartmentProgress = async (req: Request, res: Response): Promise<void> => {
    try {
        if ((req as any).user!.role !== Role.ADMIN) {
            res.status(403).json({ error: 'Only admins can access this route' });
            return;
        }

        const { evaluationId } = req.query;
        const where: any = {};
        if (evaluationId) {
            where.evaluationId = parseInt(evaluationId as string, 10);
        }

        const assignments = await prisma.assignment.findMany({
            where,
            include: {
                evaluatee: {
                    select: { department: true }
                }
            }
        });

        // Group by department
        const stats: Record<string, { total: number, submitted: number }> = {};

        assignments.forEach(a => {
            const dept = a.evaluatee.department || 'Unassigned';
            if (!stats[dept]) {
                stats[dept] = { total: 0, submitted: 0 };
            }
            stats[dept].total++;
            if (a.status === AssignmentStatus.SUBMITTED || a.status === AssignmentStatus.LOCKED) {
                stats[dept].submitted++;
            }
        });

        const report = Object.keys(stats).map(dept => ({
            department: dept,
            total: stats[dept].total,
            submitted: stats[dept].submitted,
            percentage: stats[dept].total === 0 ? 0 : (stats[dept].submitted / stats[dept].total) * 100
        }));

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getResultsByTopic = async (req: Request, res: Response): Promise<void> => {
    try {
        if ((req as any).user!.role !== Role.ADMIN) {
            res.status(403).json({ error: 'Only admins can access this route' });
            return;
        }

        const { evaluationId } = req.query;
        const where: any = {
            status: { in: [AssignmentStatus.SUBMITTED, AssignmentStatus.LOCKED] }
        };
        
        if (evaluationId) {
            where.evaluationId = parseInt(evaluationId as string, 10);
        }

        const assignments = await prisma.assignment.findMany({
            where,
            include: {
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

        const topicStats: Record<string, { totalScore: number, count: number, fullScore: number }> = {};

        assignments.forEach(a => {
            a.scores.forEach(s => {
                const topicName = s.indicator.topic.name;
                if (!topicStats[topicName]) {
                    topicStats[topicName] = { totalScore: 0, count: 0, fullScore: 0 };
                }
                topicStats[topicName].totalScore += s.calculatedScore;
            });
        });
        
        const topicCounts: Record<string, number> = {};
        
        assignments.forEach(a => {
             const topicsInThisAssignment = new Set<string>();
             a.scores.forEach(s => topicsInThisAssignment.add(s.indicator.topic.name));
             topicsInThisAssignment.forEach(t => {
                 topicCounts[t] = (topicCounts[t] || 0) + 1;
             });
        });

        const report = Object.keys(topicStats).map(topic => ({
            topic,
            average: topicCounts[topic] ? topicStats[topic].totalScore / topicCounts[topic] : 0,
        }));

        res.json(report);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const exportAssignmentPDF = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assignmentId } = req.params;
        const userId = (req as any).user!.id;
        const userRole = (req as any).user!.role;

        const assignment = await prisma.assignment.findUnique({
            where: { id: parseInt(assignmentId as string, 10) },
            include: {
                evaluation: {
                    include: {
                        topics: {
                            include: {
                                indicators: true
                            }
                        }
                    }
                },
                evaluator: true,
                evaluatee: true,
                scores: {
                    include: {
                        indicator: true
                    }
                }
            }
        });

        if (!assignment) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }

        // Authorization check
        if (userRole !== Role.ADMIN) {
            if (userRole === Role.EVALUATOR && assignment.evaluatorId !== userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
            if (userRole === Role.EVALUATEE && assignment.evaluateeId !== userId) {
                res.status(403).json({ error: 'Forbidden' });
                return;
            }
        }

        // Generate PDF
        const doc = new PDFDocument();
        const filename = `Report_${assignment.evaluatee.name}_${assignment.id}.pdf`;

        res.setHeader('Content-disposition', 'attachment; filename="' + encodeURIComponent(filename) + '"');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);
        
        doc.fontSize(20).text('Evaluation Report', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text(`Evaluation: ${assignment.evaluation.name}`);
        doc.fontSize(12).text(`Period: ${assignment.evaluation.startDate.toDateString()} - ${assignment.evaluation.endDate.toDateString()}`);
        doc.moveDown();

        doc.text(`Evaluatee: ${assignment.evaluatee.name} (${assignment.evaluatee.department || 'No Dept'})`);
        doc.text(`Evaluator: ${assignment.evaluator.name}`);
        doc.text(`Status: ${assignment.status}`);
        doc.moveDown();

        doc.fontSize(16).text('Score Summary');
        doc.moveDown(0.5);

        let totalScore = 0;
        const totalPossible = 60; 

        assignment.evaluation.topics.forEach(topic => {
            doc.fontSize(14).text(`Topic: ${topic.name}`);
            
            topic.indicators.forEach(ind => {
                const score = assignment.scores.find(s => s.indicatorId === ind.id);
                const raw = score ? score.rawScore : '-';
                const calc = score ? score.calculatedScore.toFixed(2) : '0.00';
                const remarks = score?.remarks ? `(Note: ${score.remarks})` : '';
                
                if (score) totalScore += score.calculatedScore;

                doc.fontSize(12).text(`  - ${ind.name} (Weight: ${ind.weight})`);
                doc.fontSize(10).text(`    Score: ${raw} | Calculated: ${calc} ${remarks}`);
            });
            doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.fontSize(14).text(`Total Calculated Score: ${totalScore.toFixed(2)} / ${totalPossible}`);

        doc.end();

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
