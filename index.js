const Validator = require('is-my-json-valid')
const getContent = require('ssb-msg-content')

module.exports = function BuildValidator (schema, extras = []) {
  if (!Array.isArray(extras)) throw new Error('BuildValidator extras should be an Array')

  const isValid = Validator(schema, { verbose: true })

  return function validator (msg) {
    var result = isValid(getContent(msg))

    validator.errors = isValid.errors

    extras.forEach(fn => {
      const extraResult = fn(getContent(msg))
      if (extraResult === true) return

      if (!validator.errors) validator.errors = []
      validator.errors.push(extraResult)
      result = false
    })

    validator.errorsString = stringify(validator.errors)

    return result
  }
}

function stringify (errors) {
  if (!errors) return ''

  return errors
    .map(e => e.field && e.message
      ? `${e.field} ${e.message}`
      : e.toString()
    )
    .join('; ')
}
