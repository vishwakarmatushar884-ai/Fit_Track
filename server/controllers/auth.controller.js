import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fittrack_super_secret_jwt_key_2026_fitness', {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            name: name || 'Fitness Enthusiast',
            age: 25,
            gender: 'Male',
            height: 175,
            weight: 72,
            fitnessGoal: 'Lose Weight',
            targetWeight: 68,
            dailyCalorieGoal: 2200,
            unitSystem: 'metric',
            theme: 'dark'
          }
        },
        settings: {
          create: {
            workoutTime: '08:00',
            waterInterval: 60,
            mealTime: '13:00',
            sleepTime: '22:30',
            weightCheck: '07:00',
            enabled: true
          }
        }
      },
      include: {
        profile: true,
        settings: true
      }
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
        settings: user.settings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true, settings: true }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user.id);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile,
          settings: user.settings
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: true,
        settings: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      age,
      gender,
      height,
      weight,
      fitnessGoal,
      targetWeight,
      dailyCalorieGoal,
      unitSystem,
      theme
    } = req.body;

    const profile = await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        name,
        age: age ? parseInt(age) : undefined,
        gender,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        fitnessGoal,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        dailyCalorieGoal: dailyCalorieGoal ? parseInt(dailyCalorieGoal) : undefined,
        unitSystem,
        theme
      }
    });

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Change Password
// @route   PUT /api/auth/password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password does not match' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload Avatar
// @route   POST /api/auth/avatar
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    const profile = await prisma.profile.update({
      where: { userId: req.user.id },
      data: { avatarUrl }
    });

    res.json({ avatarUrl: profile.avatarUrl, profile });
  } catch (error) {
    next(error);
  }
};
