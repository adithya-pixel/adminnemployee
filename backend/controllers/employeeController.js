const Employee = require('../models/Employee');
const bcrypt = require('bcrypt');

// Create empId string like EMP001, EMP002, etc.
const formatEmpId = (num) => {
  return 'EMP' + String(num).padStart(3, '0');
};

// GET all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

// ADD new employee with hashed password and auto empId
exports.addEmployee = async (req, res) => {
  try {
    const { name, address, phoneNumber, password } = req.body;
    const idProof = req.file?.filename;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee document
    const newEmp = new Employee({
      name,
      address,
      phoneNumber,
      password: hashedPassword,
      idProof,
    });

    // Save to generate auto-increment empNumber
    const savedEmp = await newEmp.save();

    // Format empId like EMP001, EMP002...
    savedEmp.empId = formatEmpId(savedEmp.empNumber);
    await savedEmp.save();

    res.status(201).json(savedEmp);
  } catch (error) {
    console.error('❌ Error adding employee:', error);
    res.status(500).json({ error: 'Failed to add employee' });
  }
};

// UPDATE employee info or reset password
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (req.file) {
      updateData.idProof = req.file.filename;
    }

    const updatedEmp = await Employee.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedEmp);
  } catch (error) {
    console.error('❌ Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

// DELETE employee
exports.deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};
