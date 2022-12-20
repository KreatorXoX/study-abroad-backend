const mongoose = require('mongoose')
const Application = require('./Application')
const User = require('./User')

const Schema = mongoose.Schema

const universitySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  logo: {
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    }
  },
  generalInfo: {
    type: String,
    required: true
  },
  motto: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  infoBoxes: {
    box1: {
      header: { type: String, required: true },
      content: { type: String, required: true }
    },
    box2: {
      header: { type: String, required: true },
      content: { type: String, required: true }
    },
    box3: {
      header: { type: String, required: true },
      content: { type: String, required: true }
    }
  },
  country: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Country'
  }
})

universitySchema.post('findOneAndRemove', async function(uni) {
  if (uni) {
    // need to change the logic like this because mongoose circular dependency error.
    const uniWithCountry = await uni.populate('country')
    const applications = await Application.find({ university: uni._id })
    const userIds = applications.map(app => app.user)
    const users = await User.find({ _id: { $in: userIds } })
    for (let user of users) {
      user.applications.pull(applications.map(app => app._id))
      await user.save()
    }
    await Application.deleteMany({ university: uni._id })
    const country = uniWithCountry.country
    country.universities.pull(uni._id)
    await country.save()
  }
})

module.exports = mongoose.model('University', universitySchema)
