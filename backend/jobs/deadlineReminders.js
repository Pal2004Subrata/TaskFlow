import cron from 'node-cron';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';

const scheduleDeadlineReminders = () => {
  // Run every hour to check for upcoming deadlines
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // Find tasks due between now and 24 hours from now, that are not 'Done'
      const upcomingTasks = await Task.find({
        status: { $ne: 'Done' },
        dueDate: { 
          $gte: now, 
          $lte: in24Hours 
        },
        assignee: { $exists: true, $ne: null }
      });

      for (const task of upcomingTasks) {
        // To avoid spamming, we could check if a reminder was already sent.
        // For simplicity, we assume one reminder per 24hr window is fine,
        // or we check if there's already a notification for this task in the last 24h.
        const recentReminder = await Notification.findOne({
          user: task.assignee,
          link: `/workspace/${task.workspace}`,
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        });

        if (!recentReminder) {
          await Notification.create({
            user: task.assignee,
            title: 'Upcoming Deadline Reminder',
            message: `Your task "${task.title}" is due soon!`,
            link: `/workspace/${task.workspace}`
          });
        }
      }
    } catch (error) {
      console.error('Error in deadline reminder job:', error);
    }
  });
};

export default scheduleDeadlineReminders;
