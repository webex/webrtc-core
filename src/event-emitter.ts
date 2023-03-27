import { EventEmitter as EE } from 'events';
import TypedEmitter, { EventMap } from 'typed-emitter';

/**
 *  Typed event emitter class.
 */
export class EventEmitter<T extends EventMap> extends (EE as {
  new <TT extends EventMap>(): TypedEmitter<TT>;
})<T> {
  /**
   *
   */
  emit<E extends keyof T>(event: E, ...args: Parameters<T[E]>): boolean {
    return super.emit(event, ...args);
  }
}

export { EventMap } from 'typed-emitter';
