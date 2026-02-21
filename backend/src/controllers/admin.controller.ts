import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import prisma from '../utils/prisma';

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
            data: { isOpen },
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
        const { name } = req.body;

        const evaluation = await prisma.evaluation.findUnique({ where: { id: parseInt(evaluationId as string, 10) } });
        if (!evaluation) {
            res.status(404).json({ error: 'Evaluation not found' });
            return;
        }

        const topic = await prisma.topic.create({
            data: {
                name,
                evaluationId: parseInt(evaluationId as string, 10),
            },
        });

        res.status(201).json(topic);
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

export const getEvaluations = async (req: Request, res: Response): Promise<void> => {
    try {
        const evaluations = await prisma.evaluation.findMany({
            include: {
                _count: {
                    select: { assignments: true, topics: true }
                }
            }
        });
        res.json(evaluations);
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
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, role } = req.body;

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
            data: { email, password: hashedPassword, name, role },
            select: { id: true, email: true, name: true, role: true }
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
        const { email, password, name, role } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id as string, 10) },
            data: updateData,
            select: { id: true, email: true, name: true, role: true }
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
