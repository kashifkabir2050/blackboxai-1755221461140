import { Response } from 'express';
import Application from '../models/Application';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, message } = req.body;
    const files = req.files ? (req.files as Express.Multer.File[]).map(file => file.filename) : [];

    const application = new Application({
      userId: req.user!._id,
      subject,
      message,
      files,
      status: 'pending'
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getApplications = async (req: AuthRequest, res: Response) => {
  try {
    let applications;

    if (req.user!.role === 'admin' || req.user!.role === 'principal') {
      // Admin and Principal can see all applications
      applications = await Application.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Users can only see their own applications
      applications = await Application.find({ userId: req.user!._id })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getApplicationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    let application = await Application.findById(id).populate('userId', 'name email');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user has permission to view this application
    if (req.user!.role === 'user' && (application.userId as any)._id.toString() !== (req.user! as any)._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, principalComment } = req.body;

    // Only principal and admin can update status
    if (req.user!.role !== 'principal' && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.principalComment = principalComment;
    application.actionDate = new Date();

    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, message } = req.body;
    const files = req.files ? (req.files as Express.Multer.File[]).map(file => file.filename) : [];

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user owns this application
    if (application.userId.toString() !== (req.user! as any)._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only allow updates if status is 'returned'
    if (application.status !== 'returned') {
      return res.status(400).json({ message: 'Application can only be updated when returned' });
    }

    application.subject = subject || application.subject;
    application.message = message || application.message;
    if (files.length > 0) {
      application.files = files;
    }
    application.status = 'pending';
    application.principalComment = '';
    application.actionDate = undefined;

    await application.save();

    res.json({
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getApplicationStats = async (req: AuthRequest, res: Response) => {
  try {
    // Only admin and principal can view stats
    if (req.user!.role !== 'admin' && req.user!.role !== 'principal') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await Application.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });

    const formattedStats = {
      total: totalApplications,
      totalUsers,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      approved: stats.find(s => s._id === 'approved')?.count || 0,
      rejected: stats.find(s => s._id === 'rejected')?.count || 0,
      returned: stats.find(s => s._id === 'returned')?.count || 0
    };

    res.json({ stats: formattedStats });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
