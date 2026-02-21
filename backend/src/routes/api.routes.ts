import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth';
import { Role } from '@prisma/client';

import { createEvaluation, updateEvaluationStatus, createTopic, createIndicator, getEvaluations, getEvaluationDetails, getUsers, createUser, updateUser, deleteUser } from '../controllers/admin.controller';
import { createAssignment, getMyAssignments } from '../controllers/assignment.controller';
import { uploadEvidence } from '../controllers/evidence.controller';
import { submitScore } from '../controllers/score.controller';
import { getMyResults, getMyEvaluations, getAllResults } from '../controllers/result.controller';

const router = Router();

const wrap = (fn: any) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next);

router.use(wrap(authenticateToken)); // requires JWT for all /api routes

// ADMIN routes
router.get('/evaluations', wrap(requireRole([Role.ADMIN])), wrap(getEvaluations));
router.get('/evaluations/:id', wrap(requireRole([Role.ADMIN])), wrap(getEvaluationDetails));
router.get('/users', wrap(requireRole([Role.ADMIN])), wrap(getUsers));
router.post('/users', wrap(requireRole([Role.ADMIN])), wrap(createUser));
router.put('/users/:id', wrap(requireRole([Role.ADMIN])), wrap(updateUser));
router.delete('/users/:id', wrap(requireRole([Role.ADMIN])), wrap(deleteUser));
router.post('/evaluations', wrap(requireRole([Role.ADMIN])), wrap(createEvaluation));
router.patch('/evaluations/:id/status', wrap(requireRole([Role.ADMIN])), wrap(updateEvaluationStatus));
router.post('/evaluations/:evaluationId/topics', wrap(requireRole([Role.ADMIN])), wrap(createTopic));
router.post('/topics/:topicId/indicators', wrap(requireRole([Role.ADMIN])), wrap(createIndicator));
router.post('/assignments', wrap(requireRole([Role.ADMIN])), wrap(createAssignment));

// EVALUATOR routes
router.get('/assignments/my', wrap(requireRole([Role.EVALUATOR, Role.EVALUATEE])), wrap(getMyAssignments));
router.post('/assignments/:assignmentId/score', wrap(requireRole([Role.EVALUATOR])), wrap(submitScore));
router.get('/results/my-evaluations', wrap(requireRole([Role.EVALUATOR])), wrap(getMyEvaluations));

// EVALUATEE routes
router.post('/indicators/:indicatorId/evidence', wrap(requireRole([Role.EVALUATEE])), wrap(uploadEvidence));
router.get('/results/me', wrap(requireRole([Role.EVALUATEE])), wrap(getMyResults));

// RESULTS global (ADMIN)
router.get('/results', wrap(requireRole([Role.ADMIN])), wrap(getAllResults));

export default router;
