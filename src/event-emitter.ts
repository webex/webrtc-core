import { EventEmitter as EE } from 'events';
import TypedEmitter, { EventMap } from 'typed-emitter';

/**
 *  Typed event emitter class.
 */
export default class EventEmitter<T extends EventMap> extends (EE as {
  new <TT extends EventMap>(): TypedEmitter<TT>;
})<T> {}
