import { log } from 'util/logger';

/**
 * Manages a single RTCPeerConnection with the server.
 */
class PeerConnection {
  private pc: RTCPeerConnection;

  /**
   * Creates an instance of the RTCPeerConnection.
   */
  constructor() {
    log('PeerConnection init');

    this.pc = new RTCPeerConnection();
  }

  /**
   * Adds a new media track to the set of tracks which will be transmitted to the other peer.
   *
   * @param track - A MediaStreamTrack object representing the media track to add to the peer
   *     connection.
   * @param streams - (Optional) One or more local MediaStream objects to which the track should be
   *     added.
   * @returns The RTCRtpSender object which will be used to transmit the media data.
   */
  addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender {
    return this.pc.addTrack(track, ...streams);
  }

  /**
   * Creates an SDP answer to an offer received from a remote peer during the offer/answer
   * negotiation of a WebRTC connection.
   *
   * @param options - (Optional) An object which contains options which customize the answer; this
   *     is based on the RTCAnswerOptions dictionary.
   * @returns A Promise whose fulfillment handler is called with an object conforming to the
   *     RTCSessionDescriptionInit dictionary which contains the SDP answer to be delivered to the
   *     other peer.
   */
  async createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit> {
    return this.pc.createAnswer(options);
  }

  /**
   * Initiates the creation of an SDP offer for the purpose of starting a new WebRTC connection to a
   * remote peer.
   *
   * @param options - (Optional) An RTCOfferOptions dictionary providing options requested for the
   *    offer.
   * @returns A Promise whose fulfillment handler will receive an object conforming to the
   *    RTCSessionDescriptionInit dictionary which contains the SDP describing the generated offer.
   *    That received offer should be delivered through the signaling server to a remote peer.
   */
  async createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> {
    return this.pc.createOffer(options);
  }

  /**
   * Changes the local description associated with the connection.
   *
   * @param description - An RTCSessionDescriptionInit or RTCSessionDescription which specifies the
   *     configuration to be applied to the local end of the connection.
   * @returns A Promise which is fulfilled once the value of RTCPeerConnection.localDescription is
   *     successfully changed or rejected if the change cannot be applied.
   */
  async setLocalDescription(
    description?: RTCSessionDescription | RTCSessionDescriptionInit
  ): Promise<void> {
    return this.pc.setLocalDescription(description);
  }

  /**
   * Sets the specified session description as the remote peer's current offer or answer.
   *
   * @param description - An RTCSessionDescriptionInit or RTCSessionDescription which specifies the
   *     remote peer's current offer or answer.
   * @returns A Promise which is fulfilled once the value of the connection's remoteDescription is
   *     successfully changed or rejected if the change cannot be applied (for example, if the
   *     specified description is incompatible with one or both of the peers on the connection).
   */
  async setRemoteDescription(
    description: RTCSessionDescription | RTCSessionDescriptionInit
  ): Promise<void> {
    return this.pc.setRemoteDescription(description);
  }

  /**
   * Closes the current peer connection.
   */
  close(): void {
    this.pc.close();
  }
}

export { PeerConnection };
