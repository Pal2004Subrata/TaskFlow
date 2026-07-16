import Workflow from '../models/Workflow.js';
import { executeWorkflowAction } from './workflowEngine.js';

// In-Memory Queue implementation as a fallback for BullMQ/Redis
// to ensure the app doesn't crash if Redis is not installed locally.

const queue = [];
let isProcessing = false;

const evaluateCondition = (condition, task) => {
  const taskValue = task[condition.field];
  const conditionValue = condition.value;

  switch (condition.operator) {
    case 'equals': return taskValue === conditionValue;
    case 'not_equals': return taskValue !== conditionValue;
    case 'contains': return typeof taskValue === 'string' && taskValue.includes(conditionValue);
    case 'greater_than': return taskValue > conditionValue;
    case 'less_than': return taskValue < conditionValue;
    case 'becomes': return taskValue === conditionValue;
    default: return false;
  }
};

const processJob = async (job) => {
  const { eventType, task, previousTaskState } = job;
  
  try {
    const workflows = await Workflow.find({
      workspace: task.workspace,
      isActive: true,
      trigger: eventType
    });

    for (const workflow of workflows) {
      let conditionsMet = true;

      if (workflow.conditions && workflow.conditions.length > 0) {
        for (const condition of workflow.conditions) {
          if (condition.operator === 'becomes') {
             if (previousTaskState && previousTaskState[condition.field] === condition.value) {
               conditionsMet = false;
             } else if (task[condition.field] !== condition.value) {
               conditionsMet = false;
             }
          } else {
            if (!evaluateCondition(condition, task)) {
              conditionsMet = false;
              break;
            }
          }
        }
      }

      if (conditionsMet) {
        for (const action of workflow.actions) {
          await executeWorkflowAction(action, task);
        }
        workflow.executionCount += 1;
        await workflow.save();
      }
    }
  } catch (error) {
    console.error('Error processing workflow job:', error.message);
  }
};

const processQueue = async () => {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;
  
  while (queue.length > 0) {
    const job = queue.shift();
    await processJob(job);
  }
  
  isProcessing = false;
};

export const workflowQueue = {
  add: (name, data) => {
    queue.push(data);
    processQueue();
  }
};
