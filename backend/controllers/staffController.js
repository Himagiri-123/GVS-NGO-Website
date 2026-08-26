const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');

// Only these categories get an Experience Certificate
const CERT_ELIGIBLE_CATEGORIES = ['Coordinator', 'VVK Instructor', 'Computer Teacher'];

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 }); 
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addStaff = async (req, res) => {
  try {
    // Auto-generate the experience certificate ID for eligible categories
    if (CERT_ELIGIBLE_CATEGORIES.includes(req.body.category)) {
      const lastStaff = await Staff.findOne({
        experienceCertId: { $regex: /^GVS-EXP-/ }
      }).sort({ createdAt: -1 });

      let nextNum = 1;
      if (lastStaff && lastStaff.experienceCertId) {
        const parts = lastStaff.experienceCertId.split('-');
        if (parts.length === 3) {
          nextNum = parseInt(parts[2], 10) + 1;
        }
      }
      req.body.experienceCertId = `GVS-EXP-${String(nextNum).padStart(6, '0')}`;
    }

    const staff = await Staff.create(req.body);
    res.status(201).json({ message: "New staff member added successfully!", staff });
  } catch (error) {
    res.status(400).json({ message: "An error occurred. Please try again.", error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: "Staff member deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete", error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    // If category was changed to an eligible one and there's no cert ID yet, generate one
    if (CERT_ELIGIBLE_CATEGORIES.includes(req.body.category)) {
      const existing = await Staff.findById(req.params.id);
      if (existing && !existing.experienceCertId) {
        const lastStaff = await Staff.findOne({
          experienceCertId: { $regex: /^GVS-EXP-/ }
        }).sort({ createdAt: -1 });

        let nextNum = 1;
        if (lastStaff && lastStaff.experienceCertId) {
          const parts = lastStaff.experienceCertId.split('-');
          if (parts.length === 3) {
            nextNum = parseInt(parts[2], 10) + 1;
          }
        }
        req.body.experienceCertId = `GVS-EXP-${String(nextNum).padStart(6, '0')}`;
      }
    }

    const updatedStaff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Staff details updated successfully!", staff: updatedStaff });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// Public: anyone can verify a staff experience certificate by name + father's name
const verifyExperienceCertificate = async (req, res) => {
  try {
    const { name, fatherName, category } = req.body;
    const baseQuery = {
      name: new RegExp(`^${name}$`, 'i'),
      fatherName: new RegExp(`^${fatherName}$`, 'i'),
      category: { $in: CERT_ELIGIBLE_CATEGORIES }
    };

    // Same person may have worked in more than one role (e.g. VVK Instructor
    // earlier, Computer Teacher now) — each is a separate staff record.
    const matches = await Staff.find(baseQuery);
    const withCert = matches.filter(s => s.experienceCertId);

    if (withCert.length === 0) {
      return res.status(404).json({ message: "No experience certificate found with these details." });
    }

    if (withCert.length > 1 && !category) {
      // Ambiguous — ask the frontend to let the person pick which role
      return res.status(200).json({
        multipleFound: true,
        options: withCert.map(s => s.category)
      });
    }

    const staff = category
      ? withCert.find(s => s.category === category)
      : withCert[0];

    if (!staff) {
      return res.status(404).json({ message: `No experience certificate found for ${name} as a ${category}.` });
    }

    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Protected: a logged-in staff member can only fetch their OWN data, for downloading their own certificate
const getMyCertificateData = async (req, res) => {
  try {
    const staff = req.user; // set by the protect middleware from the staff's own token
    if (!staff || !staff.category) {
      return res.status(404).json({ message: "Staff not found" });
    }
    if (!CERT_ELIGIBLE_CATEGORIES.includes(staff.category)) {
      return res.status(403).json({ message: "Experience certificates are only available for Coordinators, VVK Instructors, and Computer Teachers." });
    }
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const staffLogin = async (req, res) => {
  const { phone, password, category } = req.body;
  try {
    const staffList = await Staff.find({ phone, status: 'active' });
    let matches = staffList.filter(s => s.password === password);

    // Same person can have more than one staff record (different roles, same
    // phone/password) — if a category was specified, prefer that exact record.
    if (category) {
      const exact = matches.find(s => s.category === category);
      if (exact) matches = [exact];
    }

    const staff = matches[0];

    if (staff) {
      // Staff login token, expires in 1 hour (no single-device lock, timer handles session expiry)
      const token = jwt.sign({ id: staff._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ 
        _id: staff._id, 
        name: staff.name, 
        role: staff.role, 
        category: staff.category, 
        village: staff.village, 
        mandal: staff.mandal,
        token 
      });
    } else {
      res.status(401).json({ message: 'Incorrect phone number or password!' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to clear the staff session lock on logout
const logoutStaff = async (req, res) => {
  const { id } = req.body;
  try {
    const staff = await Staff.findById(id);
    if (staff) {
      staff.currentSessionToken = null; // clear the lock
      await staff.save();
    }
    res.json({ message: "Logged out securely" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getStaff, addStaff, deleteStaff, updateStaff, staffLogin, logoutStaff, verifyExperienceCertificate, getMyCertificateData };