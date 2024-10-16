require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

const Person = require('./models/person')

const PORT = 3001

const isEmpty = (obj) => {
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false
    }
  }

  return true
}

const errorHandler = (error, _, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  if (error.name === 'MissingDataError' || error.name === 'MissingIdError') {
    return res.status(400).json({ error: error.message })
  }

  console.error(error)
  next(error)
}

const unknownEndpoint = (_, res) => {
  res.status(404).send('<h2>Page not found</h2>')
}

/* let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122'
  }
] */

const app = express()
app.use(express.static('frontend'))
app.use(express.json())
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      isEmpty(req.body) ? null : JSON.stringify(req.body)
    ].join(' ')
  })
)

app.get('/', (_, res) => {
  res.send('Hello World')
})

app.get('/api/persons', async (_, res, next) => {
  try {
    const people = await Person.find({})
    res.json(people)
  } catch (error) {
    next(error)
  }
})

app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id) {
      throw { name: 'MissingIdError', message: 'id is missing' }
    }

    const person = await Person.findById(id)
    if (!person) {
      return res.status(404).json({
        error: 'person not found'
      })
    }
    res.json(person)
  } catch (error) {
    next(error)
  }
})

app.post('/api/persons', async (req, res, next) => {
  try {
    const { name, number } = req.body
    if (!name || !number) {
      throw {
        name: 'MissingDataError',
        message: 'name and number are required'
      }
    }

    const person = await new Person({
      name,
      number
    }).save()
    res.json(person)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id) {
      throw { name: 'MissingIdError', message: 'id is missing' }
    }

    await Person.findByIdAndDelete(id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.put('/api/persons/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, number } = req.body
    if (!id) {
      throw { name: 'MissingIdError', message: 'id is missing' }
    }
    if (!name || !number) {
      throw {
        name: 'MissingDataError',
        message: 'name and number are required'
      }
    }

    const person = await Person.findByIdAndUpdate(
      id,
      { name, number },
      { new: true }
    )
    res.json(person)
  } catch (error) {
    next(error)
  }
})

app.get('/info', async (req, res, next) => {
  const date = new Date()
  try {
    const count = await Person.countDocuments()
    res.send(
      `<p>Phonebook has info for ${count} people</p><p>${date.toString()}</p>`
    )
  } catch (error) {
    next(error)
  }
})

app.use(errorHandler)
app.use(unknownEndpoint)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
