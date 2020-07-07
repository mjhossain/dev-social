const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')

const Profile = require('../../models/Profile')


// @route       GET api/profile/me
// @desc        Get User Profile
// @access      Public
router.get('/me', auth, async(req, res) => {
    try {
        const profile = await await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar'])
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found!' })
        }
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})

module.exports = router