const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Book = require('../models/Books')

// add page

router.get('/add', ensureAuth, (req, res) => {
  res.render('books/add')
})

// add form

router.post('/', ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id
    await Book.create(req.body)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

//Show all books
router.get('/', ensureAuth, async (req, res) => {
  try {
    const books = await Book.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

    res.render('books/index', {
      books,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// Show 

router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let book = await Story.findById(req.params.id).populate('user').lean()

    if (!book) {
      return res.render('error/404')
    }

    if (book.user._id != req.user.id && book.status == 'private') {
      res.render('error/404')
    } else {
      res.render('books/show', {
        story,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

 // edit page

router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
    }).lean()

    if (!book) {
      return res.render('error/404')
    }

    if (book.user != req.user.id) {
      res.redirect('/books')
    } else {
      res.render('books/edit', {
        story,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

//Update 
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let book = await Book.findById(req.params.id).lean()

    if (!book) {
      return res.render('error/404')
    }

    if (book.user != req.user.id) {
      res.redirect('/books')
    } else {
      book = await Book.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

//   DELETE 
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let book = await Book.findById(req.params.id).lean()

    if (!book) {
      return res.render('error/404')
    }

    if (book.user != req.user.id) {
      res.redirect('/books')
    } else {
      await Book.deleteOne({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})


//search
router.get('/search/:query', ensureAuth, async (req, res) => {
    try {
        const books = await Book.find({ title: new RegExp(req.query.query, 'i'), status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('books/index', { books })
    } catch (err) {
        console.log(err)
        res.render('error/404')
    }
})


//user
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const books = await Book.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('books/index', {
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})




module.exports = router
