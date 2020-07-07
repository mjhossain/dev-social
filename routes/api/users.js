const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator/check')
const bcrypt = require('bcryptjs')
const gravatar = require('gravatar')
const jwt = require('jsonwebtoken')
const config = require('config')

const User = require('../../models/users')

// @route       Post api/users
// @desc        Test router
// @access      Public
router.post('/', [
    check('name', 'Name is required!').not().isEmpty(),
    check('email', 'Please enter a valid email.').isEmail(),
    check('password', 'Please enter a password with atlease 6 characters.').isLength({ min: 6 })
], async(req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }

    const { name, email, password } = req.body

    try {

        // Check if user exists
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({
                errors: [{
                    msg: 'User already exists!'
                }]
            })
        }

        // Getting avatar
        const avatar = await gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })

        // Creating user
        user = new User({
            name,
            email,
            password,
            avatar
        })

        // Encrypting password
        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password, salt)


        // Save user
        await user.save()

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