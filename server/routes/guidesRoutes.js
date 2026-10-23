const express = require('express');
const router = express.Router();
const CCProject = require('../models/CCProject');
const RoleScript = require('../models/RoleScript');

router.get('/cc-projects', async (req, res) => {
  const projects = await CCProject.find().sort({ number: 1 });
  res.json({ success: true, count: projects.length, data: projects });
});

router.get('/role-scripts', async (req, res) => {
  const scripts = await RoleScript.find();
  res.json({ success: true, count: scripts.length, data: scripts });
});

router.get('/role-scripts/:role', async (req, res) => {
  const script = await RoleScript.findOne({ role: req.params.role });
  if (!script) return res.status(404).json({ message: 'Script not found' });
  res.json({ success: true, data: script });
});

module.exports = router;
