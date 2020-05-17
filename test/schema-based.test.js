const test = require('tape')
const Validator = require('../')

test('schema-based', t => {
  const schema = {
    required: ['type'],
    properties: {
      type: {
        type: 'string',
        pattern: '^post'
      }
    }
  }

  const validator = Validator(schema)

  t.true(validator({ type: 'post' }))
  t.equal(validator.errors, null, 'no validator.errors when last passed')
  t.equal(validator.errorsString, '', 'empty validator.errorsString when last passed')

  t.false(validator({ kind: 'post' }))
  t.deepEqual(
    validator.errors[0],
    { field: 'data.type', message: 'is required', value: { kind: 'post' }, type: undefined, schemaPath: [] },
    'validator.errors when last failed'
  )
  t.equal(validator.errorsString, 'data.type is required', 'validator.errorsString when last failed')

  // checking errors get reset
  validator({ type: 'post' })
  t.equal(validator.errors, null, 'no validator.errors when last passed')
  t.equal(validator.errorsString, '', 'empty validator.errorsString when last passed')

  const fullMessage = {
    key: '%10nwqzf93pmuI1FoIWlxpqm0amum2zbJbwvsidL3DyU=.sha256',
    value: {
      author: '@ye+QM09iPcDJD6YvQYjoQc7sLF/IFhmNbEqgdzQo3lQ=.ed25519',
      timestamp: 123123123123,
      content: { type: 'post' }
    }
  }
  t.true(validator(fullMessage), 'can validate full messsages')
  t.true(validator(fullMessage.value), 'can validate full messsage.value')

  t.end()
})
