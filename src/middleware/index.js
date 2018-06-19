import _parseIntent from './parseIntent'
import _replyMatchLINE from './replyMatchLINE'

import _hello from './hello'

export const parseIntent = _parseIntent
export const replyMatchLINE = _replyMatchLINE
export const hello = _hello

export default {
  parseIntent,
  replyMatchLINE,
  hello,
}
