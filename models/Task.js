const mongoose = require('mongoose')
const Schema = mongoose.Schema

const taskSchema = new Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
      }
    ],
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: false
    },
    completed: {
      byStudent: {
        type: Boolean,
        default: false
      },
      byEmployee: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true
  }
)

taskSchema.post('findOneAndRemove', async function(task) {
  if (task) {
    const populatedTask = await task.populate('users')
    const users = populatedTask.users

    for (let user of users) {
      user.tasks.pull(task._id)
      await user.save()
    }
  }
})
module.exports = mongoose.model('Task', taskSchema)
