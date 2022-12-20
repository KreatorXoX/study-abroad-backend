const express = require('express')
const userController = require('../controllers/userController')
const { check } = require('express-validator')
const router = express.Router()
const verifyAuth = require('../middleware/verifyAuth')

router.use(verifyAuth)

router
  .route('/')
  .get(userController.getAllUsers)
  .post(
    [
      check('username')
        .isString()
        .isLength({ min: 3 }),
      check('email').isEmail(),
      check('password', 'password min length is 6')
        .isString()
        .isLength({ min: 6 })
    ],
    userController.createNewUser
  )
  .patch(
    [
      check('id').isMongoId(),
      check('username')
        .not()
        .isEmpty(),
      check('email').isEmail(),
      check('password')
        .not()
        .isEmpty(),
      check('active').isBoolean()
    ],
    userController.updateUser
  )
  .delete(userController.deleteUser)
router
  .route('/role/:role')
  .get(
    [check('role').isIn(['employee', 'user', 'admin'])],
    userController.getUsersByRole
  )
router
  .route('/assign')
  .patch(
    [check('stdId').isMongoId(), check('consultIds.*').isMongoId()],
    userController.assignUsers
  )
router
  .route('/deassign')
  .patch(
    [check('stdId').isMongoId(), check('consultId').isMongoId()],
    userController.deAssignUsers
  )
router.route('/:id').get([check('id').isMongoId()], userController.getUserById)

module.exports = router
