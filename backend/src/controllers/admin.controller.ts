import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Role, EvaluationStatus } from '@prisma/client';
import prisma from '../utils/prisma';

// Helper for pagination
const getPagination = (req: Request) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    return {
        skip: (page - 1) * pageSize,
        take: pageSize,
        page,
        pageSize
    };
};

export const createEvaluation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, startDate, endDate, isOpen } = req.body;

        const evaluation = await prisma.evaluation.create({
            data: {
                name,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isOpen: isOpen ?? false,
                status: isOpen ? EvaluationStatus.ACTIVE : EvaluationStatus.CLOSED
            },
        });

        res.status(201).json(evaluation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateEvaluationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { isOpen } = req.body;

        if (typeof isOpen !== 'boolean') {
            res.status(400).json({ error: 'isOpen boolean is required' });
            return;
        }

        const evaluation = await prisma.evaluation.update({
            where: { id: parseInt(id as string, 10) },
            data: { 
                isOpen,
                status: isOpen ? EvaluationStatus.ACTIVE : EvaluationStatus.CLOSED
            },
        });

        res.json(evaluation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createTopic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { evaluationId } = req.params;
        const { name, weight, isActive } = req.body;

        const evaluation = await prisma.evaluation.findUnique({ where: { id: parseInt(evaluationId as string, 10) } });
        if (!evaluation) {
            res.status(404).json({ error: 'Evaluation not found' });
            return;
        }

        const topic = await prisma.topic.create({
            data: {
                name,
                weight: weight ?? 0,
                isActive: isActive ?? true,
                evaluationId: parseInt(evaluationId as string, 10),
            },
        });

        res.status(201).json(topic);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateTopic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { topicId } = req.params;
        const { name, weight, isActive } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (weight !== undefined) updateData.weight = weight;
        if (isActive !== undefined) updateData.isActive = isActive;

        const topic = await prisma.topic.update({
            where: { id: parseInt(topicId as string, 10) },
            data: updateData,
        });

        res.json(topic);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createIndicator = async (req: Request, res: Response): Promise<void> => {
    try {
        const { topicId } = req.params;
        const { name, indicatorType, weight, requireEvidence } = req.body;

        const topic = await prisma.topic.findUnique({ where: { id: parseInt(topicId as string, 10) } });
        if (!topic) {
            res.status(404).json({ error: 'Topic not found' });
            return;
        }

        const indicator = await prisma.indicator.create({
            data: {
                name,
                indicatorType,
                weight,
                requireEvidence: requireEvidence ?? false,
                topicId: parseInt(topicId as string, 10),
            },
        });

        res.status(201).json(indicator);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateIndicator = async (req: Request, res: Response): Promise<void> => {
    try {
        const { indicatorId } = req.params;
        const { name, indicatorType, weight, requireEvidence } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (indicatorType !== undefined) updateData.indicatorType = indicatorType;
        if (weight !== undefined) updateData.weight = weight;
        if (requireEvidence !== undefined) updateData.requireEvidence = requireEvidence;

        const indicator = await prisma.indicator.update({
            where: { id: parseInt(indicatorId as string, 10) },
            data: updateData,
        });

        res.json(indicator);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getEvaluations = async (req: Request, res: Response): Promise<void> => {
    try {
        const { skip, take, page, pageSize } = getPagination(req);
        const q = req.query.q as string;
        
        const where: any = {};
        if (q) {
            where.name = { contains: q };
        }

        const [evaluations, total] = await Promise.all([
            prisma.evaluation.findMany({
                where,
                skip,
                take,
                include: {
                    _count: {
                        select: { assignments: true, topics: true }
                    }
                },
                orderBy: { id: 'desc' }
            }),
            prisma.evaluation.count({ where })
        ]);

        res.json({
            data: evaluations,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getEvaluationDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const evaluation = await prisma.evaluation.findUnique({
            where: { id: parseInt(id as string, 10) },
            include: {
                topics: {
                    include: {
                        indicators: true
                    }
                },
                assignments: {
                    include: {
                        evaluator: true,
                        evaluatee: true
                    }
                }
            }
        });

        if (!evaluation) {
            res.status(404).json({ error: 'Evaluation not found' });
            return;
        }

        res.json(evaluation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { skip, take, page, pageSize } = getPagination(req);
        const q = req.query.q as string;
        const role = req.query.role as Role;
        const department = req.query.department as string;

        const where: any = {};
        if (q) {
            where.OR = [
                { name: { contains: q } },
                { email: { contains: q } }
            ];
        }
        if (role) {
            where.role = role;
        }
        if (department) {
            where.department = department;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    department: true
                },
                orderBy: { id: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            data: users,
            meta: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, role, department } = req.body;

        if (!email || !password || !name || !role) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        if (!Object.values(Role).includes(role as Role)) {
            res.status(400).json({ error: 'Invalid role' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name, role, department },
            select: { id: true, email: true, name: true, role: true, department: true }
        });

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { email, password, name, role, department } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (department !== undefined) updateData.department = department;

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id as string, 10) },
            data: updateData,
            select: { id: true, email: true, name: true, role: true, department: true }
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.user.delete({
            where: { id: parseInt(id as string, 10) }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateEvaluation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description, startDate, endDate, isOpen, status } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (startDate !== undefined) updateData.startDate = new Date(startDate);
        if (endDate !== undefined) updateData.endDate = new Date(endDate);
        if (typeof isOpen === 'boolean') {
            updateData.isOpen = isOpen;
            // Also sync status if not explicitly provided
            if (status === undefined) {
                updateData.status = isOpen ? EvaluationStatus.ACTIVE : EvaluationStatus.CLOSED;
            }
        }
        if (status) {
            updateData.status = status;
            // Also sync isOpen if status is provided
            if (status === EvaluationStatus.ACTIVE) updateData.isOpen = true;
            else updateData.isOpen = false;
        }

        const evaluation = await prisma.evaluation.update({
            where: { id: parseInt(id as string, 10) },
            data: updateData,
        });

        res.json(evaluation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteEvaluation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const evalId = parseInt(id as string, 10);

        // Soft delete: Change status to CANCELLED and close it
        await prisma.evaluation.update({
            where: { id: evalId },
            data: {
                status: EvaluationStatus.CANCELLED,
                isOpen: false
            }
        });

        res.json({ message: 'Evaluation cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteTopic = async (req: Request, res: Response): Promise<void> => {
    try {
        const { topicId } = req.params;
        const id = parseInt(topicId as string, 10);

        // Delete indicators first
        await prisma.indicator.deleteMany({
            where: { topicId: id }
        });
        await prisma.topic.delete({
            where: { id }
        });

        res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteIndicator = async (req: Request, res: Response): Promise<void> => {
    try {
        const { indicatorId } = req.params;
        await prisma.indicator.delete({
            where: { id: parseInt(indicatorId as string, 10) }
        });

        res.json({ message: 'Indicator deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { assignmentId } = req.params;
        const id = parseInt(assignmentId as string, 10);

        // Delete scores first
        await prisma.score.deleteMany({
            where: { assignmentId: id }
        });
        await prisma.assignment.delete({
            where: { id }
        });

        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
