import mongoose from 'mongoose';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

    // 1. Task Distribution (Pie Chart)
    const taskDistribution = await Task.aggregate([
      { $match: { workspace: workspaceObjectId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Priority Analysis (Stacked Chart data)
    const priorityAnalysis = await Task.aggregate([
      { $match: { workspace: workspaceObjectId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // 3. Productivity Overview
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const tasksCompletedToday = await Task.countDocuments({ workspace: workspaceId, status: 'Done', updatedAt: { $gte: today } });
    const tasksCompletedWeek = await Task.countDocuments({ workspace: workspaceId, status: 'Done', updatedAt: { $gte: startOfWeek } });
    const tasksCompletedMonth = await Task.countDocuments({ workspace: workspaceId, status: 'Done', updatedAt: { $gte: startOfMonth } });
    
    const pendingTasks = await Task.countDocuments({ workspace: workspaceId, status: { $in: ['To Do', 'In Progress'] } });
    const overdueTasks = await Task.countDocuments({ workspace: workspaceId, dueDate: { $lt: today }, status: { $ne: 'Done' } });

    const totalTasks = await Task.countDocuments({ workspace: workspaceId });
    const completionRate = totalTasks > 0 ? ((totalTasks - pendingTasks) / totalTasks) * 100 : 0;
    
    // Average completion time (simplified, using timeSpent if tracked, else dummy data)
    const avgCompletionQuery = await Task.aggregate([
      { $match: { workspace: workspaceObjectId, status: 'Done' } },
      { $group: { _id: null, avgTime: { $avg: "$timeSpent" } } }
    ]);
    const avgCompletionTime = avgCompletionQuery.length > 0 ? avgCompletionQuery[0].avgTime : 0;

    const productivityScore = Math.min(100, Math.max(0, completionRate - (overdueTasks * 5))); // Custom heuristic

    // 4. Team Performance & Workload Distribution
    const teamPerformance = await Task.aggregate([
      { $match: { workspace: workspaceObjectId } },
      { $group: {
          _id: '$assignee',
          totalTasks: { $sum: 1 },
          completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] } },
          overdueTasks: { $sum: { $cond: [{ $and: [{ $lt: ['$dueDate', today] }, { $ne: ['$status', 'Done'] }] }, 1, 0] } }
        }
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: {
          name: { $ifNull: ['$user.name', 'Unassigned'] },
          avatar: '$user.avatar',
          totalTasks: 1,
          completedTasks: 1,
          overdueTasks: 1,
          completionPercentage: {
            $cond: [ { $eq: ['$totalTasks', 0] }, 0, { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] } ]
          }
      }},
      { $sort: { completedTasks: -1 } }
    ]);

    // 5. Completion Trends (Daily over last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const completionTrends = await Task.aggregate([
      { $match: { workspace: workspaceObjectId, status: 'Done', updatedAt: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 6. Activity Timeline
    const activityTimeline = await ActivityLog.find({ workspace: workspaceId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name avatar')
      .populate('task', 'title');

    res.status(200).json({
      productivity: {
        tasksCompletedToday, tasksCompletedWeek, tasksCompletedMonth,
        pendingTasks, overdueTasks, completionRate: completionRate.toFixed(1),
        avgCompletionTime, productivityScore
      },
      taskDistribution: taskDistribution.map(t => ({ name: t._id, value: t.count })),
      priorityAnalysis: priorityAnalysis.map(p => ({ name: p._id, value: p.count })),
      teamPerformance,
      completionTrends,
      activityTimeline
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};
