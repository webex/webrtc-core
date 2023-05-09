import { Stream } from './stream';

/**
 * A stream originating from a remote peer.
 */
export class RemoteStream extends Stream {
  /**
   * Get whether or not this stream is currently muted.
   *
   * @returns True if this stream is muted, false otherwise.
   */
  get muted(): boolean {
    return !this.outputStream.getTracks()[0].enabled;
  }
}
