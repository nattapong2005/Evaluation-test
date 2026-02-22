import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth';
import { Role } from '@prisma/client';
import { upload } from '../middleware/fileUpload';

import { createEvaluation, updateEvaluation, deleteEvaluation, updateEvaluationStatus, createTopic, updateTopic, deleteTopic, createIndicator, updateIndicator, deleteIndicator, getEvaluations, getEvaluationDetails, getUsers, createUser, updateUser, deleteUser, deleteAssignment } from '../controllers/admin.controller';
import { createAssignment, getMyAssignments, submitAssignment, updateAssignment } from '../controllers/assignment.controller';
import { uploadEvidence } from '../controllers/evidence.controller';
import { submitScore, getAssignmentHistory } from '../controllers/score.controller';
import { getMyResults, getMyEvaluations, getAllResults, exportResults, getDepartmentProgress, exportAssignmentPDF, getResultsByTopic } from '../controllers/result.controller';

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
router.put('/evaluations/:id', wrap(requireRole([Role.ADMIN])), wrap(updateEvaluation));
router.delete('/evaluations/:id', wrap(requireRole([Role.ADMIN])), wrap(deleteEvaluation));
router.patch('/evaluations/:id/status', wrap(requireRole([Role.ADMIN])), wrap(updateEvaluationStatus));
router.post('/evaluations/:evaluationId/topics', wrap(requireRole([Role.ADMIN])), wrap(createTopic));
router.put('/topics/:topicId', wrap(requireRole([Role.ADMIN])), wrap(updateTopic));
router.delete('/topics/:topicId', wrap(requireRole([Role.ADMIN])), wrap(deleteTopic));
router.post('/topics/:topicId/indicators', wrap(requireRole([Role.ADMIN])), wrap(createIndicator));
router.put('/indicators/:indicatorId', wrap(requireRole([Role.ADMIN])), wrap(updateIndicator));
router.delete('/indicators/:indicatorId', wrap(requireRole([Role.ADMIN])), wrap(deleteIndicator));
router.post('/assignments', wrap(requireRole([Role.ADMIN])), wrap(createAssignment));
router.put('/assignments/:assignmentId', wrap(requireRole([Role.ADMIN])), wrap(updateAssignment));
router.delete('/assignments/:assignmentId', wrap(requireRole([Role.ADMIN])), wrap(deleteAssignment));

// EVALUATOR routes
router.get('/assignments/my', wrap(requireRole([Role.EVALUATOR, Role.EVALUATEE])), wrap(getMyAssignments));
router.post('/assignments/:assignmentId/score', wrap(requireRole([Role.EVALUATOR])), wrap(submitScore));
router.get('/assignments/:assignmentId/history', wrap(requireRole([Role.EVALUATOR, Role.EVALUATEE, Role.ADMIN])), wrap(getAssignmentHistory));
router.post('/assignments/:assignmentId/submit', wrap(requireRole([Role.EVALUATOR])), wrap(submitAssignment));
router.get('/results/my-evaluations', wrap(requireRole([Role.EVALUATOR])), wrap(getMyEvaluations));

// EVALUATEE routes
router.post('/indicators/:indicatorId/evidence', wrap(requireRole([Role.EVALUATEE])), upload.single('file'), wrap(uploadEvidence));
router.get('/results/me', wrap(requireRole([Role.EVALUATEE])), wrap(getMyResults));

// RESULTS global
router.get('/results/:assignmentId/pdf', wrap(exportAssignmentPDF)); // Accessible by all (controller checks permission)
router.get('/results/progress', wrap(requireRole([Role.ADMIN])), wrap(getDepartmentProgress));
router.get('/results/topic-analysis', wrap(requireRole([Role.ADMIN])), wrap(getResultsByTopic));
router.get('/results/export', wrap(requireRole([Role.ADMIN])), wrap(exportResults));
router.get('/results', wrap(requireRole([Role.ADMIN])), wrap(getAllResults));

export default router;
