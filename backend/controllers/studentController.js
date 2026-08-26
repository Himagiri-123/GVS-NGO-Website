const Student = require('../models/Student');

const addStudent = async (req, res) => {
  try {
    // Auto-generate serial number
    if (req.body.category === 'Computer') {
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
      // Pad to 6 digits automatically (e.g. 000001)
      req.body.certificateSerialNo = `GVS-KDC-${String(nextNum).padStart(6, '0')}`;
    }

    const student = await Student.create(req.body);
    res.status(201).json({ message: "Student added successfully!", student });
  } catch (error) {
    res.status(400).json({ message: "An error occurred", error: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const filter = req.query.village ? { village: req.query.village } : {};
    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student record deleted." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete", error: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Details updated successfully!", student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// Public certificate verification endpoint (no auth required)
const verifyCertificate = async (req, res) => {
  try {
    const { searchKey, batchNumber } = req.body; // searchKey: certificate serial number or phone number
    const query = {
      category: 'Computer',
      $or: [
        { certificateSerialNo: searchKey },
        { phone: searchKey }
      ]
    };
    // If a batch number is also given, use it to pick the right record
    // (useful when the same student joined more than one batch)
    if (batchNumber) query.batchNumber = batchNumber;

    const student = await Student.findOne(query);

    if (student) {
      res.status(200).json(student);
    } else {
      res.status(404).json({ message: "No certificate found with these details." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Public: verify directly by serial number only (used when a QR code on the
// physical certificate is scanned — the QR itself is the proof, so no name
// re-entry is required)
const verifyBySerial = async (req, res) => {
  try {
    const student = await Student.findOne({ category: 'Computer', certificateSerialNo: req.params.serialNo });
    if (student) {
      res.status(200).json(student);
    } else {
      res.status(404).json({ message: "Certificate not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addStudent, getStudents, deleteStudent, updateStudent, verifyCertificate, verifyBySerial };