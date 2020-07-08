const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Profile = require('../../models/Profile')
const { restart } = require('nodemon')


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


// @route       POST api/profile/me
// @desc        Create/Update User Profile
// @access      Private
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty()
]], async(req, res) => {

    // Checking if there is any errors from validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    // Destructure everything from the request
    const {
        company,
        location,
        website,
        bio,
        skills,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
    } = req.body;

    //   Build Profile object
    const profileFields = {}
    profileFields.user = req.user.id
    if (company) profileFields.company = company
    if (location) profileFields.location = location
    if (website) profileFields.website = website
    if (bio) profileFields.bio = bio
    if (status) profileFields.status = status
    if (githubusername) profileFields.githubusername = githubusername
    if (company) profileFields.company = company

    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }

    // Social profiles
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube
    if (twitter) profileFields.social.twitter = twitter
    if (instagram) profileFields.social.instagram = instagram
    if (linkedin) profileFields.social.linkedin = linkedin
    if (facebook) profileFields.social.facebook = facebook

    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if (profile) {
            // Update if profile exists
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true })
            return res.status(200).send(profile)
        }

        profile = new Profile(profileFields)
        await profile.save()
        res.send(profile)

    } catch (err) {
        console.error(err.message)
        res.status(500).json({ error: 'Server Error' })
    }

})


// @route       GET api/profiles
// @desc        Get all profiles
// @access      Public
router.get('/', async(req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles)
    } catch (err) {
        res.status(500).send('Server Error')
    }
})


// @route       GET api/profile
// @desc        Get profile by id
// @access      Public
router.get('/user/:user_id', async(req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found!' })
        }
        res.json(profile)
    } catch (err) {
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'Profile not found!' })
        }
        res.status(500).send('Server Error')
    }
})


module.exports = router