const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

//eslint-disable-next-line
const [_, __, password, name, number] = process.argv
const url = `mongodb+srv://fullstack:${password}@fso-cluster-0.k69uq.mongodb.net/?retryWrites=true&w=majority&appName=fso-cluster-0`
mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})
const Person = mongoose.model('Person', personSchema)

if (name && number) {
  const note = new Person({
    name,
    number
  })

  note.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
    process.exit(0)
  })
} else {
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((person) => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
    process.exit(0)
  })
}
