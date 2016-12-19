"use strict";

// -----
//  Private
// -----

// _wrapReply()
const _wrapReply = function _wrapReply(request, reply, variableResolve) {
  return function wrappedReply(message) {
    variableResolve(message, request)
      .then((result) => {
        reply(request.channel, result);
      })
      .catch((error) => {
        console.error(error);
      });
  };
}; //- _wrapReply()

// Exports
module.exports = function reply(request, client, variableResolve) {
  const messageType = request.messageType;

  let reply = client[messageType];
  if ( messageType === 'chat' ) reply = client.say;

  const wrappedReply = _wrapReply(request, reply.bind(client), variableResolve);

  wrappedReply.say = _wrapReply(request, client.say.bind(client), variableResolve);
  wrappedReply.whisper = _wrapReply(request, client.whisper.bind(client), variableResolve);

  return wrappedReply;
};