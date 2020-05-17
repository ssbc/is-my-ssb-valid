const test = require('tape')
const Validator = require('../')

test('schema-based', t => {
  const schema = {
    required: ['type'],
    properties: {
      type: {
        type: 'string',
        pattern: '^post'
      },
      date: {
        type: 'integer'
      }
    }
  }

  const isValid = Validator(schema)

  t.true(isValid({ type: 'post' }))
  t.equal(isValid.errors, null, 'no isValid.errors when last passed')
  t.equal(isValid.errorsString, '', 'empty isValid.errorsString when last passed')

  t.false(isValid({ kind: 'post' }))
  t.deepEqual(
    isValid.errors[0],
    { field: 'data.type', message: 'is required', value: { kind: 'post' }, type: undefined, schemaPath: [] },
    'isValid.errors when last failed'
  )
  t.equal(isValid.errorsString, 'data.type is required', 'isValid.errorsString when last failed')

  // error fields get reset un subsequent validations
  isValid({ type: 'post' })
  t.equal(isValid.errors, null, 'no isValid.errors when last passed')
  t.equal(isValid.errorsString, '', 'empty isValid.errorsString when last passed')

  // can validate value or { msg, key } as well
  const fullMessage = {
    key: '%10nwqzf93pmuI1FoIWlxpqm0amum2zbJbwvsidL3DyU=.sha256',
    value: {
      author: '@ye+QM09iPcDJD6YvQYjoQc7sLF/IFhmNbEqgdzQo3lQ=.ed25519',
      timestamp: 123123123123,
      content: { type: 'post' }
    }
  }
  t.true(isValid(fullMessage), 'can validate full messsages')
  t.true(isValid(fullMessage.value), 'can validate full messsage.value')

  t.end()
})
