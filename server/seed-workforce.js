const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Worker = require('./models/Worker');
const Contractor = require('./models/Contractor');
const Connection = require('./models/Connection');
const ConnectionRequest = require('./models/ConnectionRequest');
const Task = require('./models/Task');
const Attendance = require('./models/Attendance');
const Payment = require('./models/Payment');
const Rating = require('./models/Rating');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const seedWorkforceData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://cardora:cardora2026@cluster0.mongodb.net/cardora?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
    console.log('🌱 Connected to MongoDB Atlas for seeding workforce data...');

    // 1. Create or Find Plantation Owner User
    let ownerUser = await User.findOne({ email: 'owner@cardora.com' });
    if (!ownerUser) {
      ownerUser = await User.create({
        name: 'Mathew George',
        username: 'mathew_estates',
        email: 'owner@cardora.com',
        password: 'password123',
        role: 'Plantation Owner',
        phone: '+91 94471 23456',
        location: 'Vandanmedu, Idukki',
        district: 'Idukki',
        bio: 'Owner of Vandanmedu Green Estate (45 Acres Cardamom Plantation)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        isVerified: true,
      });
    }

    // 2. Sample Workers: Disabled (Only authentic user-created workers allowed)
    const createdWorkerUsers = [];


    // 3. Create Sample Labor Contractor
    let contractorUser = await User.findOne({ email: 'contractor@cardora.com' });
    if (!contractorUser) {
      contractorUser = await User.create({
        name: 'Highrange Labor Solutions (Vijayan N.)',
        username: 'highrange_contractor',
        email: 'contractor@cardora.com',
        password: 'password123',
        role: 'Labor Contractor',
        phone: '+91 94472 99887',
        location: 'Kattappana, Idukki',
        district: 'Idukki',
        bio: 'Registered labor contractor supplying 30+ trained plantation workers across Idukki district.',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
        isVerified: true,
      });
    }

    let contractorProf = await Contractor.findOne({ user: contractorUser._id });
    if (!contractorProf) {
      await Contractor.create({
        user: contractorUser._id,
        companyName: 'Highrange Spice Workers Guild',
        contractorId: 'CTR-8801',
        registrationNumber: 'KLA-LAB-2025-992',
        district: 'Idukki',
        phone: '+91 94472 99887',
        teamSize: 28,
        managedWorkers: createdWorkerUsers.slice(0, 3).map((u) => u._id),
        preferredDistricts: ['Idukki', 'Wayanad', 'Palakkad'],
        rating: 4.9,
        completedProjects: 65,
        isVerified: true,
      });
    }

    // 4. Create Active Connections between Owner and Workers
    for (const wUser of createdWorkerUsers.slice(0, 2)) {
      const connExists = await Connection.findOne({ user1: ownerUser._id, user2: wUser._id });
      if (!connExists) {
        await Connection.create({
          user1: ownerUser._id,
          user2: wUser._id,
          roleType: 'owner_worker',
          status: 'active',
        });
      }
    }

    // Create Connection between Owner and Contractor
    const connContractor = await Connection.findOne({ user1: ownerUser._id, user2: contractorUser._id });
    if (!connContractor) {
      await Connection.create({
        user1: ownerUser._id,
        user2: contractorUser._id,
        roleType: 'owner_contractor',
        status: 'active',
      });
    }

    // 5. Create Pending Connection Request for 3rd worker
    const reqExists = await ConnectionRequest.findOne({ sender: createdWorkerUsers[2]._id, receiver: ownerUser._id });
    if (!reqExists) {
      await ConnectionRequest.create({
        sender: createdWorkerUsers[2]._id,
        receiver: ownerUser._id,
        roleType: 'owner_worker',
        note: 'Interested in working on your Vandanmedu estate during peak harvest season.',
        status: 'pending',
      });
    }

    // 6. Create Active & Completed Tasks
    let task1 = await Task.findOne({ title: 'Monsoon Capsule Harvesting - Block A' });
    if (!task1) {
      task1 = await Task.create({
        title: 'Monsoon Capsule Harvesting - Block A',
        description: 'Selective hand-picking of mature green cardamom capsules across 12 acres. Avoid harvesting immature yellow pods.',
        priority: 'High',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        plantationName: 'Vandanmedu Green Estate',
        owner: ownerUser._id,
        assignedWorkers: [createdWorkerUsers[0]._id, createdWorkerUsers[1]._id],
        requiredWorkersCount: 4,
        dailyWage: 900,
        status: 'in_progress',
        progressUpdates: [
          {
            author: createdWorkerUsers[0]._id,
            authorName: createdWorkerUsers[0].name,
            text: 'Completed harvesting row 1 to 14. Gathered 85 kg green capsules today.',
            timestamp: new Date(),
          },
        ],
      });
    }

    // 7. Seed Attendance Log
    const todayStr = new Date().toISOString().split('T')[0];
    const attExists = await Attendance.findOne({ worker: createdWorkerUsers[0]._id, date: todayStr });
    if (!attExists) {
      await Attendance.create({
        worker: createdWorkerUsers[0]._id,
        task: task1._id,
        plantationName: 'Vandanmedu Green Estate',
        date: todayStr,
        checkInTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        checkInLocation: { lat: 9.7891, lng: 77.1685, address: 'Vandanmedu Block A, Idukki' },
        workingHours: 6.5,
        status: 'Present',
      });
    }

    // 8. Seed Payment Record & Digital Receipt
    const payExists = await Payment.findOne({ payer: ownerUser._id, payee: createdWorkerUsers[0]._id });
    if (!payExists) {
      await Payment.create({
        payer: ownerUser._id,
        payee: createdWorkerUsers[0]._id,
        task: task1._id,
        amount: 2700,
        paymentType: 'Daily Wage',
        paymentMethod: 'UPI',
        upiReference: 'UPI994812304918',
        notes: '3 Days Cardamom Harvest Settlement - Block A',
        status: 'Completed',
      });
    }

    // 9. Seed Rating & Review
    const ratingExists = await Rating.findOne({ rater: ownerUser._id, ratedUser: createdWorkerUsers[0]._id });
    if (!ratingExists) {
      await Rating.create({
        rater: ownerUser._id,
        ratedUser: createdWorkerUsers[0]._id,
        task: task1._id,
        score: 5,
        reviewText: 'Punctual, efficient, and very careful with capsule sorting. Highly recommended!',
        professionalism: 5,
        quality: 5,
        communication: 5,
        punctuality: 5,
      });
    }

    console.log('✅ Workforce Seed Completed Successfully!');
  } catch (err) {
    console.error('❌ Error seeding workforce data:', err);
  }
};

seedWorkforceData();
