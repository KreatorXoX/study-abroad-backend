const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const { validationResult } = require('express-validator')

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Fields are required', ...errors })
  }
  const { username, email, password, role = 'user' } = req.body

  let userImage = undefined

  if (req.file) {
    userImage = { url: req.file.path, filename: req.file.filename }
  }
  const duplicateUser = await User.findOne({ email })
    .lean()
    .exec()

  if (duplicateUser) {
    return res
      .status(401)
      .json({ message: 'User already exists with that email' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    role,
    image: userImage,
    tasks: [],
    applications: [],
    assignedConsultants: []
  })

  const accessToken = jwt.sign(
    {
      UserInfo: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30m' }
  )
  const refreshToken = jwt.sign(
    { _id: newUser._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  )

  res.cookie('jwtToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({ accessToken })
})

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Fields are required', ...errors })
  }
  const { email, password } = req.body

  const foundUser = await User.findOne({ email }).exec()

  if (!foundUser) {
    return res.status(401).json({ message: 'Authentication failed' })
  }

  const match = await bcrypt.compare(password, foundUser.password)

  if (!match) {
    return res.status(401).json({ message: 'Authentication failed' })
  }

  const accessToken = jwt.sign(
    {
      UserInfo: {
        _id: foundUser._id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role
      }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30m' }
  )
  const refreshToken = jwt.sign(
    { _id: foundUser._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  )

  res.cookie('jwtToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  res.json({ accessToken })
})

const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies

  if (!cookies?.jwtToken)
    return res.status(401).json({ message: 'Unauthorized' })

  const refreshToken = cookies.jwtToken

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Forbiden Access' })

      const foundUser = await User.findById(decoded._id).exec()

      if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

      const accessToken = jwt.sign(
        {
          UserInfo: {
            _id: foundUser._id,
            username: foundUser.username,
            email: foundUser.email,
            role: foundUser.role
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '30m' }
      )

      res.json({ accessToken })
    })
  )
})

const logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies

  if (!cookies?.jwtToken) return res.sendStatus(204)
  res.clearCookie('jwtToken', {
    httpOnly: true,
    sameSite: 'None',
    secure: true
  })
  res.json({ message: 'Cookie cleared' })
})

module.exports = {
  register,
  login,
  refresh,
  logout
}
