import Task from '../models/Task.js';
import User from '../models/User.js';

// Very basic NLP-like heuristic parser
// Example queries:
// "Show overdue frontend tasks assigned to Rahul."
// "Critical tasks for next week"

export const parseSmartQuery = async (query, workspaceId) => {
  const matchQuery = { workspace: workspaceId };
  const lowerQuery = query.toLowerCase();

  // 1. Check for overdue
  if (lowerQuery.includes('overdue')) {
    matchQuery.dueDate = { $lt: new Date() };
    matchQuery.status = { $ne: 'Done' };
  }

  // 2. Check for priority
  const priorities = ['low', 'medium', 'high', 'critical'];
  for (const p of priorities) {
    if (lowerQuery.includes(p)) {
      matchQuery.priority = p.charAt(0).toUpperCase() + p.slice(1);
    }
  }

  // 3. Check for status
  const statuses = ['to do', 'in progress', 'done', 'blocked', 'cancelled'];
  for (const s of statuses) {
    if (lowerQuery.includes(s)) {
       const formattedStatus = s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
       // Note: To Do, In Progress
       matchQuery.status = formattedStatus === 'To do' ? 'To Do' : formattedStatus;
    }
  }

  // 4. Try to find a user assignment by name in the workspace
  // Very crude check for words starting with capital letters or specific keywords after "assigned to"
  const assignMatch = lowerQuery.match(/assigned to (\w+)/);
  if (assignMatch && assignMatch[1]) {
     const name = assignMatch[1];
     const user = await User.findOne({ name: { $regex: new RegExp(name, 'i') } });
     if (user) {
        matchQuery.assignee = user._id;
     }
  }

  // 5. General text search fallback on title if it's not purely keywords
  if (!matchQuery.priority && !matchQuery.status && !matchQuery.dueDate && !matchQuery.assignee) {
      matchQuery.title = { $regex: query, $options: 'i' };
  }

  return await Task.find(matchQuery).populate('assignee', 'name avatar');
};
