require('dotenv').config();
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

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

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
})

app.put('/api/persons/:id', (request, response) => {
  const {name, number } = request.body;
  Person.findByIdAndUpdate(
    request.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query' }
  )
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
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
    numerPeople = persons.length;
    response.send(`<p>Phonebook has info for ${numerPeople} people</p><p>${new Date()}</p>`)
})
  
const PORT = process.env.PORT
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })