const test = require('tape')
const Validator = require('../')

test('schema-based', t => {
  const schema = {
    type: 'object',
    properties: {
      type: { type: 'string', pattern: '^post' },
      date: { type: 'integer' },
      tangles: {
        type: 'object',
        properties: {
          root: { type: 'string' },
          previous: { type: 'array' }
        },
        additionalProperties: false
      }
    },
    required: ['type'],
    additionalProperties: false
  }

  const isValid = Validator(schema)

  t.true(isValid({ type: 'post' }))
  t.equal(isValid.errors, null, 'no isValid.errors when last passed')
  t.equal(isValid.errorsString, '', 'empty isValid.errorsString when last passed')

  /* failures */
  // missing required
  t.false(isValid({ tangles: {} }), 'missing required')
  t.deepEqual(
    isValid.errors,
    [
      { instancePath: '', schemaPath: '#/required', keyword: 'required', params: { missingProperty: 'type' }, message: "must have required property 'type'" }
    ],
    'isValid.errors when last failed'
  )
  t.equal(isValid.errorsString, 'data.type is required', 'isValid.errorsString when last failed')

  // additional properties
  t.false(isValid({ type: 'post', dog: 'pupper', tangles: { dog: true } }), 'additional properties')
  t.deepEqual(
    isValid.errors,
    [
      { instancePath: '', schemaPath: '#/additionalProperties', keyword: 'additionalProperties', params: { additionalProperty: 'dog' }, message: 'must NOT have additional properties' },
      { instancePath: '/tangles', schemaPath: '#/properties/tangles/additionalProperties', keyword: 'additionalProperties', params: { additionalProperty: 'dog' }, message: 'must NOT have additional properties' }
    ],
    'isValid.errors when last failed'
  )
  t.equal(
    isValid.errorsString,
    'data must NOT have additional properties (data.dog); data.tangles must NOT have additional properties (data.tangles.dog)',
    'isValid.errorsString when last failed'
  )

  // malformed field
  t.false(isValid({ type: 'post', tangles: { root: true } }), 'malformed field')
  t.deepEqual(
    isValid.errors,
    [{
      instancePath: '/tangles/root',
      keyword: 'type',
      message: 'must be string',
      params: {
        type: 'string'
      },
      schemaPath: '#/properties/tangles/properties/root/type'
    }],
    'isValid.errors when last failed'
  )
  t.equal(
    isValid.errorsString,
    'data.tangles.root must be string',
    'isValid.errorsString when last failed'
  )

  // error fields get reset un subsequent validations
  isValid({ type: 'post' })
  t.equal(isValid.errors, null, 'no isValid.errors when last passed')
  t.equal(isValid.errorsString, '', 'empty isValid.errorsString when last passed')

  /* can validate value or { msg, key } as well */
  const fullMessage = {
    key: '%10nwqzf93pmuI1FoIWlxpqm0amum2zbJbwvsidL3DyU=.sha256',
    value: {
      author: '@ye+QM09iPcDJD6YvQYjoQc7sLF/IFhmNbEqgdzQo3lQ=.ed25519',
      timestamp: 123123123123,
      content: {
        type: 'post',
        date: Date.now(),
        tangles: {
          root: '%rootId',
          previous: ['%previousId']
        }
      }
    }
  }
  t.true(isValid(fullMessage), 'can validate full messsages')
  t.true(isValid(fullMessage.value), 'can validate full messsage.value')

  const startTime = Date.now()
  const N = 1e6 // million
  for (let i = 0; i < N; i++) {
    isValid(fullMessage)
  }
  const endTime = Date.now()
  t.pass(`validated ${N} messages in ${endTime - startTime}ms`)

  t.end()
})
