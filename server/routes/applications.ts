import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, authorize } from '../middleware/auth';
import {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  updateApplication,
  getApplicationStats
} from '../controllers/applicationController';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only PDF and DOC files
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/msword' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOC files are allowed'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All routes require authentication
router.use(authenticate);

// Application routes
router.post('/', upload.array('files', 5), createApplication);
router.get('/', getApplications);
router.get('/stats', authorize('admin', 'principal'), getApplicationStats);
router.get('/:id', getApplicationById);
router.put('/:id/status', authorize('admin', 'principal'), updateApplicationStatus);
router.put('/:id', upload.array('files', 5), updateApplication);

export default router;
