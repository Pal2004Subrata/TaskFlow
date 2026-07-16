import mongoose from 'mongoose';
import Task from './models/Task.js';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow');
    console.log('Connected to DB');

    // Create a mock user, workspace if needed, or just use hardcoded ObjectIds
    const workspaceId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const task = await Task.create({
      title: 'Test Task',
      workspace: workspaceId,
      createdBy: userId,
      assignee: userId
    });

    console.log('Task created successfully:', task._id);
  } catch (error) {
    console.error('Error creating task:');
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

test();
