const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')
const User = require('../../models/users')
const Post = require('../../models/Post')

// @route       GET api/posts/
// @desc        Get All Posts
// @access      Private
router.get('/', auth, async(req, res) => {
    try {
        const posts = await Post.find({}).sort({ date: -1 })
        res.json(posts)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})


// @route       GET api/posts/:id
// @desc        Get Post by ID
// @access      Private
router.get('/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }

        res.json(post)
    } catch (err) {
        console.error(err.message)
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        res.status(500).send('Server error')
    }
})





// @route       POST api/posts
// @desc        Create a Post
// @access      Private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors })
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


// @route       DELETE api/posts/:id
// @desc        Delete Post by ID
// @access      Private
router.delete('/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' })
        }

        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'You are not authorized to delete this post' })
        }

        await post.remove()

        res.json({ msg: 'Post Deleted' })
    } catch (err) {
        console.error(err.message)
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' })
        }
        res.status(500).send('Server error')
    }
})

// @route       PUT api/posts/like/:id
// @desc        Like a Post
// @access      Private
router.put('/like/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        // if the post was already liked, then unlike it
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)
            post.likes.splice(removeIndex, 1);
            await post.save()
            return res.json(post.likes)
        }

        post.likes.unshift({ user: req.user.id })

        await post.save()

        res.json(post.likes)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server error')
    }
})


module.exports = router