import { EventEmitter as EE } from 'events';
import TypedEmitter, { EventMap } from 'typed-emitter';

/**
 *  Typed event emitter class.
 */
export class EventEmitter<T extends EventMap> extends (EE as {
  new <TT extends EventMap>(): TypedEmitter<TT>;
})<T> {}

export { EventMap } from 'typed-emitter';
