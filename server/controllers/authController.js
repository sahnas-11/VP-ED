const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

const login = async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      clubName: user.clubName
    }
  });
};

const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

const updateProfile = async (req, res) => {
  const { name, phone, clubName } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (clubName) user.clubName = clubName;
  await user.save();
  return res.json({ message: 'Profile updated successfully', user });
};

module.exports = { login, getMe, updateProfile };
