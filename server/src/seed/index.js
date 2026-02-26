/**
 * Seed Script - Campus Social & Event Ecosystem
 * Run: node src/seed/index.js
 * 
 * Creates:
 *  - 1 Admin user
 *  - 1 Club Head user  
 *  - 1 Student user
 *  - 50+ Organizations
 *  - Sample events, posts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campus-ecosystem');
console.log('✅ Connected to MongoDB');

// Import models
const { default: User } = await import('../models/User.js');
const { default: Organization } = await import('../models/Organization.js');
const { default: Event } = await import('../models/Event.js');
const { default: Post } = await import('../models/Post.js');
const { default: Registration } = await import('../models/Registration.js');

// ─── Clean existing data ────────────────────────────────────────────────────
console.log('🧹 Cleaning existing seed data...');
await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
    Event.deleteMany({}),
    Post.deleteMany({}),
    Registration.deleteMany({}),
]);

// ─── Users ──────────────────────────────────────────────────────────────────
const salt = await bcrypt.genSalt(12);

const admin = await User.create({
    name: 'Campus Admin',
    username: 'campusadmin',
    email: 'admin@campus.edu',
    passwordHash: await bcrypt.hash('Admin@123', salt),
    role: 'admin',
    bio: 'Campus platform administrator',
    headline: 'Platform Administrator',
});

const clubHead = await User.create({
    name: 'Alex Johnson',
    username: 'alexjohnson',
    email: 'head@campus.edu',
    passwordHash: await bcrypt.hash('Head@123', salt),
    role: 'clubHead',
    bio: 'ACM Student Chapter President',
    headline: 'Club Head | ACM',
});

const student = await User.create({
    name: 'Sam Student',
    username: 'samstudent',
    email: 'student@campus.edu',
    passwordHash: await bcrypt.hash('Student@123', salt),
    role: 'student',
    bio: 'CS Engineering student',
    headline: 'Student @ VNRVJIET',
});

const student2 = await User.create({
    name: 'Priya Sharma',
    username: 'priyasharma',
    email: 'priya@campus.edu',
    passwordHash: await bcrypt.hash('Student@123', salt),
    role: 'student',
    bio: 'Passionate about technology and design',
    headline: 'ECE Student | Tech Enthusiast',
});

console.log('✅ Users created');

// ─── Organizations ──────────────────────────────────────────────────────────
const orgsData = [
    // Professional Chapters
    { name: 'ACM', shortName: 'acm', fullForm: 'Association for Computing Machinery', type: 'Professional Chapter', description: 'ACM Student Chapter promoting computing as a science and profession.', facultyCoordinator: 'Dr. R. Srinivas' },
    { name: 'ASME', shortName: 'asme', fullForm: 'American Society of Mechanical Engineers', type: 'Professional Chapter', description: 'ASME student section fostering mechanical engineering skills.', facultyCoordinator: 'Dr. P. Kumar' },
    { name: 'CSI', shortName: 'csi', fullForm: 'Computer Society of India', type: 'Professional Chapter', description: 'CSI chapter bridging industry and academia in IT.', facultyCoordinator: 'Dr. S. Reddy' },
    { name: 'IEEE', shortName: 'ieee', fullForm: 'Institute of Electrical and Electronics Engineers', type: 'Professional Chapter', description: 'IEEE student branch advancing technology for humanity.', facultyCoordinator: 'Dr. M. Venkat' },
    { name: 'IEI', shortName: 'iei', fullForm: 'Institution of Engineers India', type: 'Professional Chapter', description: 'IEI student chapter developing engineering professionals.', facultyCoordinator: 'Dr. A. Prasad' },
    { name: 'IGBC', shortName: 'igbc', fullForm: 'Indian Green Building Council', type: 'Professional Chapter', description: 'IGBC chapter promoting sustainable and green construction.', facultyCoordinator: 'Dr. V. Lakshmi' },
    { name: 'ISOI', shortName: 'isoi', fullForm: 'Indian Society of Orthodontists India', type: 'Professional Chapter', description: 'Interdisciplinary science and orthodontics chapter.', facultyCoordinator: 'Dr. C. Raju' },
    { name: 'ISTE', shortName: 'iste', fullForm: 'Indian Society for Technical Education', type: 'Professional Chapter', description: 'ISTE chapter enhancing technical education standards.', facultyCoordinator: 'Dr. B. Naidu' },
    { name: 'IETE', shortName: 'iete', fullForm: 'Institution of Electronics and Telecommunication Engineers', type: 'Professional Chapter', description: 'IETE student forum for electronics and telecom.', facultyCoordinator: 'Dr. K. Rao' },
    { name: 'IUCEE', shortName: 'iucee', fullForm: 'Indo-US Collaboration for Engineering Education', type: 'Professional Chapter', description: 'IUCEE chapter fostering Indo-US academic partnerships.', facultyCoordinator: 'Dr. N. Murthy' },
    { name: 'SAE', shortName: 'sae', fullForm: 'Society of Automotive Engineers', type: 'Professional Chapter', description: 'SAE club for automotive engineering enthusiasts.', facultyCoordinator: 'Dr. H. Sharma' },
    { name: 'GSDC', shortName: 'gsdc', fullForm: 'Google Student Developer Club', type: 'Professional Chapter', description: 'GDSC fostering Google technologies and Open Source.', facultyCoordinator: 'Dr. P. Verma' },
    { name: 'ICI', shortName: 'ici', fullForm: 'Indian Concrete Institute', type: 'Professional Chapter', description: 'ICI chapter for civil engineering and concrete technology.', facultyCoordinator: 'Dr. S. Mohan' },
    { name: 'VSI', shortName: 'vsi', fullForm: 'Vision Science Institution', type: 'Professional Chapter', description: 'VSI chapter advancing vision science research.', facultyCoordinator: 'Dr. L. Devi' },
    // Clubs
    { name: 'Turing Hut', shortName: 'turinghut', fullForm: '', type: 'Club', description: 'Competitive programming and algorithm club for CS enthusiasts.', facultyCoordinator: 'Dr. A. Kumar' },
    { name: 'Data Questers Club', shortName: 'dataquesters', fullForm: '', type: 'Club', description: 'Data Science, Machine Learning, and AI enthusiasts club.', facultyCoordinator: 'Dr. R. Mehta' },
    { name: 'Livewire', shortName: 'livewire', fullForm: '', type: 'Club', description: 'Electronics and circuits hobbyist club.', facultyCoordinator: 'Dr. V. Chandra' },
    { name: 'Kritomedh', shortName: 'kritomedh', fullForm: '', type: 'Club', description: 'Innovation and entrepreneurship club.', facultyCoordinator: 'Dr. P. Singh' },
    { name: 'N Army', shortName: 'narmy', fullForm: '', type: 'Club', description: 'National service and community service club.', facultyCoordinator: 'Dr. M. Gupta' },
    { name: 'NSS', shortName: 'nss', fullForm: 'National Service Scheme', type: 'Club', description: 'NSS unit serving society and promoting social welfare.', facultyCoordinator: 'Dr. S. Kumar' },
    { name: 'Social Media', shortName: 'socialmedia', fullForm: '', type: 'Club', description: 'Digital media and content creation club.', facultyCoordinator: 'Ms. A. Reddy' },
    { name: 'Stentorian', shortName: 'stentorian', fullForm: '', type: 'Club', description: 'Debating and public speaking club.', facultyCoordinator: 'Mr. R. Rao' },
    { name: 'Vignana Jyothi', shortName: 'vignanajyothi', fullForm: '', type: 'Club', description: 'Science and knowledge dissemination club.', facultyCoordinator: 'Dr. T. Anand' },
    { name: 'Sahithi Vanam', shortName: 'sahithivanam', fullForm: '', type: 'Club', description: 'Telugu literature and arts club.', facultyCoordinator: 'Dr. P. Lakshmi' },
    { name: 'Art of Living', shortName: 'artofliving', fullForm: '', type: 'Club', description: 'Yoga, wellness, and mindfulness club.', facultyCoordinator: 'Dr. S. Swamy' },
    // Cultural/Creative
    { name: 'Diurnalis', shortName: 'diurnalis', fullForm: '', type: 'Club', description: 'Campus journalism and newsletter club.', facultyCoordinator: 'Ms. K. Rao' },
    { name: 'CANDLEVES', shortName: 'candleves', fullForm: '', type: 'Club', description: 'Candle making and craft arts club.', facultyCoordinator: 'Ms. S. Devi' },
    { name: 'Nrithya Tarang', shortName: 'nrithyatarang', fullForm: '', type: 'Club', description: 'Classical dance club celebrating Indian dance forms.', facultyCoordinator: 'Ms. P. Sharma' },
    { name: 'Creative Arts', shortName: 'creativearts', fullForm: '', type: 'Club', description: 'Painting, sketching, and fine arts club.', facultyCoordinator: 'Mr. D. Kumar' },
    { name: 'Crescendo', shortName: 'crescendo', fullForm: '', type: 'Club', description: 'Music club for instrumentalists and vocalists.', facultyCoordinator: 'Mr. S. Rao' },
    { name: 'Dramatix', shortName: 'dramatix', fullForm: '', type: 'Club', description: 'Drama and theatre performance club.', facultyCoordinator: 'Ms. N. Singh' },
    { name: 'Scintillate', shortName: 'scintillate', fullForm: '', type: 'Club', description: 'Dance and performing arts club.', facultyCoordinator: 'Ms. R. Mishra' },
    { name: 'VJ Theatro', shortName: 'vjtheatro', fullForm: '', type: 'Club', description: 'Film making and cinematography club.', facultyCoordinator: 'Mr. P. Kumar' },
    { name: 'VJ Spectral Pyramid', shortName: 'vjspectralpyramid', fullForm: '', type: 'Club', description: 'Science fiction and tech-culture club.', facultyCoordinator: 'Dr. A. Sharma' },
    { name: 'VJ ARC', shortName: 'vjarc', fullForm: 'VJ Architectural Club', type: 'Club', description: 'Architecture and urban design club.', facultyCoordinator: 'Dr. R. Verma' },
    // Councils
    { name: 'Student Council', shortName: 'studentcouncil', fullForm: '', type: 'Council', description: 'Student governance and welfare council.', facultyCoordinator: 'Dr. Vice-Principal' },
    { name: 'VNRSF', shortName: 'vnrsf', fullForm: 'VNR Student Foundation', type: 'Council', description: 'Student foundation for campus development initiatives.', facultyCoordinator: 'Dr. Principal' },
    { name: 'Electoral Literacy Club', shortName: 'elc', fullForm: 'ELC', type: 'Club', description: 'Promoting electoral awareness and civic responsibility.', facultyCoordinator: 'Dr. S. Nair' },
    // Campus Events
    { name: 'Annual Day', shortName: 'annualday', fullForm: '', type: 'Campus Event', description: 'Annual college day celebration organizing committee.', facultyCoordinator: 'Principal' },
    { name: 'Convergence', shortName: 'convergence', fullForm: '', type: 'Campus Event', description: 'Annual technical fest organizing committee.', facultyCoordinator: 'Dr. Dean' },
    { name: 'Cultural Day', shortName: 'culturalday', fullForm: '', type: 'Campus Event', description: 'Cultural extravaganza organizing committee.', facultyCoordinator: 'Arts Coordinator' },
    { name: 'Ecficio', shortName: 'ecficio', fullForm: '', type: 'Campus Event', description: 'Economics and management fest organizing committee.', facultyCoordinator: 'Dr. MBA Dean' },
    { name: 'TEDx VNRVJIET', shortName: 'tedxvnr', fullForm: '', type: 'Campus Event', description: 'Independently organized TED event at VNRVJIET.', facultyCoordinator: 'Dr. Coordinator' },
    { name: 'National Engineers Day', shortName: 'engday', fullForm: '', type: 'Campus Event', description: 'Celebration of National Engineers Day (Sep 15).', facultyCoordinator: 'Dean Engineering' },
    { name: 'International Women\'s Day', shortName: 'womensday', fullForm: '', type: 'Campus Event', description: 'Celebrating International Women\'s Day on campus.', facultyCoordinator: 'Women Cell' },
    { name: 'International Yoga Day', shortName: 'yogaday', fullForm: '', type: 'Campus Event', description: 'Celebrating International Yoga Day with sessions.', facultyCoordinator: 'Sports Dept' },
    { name: 'National Mathematics Day', shortName: 'mathday', fullForm: '', type: 'Campus Event', description: 'Celebrating Ramanujan\'s birth anniversary.', facultyCoordinator: 'Math Dept' },
    { name: 'Open House', shortName: 'openhouse', fullForm: '', type: 'Campus Event', description: 'Annual open house for project exhibitions.', facultyCoordinator: 'R&D Cell' },
    { name: 'Sintillashunz', shortName: 'sintillashunz', fullForm: '', type: 'Campus Event', description: 'Annual inter-college cultural competitive fest.', facultyCoordinator: 'Cultural Coordinator' },
    { name: 'Sports Fest', shortName: 'sportsfest', fullForm: '', type: 'Campus Event', description: 'Annual sports day and athletic competitions.', facultyCoordinator: 'Physical Director' },
    { name: 'National Science Day', shortName: 'scienceday', fullForm: '', type: 'Campus Event', description: 'Celebrating C.V. Raman\'s Raman Effect discovery.', facultyCoordinator: 'Science Dept' },
    { name: 'National Teachers Day', shortName: 'teachersday', fullForm: '', type: 'Campus Event', description: 'Celebrating Dr. S. Radhakrishnan\'s birthday.', facultyCoordinator: 'Admin' },
    { name: 'National Technology Day', shortName: 'techday', fullForm: '', type: 'Campus Event', description: 'Celebrating India\'s nuclear test anniversary.', facultyCoordinator: 'Tech Dept' },
    { name: 'Republic Day', shortName: 'republicday', fullForm: '', type: 'Campus Event', description: 'Republic Day celebration and flag hoisting ceremony.', facultyCoordinator: 'Principal' },
    { name: 'Independence Day', shortName: 'independenceday', fullForm: '', type: 'Campus Event', description: 'Independence Day national celebration.', facultyCoordinator: 'Principal' },
    { name: 'Traditional Day', shortName: 'traditionalday', fullForm: '', type: 'Campus Event', description: 'Traditional attire day celebrating Indian culture.', facultyCoordinator: 'Cultural Dept' },
    { name: 'ICMACC', shortName: 'icmacc', fullForm: 'International Conference on Mathematics, Algorithms and Control', type: 'Campus Event', description: 'Annual international academic conference.', facultyCoordinator: 'Research Dean' },
    { name: 'World IP Day', shortName: 'ipday', fullForm: 'World Intellectual Property Day', type: 'Campus Event', description: 'Celebrating World IP Day and innovation.', facultyCoordinator: 'IPR Cell' },
    { name: 'World Environment Day', shortName: 'envday', fullForm: '', type: 'Campus Event', description: 'Celebrating World Environment Day with eco-drives.', facultyCoordinator: 'Green Campus Cell' },
    { name: 'World Water Day', shortName: 'waterday', fullForm: '', type: 'Campus Event', description: 'World Water Day awareness programs.', facultyCoordinator: 'Civil Dept' },
];

const orgDocs = await Organization.insertMany(
    orgsData.map((o) => ({ ...o, createdBy: admin._id, isActive: true }))
);
console.log(`✅ ${orgDocs.length} Organizations seeded`);

// Assign ACM to club head
const acmOrg = orgDocs.find((o) => o.shortName === 'acm');
if (acmOrg) {
    acmOrg.heads = [clubHead._id];
    await acmOrg.save();
    await User.findByIdAndUpdate(clubHead._id, {
        $addToSet: { organizationsOwned: acmOrg._id },
    });
}

// Have student follow some orgs
await User.findByIdAndUpdate(student._id, {
    $set: { followingOrgs: orgDocs.slice(0, 5).map((o) => o._id) },
});

// ─── Sample Events ──────────────────────────────────────────────────────────
const now = new Date();
const tomorrow = new Date(now.getTime() + 86400000);
const nextWeek = new Date(now.getTime() + 7 * 86400000);
const twoWeeks = new Date(now.getTime() + 14 * 86400000);

const events = await Event.insertMany([
    {
        title: 'Hackathon 2026',
        description: '24-hour coding challenge where teams compete to build innovative solutions. Open to all CS and IT students. Prizes worth ₹50,000!',
        clubId: acmOrg._id,
        createdBy: clubHead._id,
        status: 'approved',
        startDate: nextWeek,
        endDate: twoWeeks,
        venue: 'Main Auditorium',
        capacity: 200,
        registrationCount: 45,
        posterUrl: '',
        visibility: 'public',
        tags: ['coding', 'hackathon', 'competition'],
        approvedBy: admin._id,
    },
    {
        title: 'Introduction to Machine Learning Workshop',
        description: 'A hands-on workshop covering ML fundamentals, Python libraries, and practical projects. Beginners welcome!',
        clubId: acmOrg._id,
        createdBy: clubHead._id,
        status: 'pending',
        startDate: twoWeeks,
        endDate: new Date(twoWeeks.getTime() + 3600000 * 4),
        venue: 'Lab Block 3, Room 301',
        capacity: 60,
        registrationCount: 0,
        visibility: 'public',
        tags: ['ml', 'workshop', 'python'],
    },
    {
        title: 'Annual Sports Fest 2026',
        description: 'Thrilling multi-sport competition across cricket, football, basketball, badminton and athletics.',
        clubId: orgDocs.find((o) => o.shortName === 'sportsfest')._id,
        createdBy: admin._id,
        status: 'approved',
        startDate: new Date(now.getTime() + 21 * 86400000),
        endDate: new Date(now.getTime() + 23 * 86400000),
        venue: 'College Grounds',
        capacity: 500,
        registrationCount: 120,
        visibility: 'public',
        tags: ['sports', 'competition'],
        approvedBy: admin._id,
    },
]);

console.log(`✅ ${events.length} Events seeded`);

// Student registers for Hackathon
await Registration.create({
    eventId: events[0]._id,
    studentId: student._id,
    status: 'registered',
});
await Event.findByIdAndUpdate(events[0]._id, { $inc: { registrationCount: 0 } }); // already counted above

// ─── Sample Feed Posts ──────────────────────────────────────────────────────
await Post.insertMany([
    {
        authorId: admin._id,
        authorType: 'user',
        content: '🎉 Welcome to the Campus Social & Event Ecosystem! Explore clubs, register for events, connect with peers, and more. Let\'s make this semester amazing!',
        postType: 'announcement',
        isPublic: true,
        likes: [student._id, student2._id, clubHead._id],
    },
    {
        authorId: clubHead._id,
        authorType: 'user',
        content: '🚀 Hackathon 2026 registrations are now OPEN! Form your team of 2-4 members and get ready for 24 hours of innovation. Prizes worth ₹50,000 await! Link in events. #Hackathon2026 #ACM',
        postType: 'post',
        targetOrgId: acmOrg._id,
        eventId: events[0]._id,
        isPublic: true,
        likes: [student._id, student2._id],
    },
    {
        authorId: student._id,
        authorType: 'user',
        content: 'Just registered for Hackathon 2026! 💻 Anyone want to team up? DM me if you have skills in React or ML! #TeamLFM',
        postType: 'post',
        isPublic: true,
        likes: [student2._id],
        comments: [
            { userId: student2._id, comment: 'Count me in! I can do the ML part 🙌', createdAt: new Date() },
        ],
    },
]);

console.log('✅ Sample posts seeded');

// ─── Summary ────────────────────────────────────────────────────────────────
console.log('\n🌱 Seed Complete!');
console.log('─────────────────────────────────────');
console.log('👤 Admin:     admin@campus.edu    / Admin@123');
console.log('👤 Club Head: head@campus.edu     / Head@123    (username: alexjohnson)');
console.log('👤 Student:   student@campus.edu  / Student@123 (username: samstudent)');
console.log(`🏛  ${orgDocs.length} Organizations seeded`);
console.log(`📅 ${events.length} Events seeded`);
console.log('─────────────────────────────────────\n');

await mongoose.disconnect();
process.exit(0);
