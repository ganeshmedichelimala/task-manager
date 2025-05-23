const { Router } = require("express");
const taskRouter = Router();
const { userMiddleware } = require("../middleware/userMiddleware");
const userModel = require("../db/db");

taskRouter.post("/", userMiddleware, async (req, res) => {
  const { title, description, status } = req.body;
  if (!title || !description) {
    return res.json({ message: "All inputs fields are required" });
  }
  const userId = req.userId;
  try {
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "No user found" });
    }
    user.tasks.push({ title: title, description: description, status: status });
    await user.save();
    const addedTask = user.tasks[user.tasks.length - 1];
    res.json({ message: "task added successfully", taskId: addedTask._id });
  } catch (err) {
    res.json({ message: "Error while adding task" });
  }
});

taskRouter.get("/", userMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.json({ message: "No user found" });
    }
    const tasks = user.tasks;
    res.json({ tasks: tasks });
  } catch (err) {
    res.json({ message: "Error while fetching tasks" });
  }
});

taskRouter.put("/:taskId", userMiddleware, async (req, res) => {
  const userId = req.userId;
  const taskId = req.params.taskId;
  if (!taskId) {
    return res.status(400).json({ message: "taskId is required" });
  }
  const { title, description, status } = req.body;
  try {
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const task = user.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) {
      if (["pending", "completed"].includes(status)) {
        task.status = status;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid status value : ['pending', 'completed']" });
      }
    }
    await user.save();
    res.json({ message: "Task updated successfully", task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error while updating task" });
  }
});

taskRouter.delete("/:taskId", userMiddleware, async (req, res) => {
  const taskId = req.params.taskId;
  const userId = req.userId;
  if (!taskId) {
    return res.status(400).json({ message: "taskId is required" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const task = user.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    user.tasks = user.tasks.filter((t) => t._id.toString() !== taskId);

    await user.save();
    return res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error while deleting task" });
  }
});

module.exports = taskRouter;
