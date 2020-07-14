const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')
const User = require('../../models/users')
const Post = require('../../models/Post')

// @route       GET api/posts
// @desc        Test router
// @access      Public
router.get('/', (req, res) => {
    res.send('Post route')
})


// @route       POST api/posts
// @desc        Create a Post
// @access      Private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(401).json({ errors })
    }

    try {
        const user = await User.findById(req.user.id).select('-password')

        const newPost = new Post({
            user: user._id,
            text: req.body.text,
            name: user.name,
            avatar: user.avatar
        })

        const post = await newPost.save()

        res.json(post)

    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})


module.exports = router