import { createRequestHandler } from 'bottender-lambda'
import updateMatchesCommand from './commands/updateMatches'
import updateGroupResultsCommand from './commands/updateGroupResults'

import bots from './bots'

export const line = (_event, _context, callback) => {
  console.log('apiw event:', JSON.stringify(_event))
  console.log('apiw context:', JSON.stringify(_context))
  const handler = createRequestHandler(bots.line)
  const event = {
    httpMethod: _event.method,
    body: _event.body,
  }
  console.log('event:', JSON.stringify(event))
  handler(event, _context, callback)
}

export const updateMatches = async (_event, _context, callback) => {
  await updateMatchesCommand()
  await updateGroupResultsCommand()
  callback(null, {
    statusCode: 200,
    body: 'OK',
  })
}

export const updateGroupResults = async (_event, _context, callback) => {
  await updateGroupResultsCommand()
  callback(null, {
    statusCode: 200,
    body: 'OK',
  })
}

export default {
  line,
  updateMatches,
  updateGroupResults,
}
