require('dotenv').config();
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const requestLogger = require('./middlewares/requestLogger');
const Person = require('./models/person')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)


morgan.token('body', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
    return '';
});
const customTinyFormat = ':method :url :status :res[content-length] - :response-time ms :body';
app.use(morgan(customTinyFormat))

let persons = []

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
  
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const {name, number } = request.body;
  Person.findByIdAndUpdate(
    request.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query' }
  )
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))
})

/*
const generateId = () => {
  const maxId = persons.length > 0
  ? Math.max(...persons.map(n => Number(n.id))) : 0
  return String(maxId + 1)
}
*/
  
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    numerPeople = persons.length;
    response.send(`<p>Phonebook has info for ${numerPeople} people</p><p>${new Date()}</p>`)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)
  
const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })