/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventEmitter as EE } from 'events';
import TypedEmitter, { EventMap } from 'typed-emitter';

/**
 *  Typed event emitter class.
 */
export class EventEmitter<T extends EventMap> extends (EE as {
  new <TT extends EventMap>(): TypedEmitter<TT>;
})<T> {}

export { EventMap } from 'typed-emitter';

type Handler = (...args: any[]) => void;

/**
 * A typed event class that can be used for subscription and emission of events.
 */
export class TypedEventImpl<T extends Handler> {
  private emitter = new EventEmitter<{
    ['event']: T;
  }>();

  /**
   * Add an event handler to be invoked when this event is emitted.
   *
   * @param handler - The handler to be invoked.
   */
  on(handler: T): void {
    this.emitter.on('event', handler);
  }

  /**
   * Add an event handler to be invoked the next time this event is emitted.
   * This handler will be invoked at most once.
   *
   * @param handler - The handler to be invoked.
   */
  once(handler: T): void {
    this.emitter.once('event', handler);
  }

  /**
   * Remove the given handler.
   *
   * @param handler - The handler to remove.
   */
  off(handler: T): void {
    this.emitter.off('event', handler);
  }

  /**
   * Emit the event with the given arguments.
   *
   * @param args - The arguments to the event.
   */
  emit(...args: Parameters<T>): void {
    this.emitter.emit('event', ...args);
  }
}

/**
 * A type which defines all methods of EventImpl that should be 'externally' accessible.
 * Instances of EventImpl should be exposed as this type to external entities for.
 */
export type TypedEvent<T extends Handler> = Pick<TypedEventImpl<T>, 'on' | 'once' | 'off'>;
