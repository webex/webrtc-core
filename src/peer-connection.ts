import { EventEmitter } from './event-emitter';
import { LocalTrack } from './local-track';
import { log } from './util/logger';
import { createRTCPeerConnection } from './rtc-peer-connection-factory';

/**
 * A type-safe form of the DOMString used in the MediaStreamTrack.kind field.
 */
enum MediaStreamTrackKind {
  Audio = 'audio',
  Video = 'video',
}

/**
 * Manages a single RTCPeerConnection with the server.
 */
class PeerConnection extends EventEmitter {
  static Events = {
    IceGatheringStateChange: 'icegatheringstatechange',
  };

  private pc: RTCPeerConnection;

  /**
   * Creates an instance of the RTCPeerConnection.
   */
  constructor() {
    super();
    log('PeerConnection init');

    this.pc = createRTCPeerConnection();

    // Bind event handlers.
    this.handleTrackUpdate = this.handleTrackUpdate.bind(this);

    // Subscribe to underlying PeerConnection events and emit them via the EventEmitter
    /* eslint-disable jsdoc/require-jsdoc */
    this.pc.onicegatheringstatechange = (ev: Event) => {
      this.emit(PeerConnection.Events.IceGatheringStateChange, ev);
    };
  }

  /**
   * Adds a new media track to the set of tracks which will be transmitted to the other peer.
   *
   * @param track - A LocalTrack object representing the media track to add to the peer connection.
   * @param streams - (Optional) One or more local MediaStream objects to which the track should be
   *     added.
   * @returns The RTCRtpSender object which will be used to transmit the media data, or null if
   *     there is no underlying track when a track is added.
   * @listens LocalTrack.Events.TrackUpdate
   */
  addTrack(track: LocalTrack, ...streams: MediaStream[]): RTCRtpSender | null {
    const underlyingTrack = track.getUnderlyingTrack();
    if (underlyingTrack) {
      track.on(LocalTrack.Events.TrackUpdate, this.handleTrackUpdate);
      return this.pc.addTrack(underlyingTrack, ...streams);
    }

    return null;
  }

  /**
   * Creates a new RTCRtpTransceiver and adds it to the set of transceivers associated with the
   * PeerConnection.  Each transceiver represents a bidirectional stream, with both an RTCRtpSender
   * and an RTCRtpReceiver associated with it.
   *
   * @param trackOrKind - A LocalTrack to associate with the transceiver, or a string which is used
   * as the kind of the receiver's track, and by extension the RTCRtpReceiver itself.
   * @param init - Options that you may wish to specify when creating the new transceiver.
   * @returns - The created RTCRtpTransceiver object.
   */
  addTransceiver(
    trackOrKind: LocalTrack | MediaStreamTrackKind,
    init?: RTCRtpTransceiverInit
  ): RTCRtpTransceiver {
    const rtcTrackOrKind =
      trackOrKind instanceof LocalTrack ? trackOrKind.getUnderlyingTrack() : trackOrKind;
    return this.pc.addTransceiver(rtcTrackOrKind, init);
  }

  /**
   * Tell the local end of the connection to stop sending media from the specified track, without
   * actually removing the corresponding RTCRtpSender from the list of senders as reported by
   * RTCPeerConnection.getSenders().  If the track is already stopped, or is not in the connection's
   * senders list, the method has no effect.
   *
   * If the connection has already been negotiated (signalingState is set to 'stable'), it is marked
   * as needing to be negotiated again; the remote peer won't experience the change until this
   * negotiation occurs.  A negotiatedneeded event is sent to the RTCPeerConnection to let the local
   * end know this negotiation must occur.
   *
   * @param sender - An RTCRtpSender specifying the sender to remove from the connection.
   */
  removeTrack(sender: RTCRtpSender): void {
    this.pc.removeTrack(sender);
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

  /**
   * Handles `track-update` event and replaces track on sender.
   *
   * @param oldTrackId - Id of the existing track.
   * @param newTrack - New LocalTrack.
   */
  handleTrackUpdate(oldTrackId: string, newTrack: MediaStreamTrack): void {
    const sender = this.pc.getSenders().find((s: RTCRtpSender) => s.track?.id === oldTrackId);
    sender?.replaceTrack(newTrack);
  }

  /**
   * Get the local description from this PeerConnection.
   *
   * @returns An RTCSessionDescription representing the local description, or null if none has been set.
   */
  getLocalDescription(): RTCSessionDescription | null {
    return this.pc.localDescription;
  }

  /**
   * Returns an array of RTCRtpSender objects, each of which represents the RTP sender responsible
   * for transmitting one track's data.  A sender object provides methods and properties for
   * examining and controlling the encoding and transmission of the track's data.
   *
   * @returns An array of RTCRtpSender objects, one for each track on the connection.  The array is
   * empty if there are no RTP senders on the connection.
   */
  getSenders(): RTCRtpSender[] {
    return this.pc.getSenders();
  }

  /**
   * Get the list of RTCRtpTransceiver objects being used to send and receive data on the
   * connection.
   *
   * @returns - An array of the RTCRtpTransceiver objects representing the transceivers handling
   * sending and receiving all media on the PeerConnection.  The list is in the order in which the
   * transceivers were added to the connection.
   */
  getTransceivers(): RTCRtpTransceiver[] {
    return this.pc.getTransceivers();
  }
}

export { MediaStreamTrackKind, PeerConnection };
