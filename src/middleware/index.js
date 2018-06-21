import _parseIntent from './parseIntent'
import _replyMatchLINE from './replyMatchLINE'
import _replyGroupResultLINE from './replyGroupResultLINE'

import _hello from './hello'

export const parseIntent = _parseIntent
export const replyMatchLINE = _replyMatchLINE
export const replyGroupResultLINE = _replyGroupResultLINE
export const hello = _hello

export default {
  parseIntent,
  replyMatchLINE,
  replyGroupResultLINE,
  hello,
}
