const Application = require('../models/Application');
const Student = require('../models/Student'); // import the Student model

// @desc    For a student to submit a new application (Public)
// @route   POST /api/applications
const submitApplication = async (req, res) => {
  try {
    const application = await Application.create(req.body);
    res.status(201).json({ message: "Your application was submitted successfully!", application });
  } catch (error) {
    res.status(500).json({ message: "Server error, please try again", error: error.message });
  }
};

// @desc    View all submitted applications
// @route   GET /api/applications
const getApplications = async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    For admin/teacher to allocate a batch and approve
// @route   PUT /api/applications/:id/approve
const approveBatch = async (req, res) => {
  try {
    const { batchNumber } = req.body;
    
    // 1. Approve the application
    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id, 
      { status: 'Approved', batchNumber: batchNumber }, 
      { new: true }
    );

    // 2. Automatically add them to the students database (under Computer category)
    if (updatedApp) {
      // Auto-generate serial number, same logic as adding a student manually
      const lastStudent = await Student.findOne({
        category: 'Computer',
        certificateSerialNo: { $regex: /^GVS-KDC-/ }
      }).sort({ createdAt: -1 });

      let nextNum = 1;
      if (lastStudent && lastStudent.certificateSerialNo) {
        const parts = lastStudent.certificateSerialNo.split('-');
        if (parts.length === 3) {
          nextNum = parseInt(parts[2], 10) + 1; // increment from the last number
        }
      }
      const certificateSerialNo = `GVS-KDC-${String(nextNum).padStart(6, '0')}`;

      await Student.create({
        name: updatedApp.studentName,
        fatherName: updatedApp.fatherName,
        className: updatedApp.education,
        gender: 'Not Specified', // default, since the application form doesn't ask for gender
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1), // current year
        phone: updatedApp.phoneNumber,
        village: updatedApp.village,
        addedBy: 'Auto-Approved',
        category: 'Computer', // these are computer course students
        batchNumber: batchNumber, // the batch we just allocated
        certificateSerialNo: certificateSerialNo
      });
    }

    res.json({ message: "Batch allocated & students added to the list!", application: updatedApp });
  } catch (error) {
    res.status(500).json({ message: "Batch allocation failed.", error: error.message });
  }
};

module.exports = { submitApplication, getApplications, approveBatch };