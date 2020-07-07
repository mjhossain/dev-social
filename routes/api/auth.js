const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator/check')

const User = require('../../models/users')


// @route       GET api/auth
// @desc        Test router
// @access      Public
router.get('/', auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).send('Server error')
    }
})


// @route       Post api/auth
// @desc        Login & Get Token
// @access      Public
router.post('/', [
    check('email', 'Please enter a valid email.').isEmail(),
    check('password', 'Please enter a password with atlease 6 characters.').isLength({ min: 6 })
], async(req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const { email, password } = req.body

    try {

        // Check if user exists
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid Credintials'
                }]
            })
        }

        // Check Password
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(400).json({
                errors: [{
                    msg: 'Invalid Credintials'
                }]
            })
        }



        // Return JSON web Token
        const payload = {
            user: {
                id: user._id
            }
        }

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.status(201).json({ token })
        })

    } catch (err) {
        res.status(500).send(err.message)
    }


})


module.exports = router