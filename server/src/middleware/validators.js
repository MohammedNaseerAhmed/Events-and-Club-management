import Joi from 'joi';
import createError from 'http-errors';

const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
  if (error) {
    return next(createError(400, error.details.map((d) => d.message).join(', ')));
  }
  req[property] = value;
  return next();
};

// URL-safe username: alphanumeric + underscore, 3–30 chars
const usernameSchema = Joi.string().pattern(/^[a-z0-9_]{3,30}$/).lowercase().required().messages({
  'string.pattern.base': 'username must be 3–30 characters, lowercase letters, numbers, and underscores only',
});

// Password: min 8, at least one upper, one lower, one number, one special character
const passwordSchema = Joi.string()
  .min(8).max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
  .required()
  .messages({
    'string.pattern.base': 'password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  });

export const registerValidator = validate(
  Joi.object({
    name: Joi.string().min(2).max(80).required(),
    username: usernameSchema,
    email: Joi.string().email().required(),
    password: passwordSchema,
    role: Joi.string().valid('student', 'clubHead', 'admin').default('student'),
  })
);

export const loginValidator = validate(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required(),
  })
);

// Event create (body only; clubId from route param)
export const eventCreateValidator = validate(
  Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow('').max(5000),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().allow(null),
    venue: Joi.string().allow('').max(200),
    capacity: Joi.number().integer().min(0).allow(null),
    visibility: Joi.string().valid('public', 'members-only').default('public'),
    tags: Joi.array().items(Joi.string().max(50)).default([]),
  })
);

export const eventUpdateValidator = validate(
  Joi.object({
    title: Joi.string().min(2).max(200),
    description: Joi.string().allow('').max(5000),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().allow(null),
    venue: Joi.string().allow('').max(200),
    capacity: Joi.number().integer().min(0).allow(null),
    visibility: Joi.string().valid('public', 'members-only'),
    tags: Joi.array().items(Joi.string().max(50)),
  }).min(1)
);

// Organization (admin)
export const organizationCreateValidator = validate(
  Joi.object({
    name: Joi.string().min(2).max(120).required(),
    shortName: Joi.string().allow('').max(60),
    fullForm: Joi.string().allow('').max(200),
    type: Joi.string().valid('Professional Chapter', 'Society', 'Club', 'Council', 'Campus Event').required(),
    description: Joi.string().allow('').max(5000),
    mission: Joi.string().allow('').max(2000),
    vision: Joi.string().allow('').max(2000),
    facultyCoordinator: Joi.string().allow('').max(120),
    heads: Joi.array().items(Joi.string().hex().length(24)).default([]),
  })
);

const committeeMemberSchema = Joi.object({
  name: Joi.string().min(1).max(120).required(),
  role: Joi.string().allow('').max(80),
  photoUrl: Joi.string().uri().allow(''),
  contact: Joi.string().allow('').max(60),
  linkedIn: Joi.string().uri().allow(''),
});

const galleryImageSchema = Joi.object({
  url: Joi.string().uri().required(),
  caption: Joi.string().allow('').max(200),
});

export const organizationUpdateValidator = validate(
  Joi.object({
    name: Joi.string().min(2).max(120),
    shortName: Joi.string().allow('').max(60),
    fullForm: Joi.string().allow('').max(200),
    type: Joi.string().valid('Professional Chapter', 'Society', 'Club', 'Council', 'Campus Event'),
    description: Joi.string().allow('').max(5000),
    mission: Joi.string().allow('').max(2000),
    vision: Joi.string().allow('').max(2000),
    history: Joi.string().allow('').max(5000),
    impact: Joi.string().allow('').max(2000),
    objectives: Joi.array().items(Joi.string().max(300)),
    facultyCoordinator: Joi.string().allow('').max(120),
    logoUrl: Joi.string().uri().allow(''),
    bannerUrl: Joi.string().uri().allow(''),
    socialLinks: Joi.object({
      instagram: Joi.string().allow('').max(200),
      linkedin: Joi.string().allow('').max(200),
      twitter: Joi.string().allow('').max(200),
      youtube: Joi.string().allow('').max(200),
      email: Joi.string().email().allow(''),
    }),
    committee: Joi.array().items(committeeMemberSchema),
    gallery: Joi.array().items(galleryImageSchema),
    joinEnabled: Joi.boolean(),
    heads: Joi.array().items(Joi.string().hex().length(24)),
    isActive: Joi.boolean(),
  }).min(1)
);

export const chapterUpdateValidator = validate(
  Joi.object({
    description: Joi.string().allow('').max(5000),
    mission: Joi.string().allow('').max(2000),
    vision: Joi.string().allow('').max(2000),
    history: Joi.string().allow('').max(5000),
    impact: Joi.string().allow('').max(2000),
    objectives: Joi.array().items(Joi.string().max(300)),
    bannerUrl: Joi.string().uri().allow(''),
    socialLinks: Joi.object({
      instagram: Joi.string().allow('').max(200),
      linkedin: Joi.string().allow('').max(200),
      twitter: Joi.string().allow('').max(200),
      youtube: Joi.string().allow('').max(200),
      email: Joi.string().email().allow(''),
    }),
    committee: Joi.array().items(committeeMemberSchema),
    gallery: Joi.array().items(galleryImageSchema),
    joinEnabled: Joi.boolean(),
  }).min(1)
);

export const joinRequestValidator = validate(
  Joi.object({
    name: Joi.string().min(2).max(120).required(),
    rollNumber: Joi.string().allow('').max(40),
    email: Joi.string().email().required(),
    phone: Joi.string().allow('').max(20),
    branch: Joi.string().allow('').max(80),
    year: Joi.string().allow('').max(20),
    whyJoin: Joi.string().allow('').max(2000),
  })
);

// Post & comment
export const postCreateValidator = validate(
  Joi.object({
    content: Joi.string().min(1).max(5000).required(),
    media: Joi.array().items(Joi.object({ url: Joi.string(), type: Joi.string().valid('image', 'video', 'document') })),
    targetOrgId: Joi.string().hex().length(24).allow(null, ''),
    eventId: Joi.string().hex().length(24).allow(null, ''),
    postType: Joi.string().valid('post', 'announcement', 'event_share').default('post'),
  })
);

export const commentValidator = validate(
  Joi.object({
    comment: Joi.string().min(1).max(2000).required(),
  })
);

// Network
export const networkInviteValidator = validate(
  Joi.object({
    recipientId: Joi.string().hex().length(24).required(),
  })
);

// User profile & password
export const profileUpdateValidator = validate(
  Joi.object({
    name: Joi.string().min(2).max(80),
    bio: Joi.string().allow('').max(500),
    headline: Joi.string().allow('').max(200),
    profilePicUrl: Joi.string().uri().allow(''),
  }).min(1)
);

export const passwordChangeValidator = validate(
  Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: passwordSchema,
  })
);

export const privacyUpdateValidator = validate(
  Joi.object({
    profileVisible: Joi.boolean(),
    activityVisible: Joi.boolean(),
  }).min(1)
);

export const notificationSettingsValidator = validate(
  Joi.object({
    email: Joi.boolean(),
    push: Joi.boolean(),
  }).min(1)
);

// Legacy / optional
export const eventCreateValidatorLegacy = validate(
  Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow('').max(2000),
    posterUrl: Joi.string().uri().allow(''),
    date: Joi.date().iso().required(),
    time: Joi.string().allow(''),
    venue: Joi.string().allow(''),
    clubId: Joi.string().hex().length(24).required(),
  })
);

export const clubCreateValidator = validate(
  Joi.object({
    name: Joi.string().min(2).max(120).required(),
    logoUrl: Joi.string().uri().allow(''),
    description: Joi.string().allow('').max(2000),
    contact: Joi.string().allow('').max(200),
  })
);

export const clubUpdateValidator = validate(
  Joi.object({
    name: Joi.string().min(2).max(120),
    logoUrl: Joi.string().uri().allow(''),
    description: Joi.string().allow('').max(2000),
    contact: Joi.string().allow('').max(200),
  }).min(1)
);

export const notificationCreateValidator = validate(
  Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().allow('').max(2000),
    date: Joi.date().iso(),
    type: Joi.string().valid('event', 'update', 'reminder').default('update'),
    link: Joi.string().uri().allow(''),
    clubId: Joi.string().hex().length(24).allow(''),
    eventId: Joi.string().hex().length(24).allow(''),
  })
);

export default validate;
