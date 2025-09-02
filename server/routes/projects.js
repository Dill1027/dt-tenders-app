const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { auth, canEditProject } = require('../middleware/auth');

const router = express.Router();

// Get all projects (with pagination and search)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    
    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { nameOfAwardedTender: { $regex: search, $options: 'i' } },
        { siteDetails: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('createdBy', 'firstName lastName username role')
      .populate('lastModifiedBy', 'firstName lastName username role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    res.json({
      projects,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'firstName lastName username role')
      .populate('lastModifiedBy', 'firstName lastName username role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new project (Part 1)
router.post('/', [
  auth,
  canEditProject('part1'),
  body('nameOfAwardedTender').notEmpty().trim().withMessage('Name of Awarded Tender is required'),
  body('siteDetails').notEmpty().trim().withMessage('Site Details is required'),
  body('createProjectInDislio').isIn(['Yes', 'No']).withMessage('Create Project in Dislio must be Yes or No'),
  body('performanceBondSubmission').optional().isIn(['Yes', 'No', 'N/A']),
  body('agreementSigned').optional().isIn(['Yes', 'No', 'N/A'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const projectData = {
      ...req.body,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      part1Completed: true,
      part1CompletedAt: new Date(),
      status: 'in_progress'
    };

    const project = new Project(projectData);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'firstName lastName username role')
      .populate('lastModifiedBy', 'firstName lastName username role');

    res.status(201).json({
      message: 'Project created successfully',
      project: populatedProject
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project Part 1 (Project Creation)
router.put('/:id/part1', [
  auth,
  canEditProject('part1'),
  body('nameOfAwardedTender').notEmpty().trim().withMessage('Name of Awarded Tender is required'),
  body('siteDetails').notEmpty().trim().withMessage('Site Details is required'),
  body('createProjectInDislio').isIn(['Yes', 'No']).withMessage('Create Project in Dislio must be Yes or No'),
  body('performanceBondSubmission').optional().isIn(['Yes', 'No', 'N/A']),
  body('agreementSigned').optional().isIn(['Yes', 'No', 'N/A']),
  body('noteForFinanceTeam_part1').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const updates = {
      nameOfAwardedTender: req.body.nameOfAwardedTender,
      performanceBondSubmission: req.body.performanceBondSubmission || 'N/A',
      agreementSigned: req.body.agreementSigned || 'N/A',
      siteDetails: req.body.siteDetails,
      createProjectInDislio: req.body.createProjectInDislio,
      noteForFinanceTeam_part1: req.body.noteForFinanceTeam_part1 || '',
      lastModifiedBy: req.user._id,
      part1Completed: true,
      part1CompletedAt: new Date()
    };

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username role')
     .populate('lastModifiedBy', 'username role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      message: 'Project Part 1 updated successfully',
      project
    });

  } catch (error) {
    console.error('Update project Part 1 error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project Part 2 (Finance Section)
router.put('/:id/part2', [
  auth,
  canEditProject('part2'),
  body('checkWithStoreManager').isIn(['Yes', 'No']).withMessage('Check with Store Manager must be Yes or No'),
  body('readyOrNot').isBoolean().withMessage('Ready or Not must be a boolean'),
  body('purchasingNote').notEmpty().trim().withMessage('Purchasing Note is required'),
  body('noteForFinanceTeam_part2').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update Part 2 fields
    project.checkWithStoreManager = req.body.checkWithStoreManager;
    project.readyOrNot = req.body.readyOrNot;
    project.purchasingNote = req.body.purchasingNote || '';
    project.noteForFinanceTeam_part2 = req.body.noteForFinanceTeam_part2 || '';
    project.part2Completed = true;
    project.part2CompletedAt = new Date();
    project.lastModifiedBy = req.user._id;

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'firstName lastName username role')
      .populate('lastModifiedBy', 'firstName lastName username role');

    res.json({
      message: 'Part 2 updated successfully',
      project: populatedProject
    });

  } catch (error) {
    console.error('Update Part 2 error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project Part 3 (Project Team Section)
router.put('/:id/part3', [
  auth,
  canEditProject('part3'),
  body('selectTeam').isIn(['Company', 'Subcontractor']).withMessage('Select Team must be Company or Subcontractor'),
  body('structurePanel').notEmpty().trim().withMessage('Structure Panel is required'),
  body('timeline').notEmpty().trim().withMessage('Timeline is required'),
  body('siteInstallationNote').notEmpty().trim().withMessage('Site Installation Note is required'),
  body('noteForFinanceTeam_part3').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update Part 3 fields
    project.selectTeam = req.body.selectTeam;
    project.structurePanel = req.body.structurePanel || '';
    project.timeline = req.body.timeline || '';
    project.siteInstallationNote = req.body.siteInstallationNote || '';
    project.noteForFinanceTeam_part3 = req.body.noteForFinanceTeam_part3 || '';
    project.part3Completed = true;
    project.part3CompletedAt = new Date();
    project.lastModifiedBy = req.user._id;

    // Check if all parts are completed
    if (project.part1Completed && project.part2Completed && project.part3Completed) {
      project.status = 'completed';
    }

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'firstName lastName username role')
      .populate('lastModifiedBy', 'firstName lastName username role');

    res.json({
      message: 'Part 3 updated successfully',
      project: populatedProject
    });

  } catch (error) {
    console.error('Update Part 3 error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Invoice & Payment (Project and Finance teams only)
router.put('/:id/invoice-payment', [
  auth,
  canEditProject('invoice_payment'),
  body('invoiceCreate').isIn(['Done', 'Not Yet']).withMessage('Invoice Create must be Done or Not Yet'),
  body('paymentStatus').isIn(['Done', 'Half', 'None', '80%', '20%']).withMessage('Invalid payment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.invoiceCreate = req.body.invoiceCreate;
    project.paymentStatus = req.body.paymentStatus;
    project.lastModifiedBy = req.user._id;

    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'firstName lastName username role')
      .populate('lastModifiedBy', 'firstName lastName username role');

    res.json({
      message: 'Invoice & Payment updated successfully',
      project: populatedProject
    });

  } catch (error) {
    console.error('Update Invoice & Payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project (admin only or creator)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user can delete (creator or admin role)
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own projects.' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
