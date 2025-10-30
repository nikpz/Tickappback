import registerHandlers from "./handlers";

export default function registerSocketEvents(socket) {
  registerHandlers(socket);
}

/*
What happens after that:
When the client emits an event with a specific event name, say 'columns:create':
The socket object checks if it has any listener registered for 'columns:create'.
If yes, it calls the corresponding callback(s).
If no listener exists for that event, nothing happens.
So the event name matching is done by the socket.io internally, not your registerHandlers function.

Analogy:
registerHandlers(socket) is like setting up a bunch of phone numbers on a phone (attaching listeners).
Later, when a call (event) comes in with a specific number (event name), the phone automatically routes the call to the right handler (listener).
You don’t have to look through all numbers each time; the phone system does that internally.

TL;DR:
registerHandlers(socket) sets up the listeners for all event names in advance.
When an event is emitted, the socket object knows exactly which listener(s) to call for that event.
No need to "check every handler" for matching event names at event time — the registration already took care of that.

*/