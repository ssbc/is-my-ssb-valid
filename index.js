const AJV = require('ajv')
const getContent = require('ssb-msg-content')

module.exports = function BuildValidator (schema, extras = []) {
  if (!Array.isArray(extras)) throw new Error('BuildValidator extras should be an Array')

  const ajv = new AJV({
    allErrors: true
  })
  const isValid = ajv.compile(schema)

  return function validator (msg) {
    let result = isValid(getContent(msg))

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
    .map(e => {
      if (typeof e.instancePath !== 'string') return e.message

      const path = prettyPath(e.instancePath)
      switch (e.keyword) {
        case 'required':
          return `${path}.${e.params.missingProperty} is required`
        case 'additionalProperties':
          return `${path} must NOT have additional properties (${path}.${e.params.additionalProperty})`
        default:
          return `${path} ${e.message}`
      }
    })
    .join('; ')
}

function prettyPath (slashPath) {
  if (slashPath === '') return 'data'

  return [
    'data',
    ...slashPath.split('/')
  ]
    .filter(Boolean)
    .join('.')
}
