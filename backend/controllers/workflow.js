import Workflow from '../models/Workflow.js';

export const getWorkflows = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workflows = await Workflow.find({ workspace: workspaceId }).populate('createdBy', 'name');
    res.status(200).json(workflows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workflows', error: error.message });
  }
};

export const createWorkflow = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, trigger, conditions, actions, isActive } = req.body;
    
    const workflow = await Workflow.create({
      name,
      description,
      workspace: workspaceId,
      createdBy: req.user._id, // Assuming `protect` middleware adds req.user
      trigger,
      conditions,
      actions,
      isActive
    });

    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ message: 'Error creating workflow', error: error.message });
  }
};

export const updateWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    const updated = await Workflow.findByIdAndUpdate(workflowId, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating workflow', error: error.message });
  }
};

export const deleteWorkflow = async (req, res) => {
  try {
    const { workflowId } = req.params;
    await Workflow.findByIdAndDelete(workflowId);
    res.status(200).json({ message: 'Workflow deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting workflow', error: error.message });
  }
};
