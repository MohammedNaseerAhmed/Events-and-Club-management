import ClubAdmin from '../models/ClubAdmin.js';
import Club from '../models/Club.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import { createResponse } from '../utils/response.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/events';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'poster-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get club admin's club details
const getClubDetails = async (req, res) => {
  try {
    const clubAdmin = await ClubAdmin.findById(req.user.id).populate('clubId');
    
    if (!clubAdmin) {
      return res.status(404).json(createResponse(false, 'Club admin not found'));
    }

    const club = await Club.findById(clubAdmin.clubId._id);
    
    res.json(createResponse(true, 'Club details retrieved successfully', { club }));
  } catch (error) {
    console.error('Get club details error:', error);
    res.status(500).json(createResponse(false, 'Failed to retrieve club details', { error: error.message }));
  }
};

// Update club details
const updateClubDetails = async (req, res) => {
  try {
    const clubAdmin = await ClubAdmin.findById(req.user.id);
    
    if (!clubAdmin) {
      return res.status(404).json(createResponse(false, 'Club admin not found'));
    }

    const { name, description, contact, instagram, achievements } = req.body;
    
    const updatedClub = await Club.findByIdAndUpdate(
      clubAdmin.clubId,
      {
        name,
        description,
        contact,
        instagram,
        achievements
      },
      { new: true, runValidators: true }
    );

    if (!updatedClub) {
      return res.status(404).json(createResponse(false, 'Club not found'));
    }

    res.json(createResponse(true, 'Club details updated successfully', { club: updatedClub }));
  } catch (error) {
    console.error('Update club details error:', error);
    res.status(500).json(createResponse(false, 'Failed to update club details', { error: error.message }));
  }
};

// Get club admin's events
const getClubEvents = async (req, res) => {
  try {
    const clubAdmin = await ClubAdmin.findById(req.user.id);
    
    if (!clubAdmin) {
      return res.status(404).json(createResponse(false, 'Club admin not found'));
    }

    const events = await Event.find({ clubId: clubAdmin.clubId })
      .populate('clubId', 'name')
      .populate('attendees', 'name email')
      .sort({ date: -1 });

    res.json(createResponse(true, 'Club events retrieved successfully', { items: events }));
  } catch (error) {
    console.error('Get club events error:', error);
    res.status(500).json(createResponse(false, 'Failed to retrieve club events', { error: error.message }));
  }
};

// Create event for club
const createEvent = async (req, res) => {
  try {
    const clubAdmin = await ClubAdmin.findById(req.user.id);
    
    if (!clubAdmin) {
      return res.status(404).json(createResponse(false, 'Club admin not found'));
    }

    const eventData = {
      ...req.body,
      clubId: clubAdmin.clubId,
      createdBy: req.user.id
    };

    const event = new Event(eventData);
    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('clubId', 'name')
      .populate('attendees', 'name email');

    res.status(201).json(createResponse(true, 'Event created successfully', { event: populatedEvent }));
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json(createResponse(false, 'Failed to create event', { error: error.message }));
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const clubAdmin = await ClubAdmin.findById(req.user.id);
    const eventId = req.params.id;

    // Verify event belongs to this club admin's club
    const event = await Event.findOne({ _id: eventId, clubId: clubAdmin.clubId });
    
    if (!event) {
      return res.status(404).json(createResponse(false, 'Event not found or access denied'));
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      req.body,
      { new: true, runValidators: true }
    ).populate('clubId', 'name').populate('attendees', 'name email');

    res.json(createResponse(true, 'Event updated successfully', { event: updatedEvent }));
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json(createResponse(false, 'Failed to update event', { error: error.message }));
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const clubAdmin = await ClubAdmin.findById(req.user.id);
    const eventId = req.params.id;

    // Verify event belongs to this club admin's club
    const event = await Event.findOne({ _id: eventId, clubId: clubAdmin.clubId });
    
    if (!event) {
      return res.status(404).json(createResponse(false, 'Event not found or access denied'));
    }

    await Event.findByIdAndDelete(eventId);

    res.json(createResponse(true, 'Event deleted successfully'));
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json(createResponse(false, 'Failed to delete event', { error: error.message }));
  }
};

// Recruit users
const recruitUsers = async (req, res) => {
  try {
    const clubAdmin = await ClubAdmin.findById(req.user.id).populate('clubId');
    
    if (!clubAdmin) {
      return res.status(404).json(createResponse(false, 'Club admin not found'));
    }

    const { email, name, message } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json(createResponse(false, 'User with this email already exists'));
    }

    // Send recruitment email
    const recruitmentEmail = {
      to: email,
      subject: `Join ${clubAdmin.clubId.name} - VNR VJIET`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Join ${clubAdmin.clubId.name}!</h2>
          <p>Hello ${name},</p>
          <p>You've been invited to join <strong>${clubAdmin.clubId.name}</strong> at VNR VJIET.</p>
          <p>${message || 'We have exciting events and activities planned for our members!'}</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Club Information:</h3>
            <p><strong>Club:</strong> ${clubAdmin.clubId.name}</p>
            <p><strong>Description:</strong> ${clubAdmin.clubId.description}</p>
            <p><strong>Contact:</strong> ${clubAdmin.clubId.contact}</p>
          </div>
          <p>To join our club, please register at: <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/register">Register Here</a></p>
          <p>Best regards,<br>${clubAdmin.name}<br>Club Admin - ${clubAdmin.clubId.name}</p>
        </div>
      `
    };

    await sendEmail(recruitmentEmail);

    res.json(createResponse(true, 'Recruitment email sent successfully'));
  } catch (error) {
    console.error('Recruit users error:', error);
    res.status(500).json(createResponse(false, 'Failed to send recruitment email', { error: error.message }));
  }
};

// Get club admin profile
const getProfile = async (req, res) => {
  try {
    const clubAdmin = await ClubAdmin.findById(req.user.id)
      .populate('clubId', 'name description')
      .select('-password');

    if (!clubAdmin) {
      return res.status(404).json(createResponse(false, 'Club admin not found'));
    }

    res.json(createResponse(true, 'Profile retrieved successfully', { clubAdmin }));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json(createResponse(false, 'Failed to retrieve profile', { error: error.message }));
  }
};

// Update club admin profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, profile } = req.body;
    
    const updatedClubAdmin = await ClubAdmin.findByIdAndUpdate(
      req.user.id,
      { name, phone, profile },
      { new: true, runValidators: true }
    ).select('-password').populate('clubId', 'name description');

    res.json(createResponse(true, 'Profile updated successfully', { clubAdmin: updatedClubAdmin }));
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json(createResponse(false, 'Failed to update profile', { error: error.message }));
  }
};

// Upload event poster
const uploadEventPoster = async (req, res) => {
  try {
    const clubAdmin = await ClubAdmin.findById(req.user.id);
    const eventId = req.params.id;

    // Verify event belongs to this club admin's club
    const event = await Event.findOne({ _id: eventId, clubId: clubAdmin.clubId });
    
    if (!event) {
      return res.status(404).json(createResponse(false, 'Event not found or access denied'));
    }

    // Use multer middleware
    upload.single('poster')(req, res, async (err) => {
      if (err) {
        return res.status(400).json(createResponse(false, err.message));
      }

      if (!req.file) {
        return res.status(400).json(createResponse(false, 'No file uploaded'));
      }

      // Update event with poster filename
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { poster: req.file.filename },
        { new: true }
      ).populate('clubId', 'name').populate('attendees', 'name email');

      res.json(createResponse(true, 'Poster uploaded successfully', { event: updatedEvent }));
    });
  } catch (error) {
    console.error('Upload poster error:', error);
    res.status(500).json(createResponse(false, 'Failed to upload poster', { error: error.message }));
  }
};

export {
  getClubDetails,
  updateClubDetails,
  getClubEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventPoster,
  recruitUsers,
  getProfile,
  updateProfile
};
