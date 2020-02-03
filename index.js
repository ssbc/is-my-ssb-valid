const Validator = require('is-my-json-valid')
const getContent = require('ssb-msg-content')

module.exports = function BuildValidator (schema) {
  const isValid = Validator(schema, { verbose: true })

  return function validator (msg) {
    const result = isValid(getContent(msg))

    validator.errors = isValid.errors
    validator.errorsString = stringify(validator.errors)

    return result
  }
}

function stringify (errors) {
  if (!errors) return ''

  return errors
    .map(e => `${e.field} ${e.message}`)
    .join('; ')
}
