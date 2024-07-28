const Employee = require('../models/employeeModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
}).single('profilePicture');

exports.createEmployee = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: err });
    }
    const { firstName, lastName, email, phoneNumber, jobTitle, department, address } = req.body;
    try {
      const newEmployee = new Employee({
        firstName,
        lastName,
        email,
        phoneNumber,
        jobTitle,
        department,
        address,
        profilePicture: req.file ? req.file.path : null
      });
      await newEmployee.save();
      res.status(201).json({ msg: 'Employee created successfully' });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server error' });
    }
  });
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ msg: err });
    }
    const { firstName, lastName, email, phoneNumber, jobTitle, department, address } = req.body;
    try {
      let employee = await Employee.findById(req.params.id);
      if (!employee) {
        return res.status(404).json({ msg: 'Employee not found' });
      }

      const updatedData = {
        firstName,
        lastName,
        email,
        phoneNumber,
        jobTitle,
        department,
        address,
        profilePicture: req.file ? req.file.path : employee.profilePicture
      };

      employee = await Employee.findByIdAndUpdate(req.params.id, { $set: updatedData }, { new: true });
      res.status(200).json({ msg: 'Employee updated successfully', employee });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: 'Server error' });
    }
  });
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    if (employee.profilePicture) {
      fs.unlinkSync(employee.profilePicture);
    }

    await Employee.findByIdAndRemove(req.params.id);
    res.status(200).json({ msg: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
