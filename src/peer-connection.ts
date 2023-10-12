import { BrowserInfo } from '@webex/web-capabilities';
import { ConnectionState, ConnectionStateHandler } from './connection-state-handler';
import { EventEmitter, EventMap } from './event-emitter';
import { createRTCPeerConnection } from './rtc-peer-connection-factory';
import { logger } from './util/logger';
/**
 * A type-safe form of the DOMString used in the MediaStreamTrack.kind field.
 */
enum MediaStreamTrackKind {
  Audio = 'audio',
  Video = 'video',
}

type RTCDataChannelOptions = {
  ordered?: boolean;
  maxPacketLifeTime?: number;
  maxRetransmits?: number;
  protocol?: string;
  negotiated?: boolean;
  id?: number;
};

type IceGatheringStateChangeEvent = {
  target: EventTarget | null;
};

enum PeerConnectionEvents {
  IceGatheringStateChange = 'icegatheringstatechange',
  ConnectionStateChange = 'connectionstatechange',
}

interface PeerConnectionEventHandlers extends EventMap {
  [PeerConnectionEvents.IceGatheringStateChange]: (ev: IceGatheringStateChangeEvent) => void;
  [PeerConnectionEvents.ConnectionStateChange]: (state: ConnectionState) => void;
}

type ConnectionType = 'UDP' | 'TCP' | 'TURN-TLS' | 'TURN-TCP' | 'TURN-UDP' | 'unknown';
/**
 * Manages a single RTCPeerConnection with the server.
 */
class PeerConnection extends EventEmitter<PeerConnectionEventHandlers> {
  static Events = PeerConnectionEvents;

  private pc: RTCPeerConnection;

  private connectionStateHandler: ConnectionStateHandler;

  /**
   * Creates an instance of the RTCPeerConnection.
   *
   * @param configuration - Config to the RTCPeerConnection constructor.
   */
  constructor(configuration?: RTCConfiguration | undefined) {
    super();
    logger.log('PeerConnection init');

    this.pc = createRTCPeerConnection(configuration);

    this.connectionStateHandler = new ConnectionStateHandler(() => {
      return {
        connectionState: this.pc.connectionState,
        iceState: this.pc.iceConnectionState,
      };
    });

    this.connectionStateHandler.on(
      ConnectionStateHandler.Events.ConnectionStateChanged,
      (state: ConnectionState) => {
        this.emit(PeerConnection.Events.ConnectionStateChange, state);
      }
    );

    // Forward the connection state related events to connection state handler
    // eslint-disable-next-line jsdoc/require-jsdoc
    this.pc.oniceconnectionstatechange = () =>
      this.connectionStateHandler.onIceConnectionStateChange();

    // eslint-disable-next-line jsdoc/require-jsdoc
    this.pc.onconnectionstatechange = () => this.connectionStateHandler.onConnectionStateChange();

    // Subscribe to underlying PeerConnection events and emit them via the EventEmitter
    /* eslint-disable jsdoc/require-jsdoc */
    this.pc.onicegatheringstatechange = (ev: Event) => {
      this.emit(PeerConnection.Events.IceGatheringStateChange, ev);
    };
  }

  /**
   * Get the underlying RTCPeerConnection.
   *
   * @returns The underlying RTCPeerConnection.
   */
  getUnderlyingRTCPeerConnection(): RTCPeerConnection {
    return this.pc;
  }

  /**
   * Gets the overall connection state of the underlying RTCPeerConnection.
   *
   * @returns The underlying connection's overall state.
   */
  getConnectionState(): ConnectionState {
    return this.connectionStateHandler.getConnectionState();
  }

  /**
   * Adds a new media track to the set of tracks which will be transmitted to the other peer.
   *
   * @param track - A MediaStreamTrack object representing the media track to add to the peer connection.
   * @param streams - (Optional) One or more local MediaStream objects to which the track should be
   *     added.
   * @returns The RTCRtpSender object which will be used to transmit the media data, or null if
   *     there is no underlying track when a track is added.
   */
  addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender {
    return this.pc.addTrack(track, ...streams);
  }

  /**
   * Creates a new RTCRtpTransceiver and adds it to the set of transceivers associated with the
   * PeerConnection.  Each transceiver represents a bidirectional stream, with both an RTCRtpSender
   * and an RTCRtpReceiver associated with it.
   *
   * @param trackOrKind - A MediaStreamTrack to associate with the transceiver, or a string which is used
   * as the kind of the receiver's track, and by extension the RTCRtpReceiver itself.
   * @param init - Options that you may wish to specify when creating the new transceiver.
   * @returns - The created RTCRtpTransceiver object.
   */
  addTransceiver(
    trackOrKind: MediaStreamTrack | MediaStreamTrackKind,
    init?: RTCRtpTransceiverInit
  ): RTCRtpTransceiver {
    return this.pc.addTransceiver(trackOrKind, init);
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
   * Creates a new data channel linked with the remote peer.
   *
   * @param label - A human-readable name for the channel.  May not be longer than 65,535 bytes.
   * @param options - An object providing configuration options for the data channel.
   * @returns An RTCDataChannel object.
   */
  createDataChannel(label: string, options: RTCDataChannelOptions): RTCDataChannel {
    return this.pc.createDataChannel(label, options);
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
    // In Firefox, setLocalDescription will not throw an error if an m-line has no codecs, even
    // though it violates https://datatracker.ietf.org/doc/html/rfc8866. See
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1857612. So, we check the media lines here to
    // preemptively throw an error on Firefox.
    if (BrowserInfo.isFirefox()) {
      description?.sdp
        ?.split(/(\r\n|\r|\n)/)
        .filter((line) => line.startsWith('m'))
        .forEach((mediaLine) => {
          if (mediaLine.split(' ').length < 4) {
            throw new Error(`Invalid media line ${mediaLine}, expected at least 4 fields`);
          }
        });
    }

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
   * Get the local description from this PeerConnection.
   *
   * @returns An RTCSessionDescription representing the local description, or null if none has been set.
   */
  getLocalDescription(): RTCSessionDescription | null {
    return this.pc.localDescription;
  }

  /**
   * Get the remote description from this PeerConnection.
   *
   * @returns An RTCSessionDescription representing the remote description, or null if none has been set.
   */
  getRemoteDescription(): RTCSessionDescription | null {
    return this.pc.remoteDescription;
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

  /**
   * Get statistics about either the overall connection or about the specified MediaStreamTrack.
   *
   * @param selector - An optional MediaStreamTrack for which to gather statistics. If not provided,
   * statistics will be gathered for the entire underlying RTCPeerConnection.
   * @returns - A Promise which resolves with an RTCStatsReport object providing connection
   * statistics.
   */
  getStats(selector?: MediaStreamTrack): Promise<RTCStatsReport> {
    return this.pc.getStats(selector);
  }

  /**
   * Returns a string that describes the connections' ICE gathering state.
   *
   * @returns - The ICE gathering state.
   */
  get iceGatheringState(): RTCIceGathererState {
    return this.pc.iceGatheringState;
  }

  /**
   * Returns the type of a connection that has been established.
   *
   * @returns The connection type which would be `ConnectionType`.
   */
  async getCurrentConnectionType(): Promise<ConnectionType> {
    // make sure this method only can be called when the ice connection is established;
    const isIceConnected =
      this.pc.iceConnectionState === 'connected' || this.pc.iceConnectionState === 'completed';
    if (!isIceConnected) {
      throw new Error('Ice connection is not established');
    }
    const succeededLocalCandidateIds = new Set();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const localCandidateStatsReports: any[] = [];

    (await this.pc.getStats()).forEach((report) => {
      // collect all local candidate ids from `candidate-pair` stats reports with `succeeded` state.
      if (report.type === 'candidate-pair' && report.state?.toLowerCase() === 'succeeded') {
        succeededLocalCandidateIds.add(report.localCandidateId);
      }
      // collect all `local-candidate` stats.
      if (report.type === 'local-candidate') {
        localCandidateStatsReports.push(report);
      }
    });
    // find the `local-candidate` stats which report id contains in `succeededLocalCandidateIds`.
    const localCandidate = localCandidateStatsReports.find((report) =>
      succeededLocalCandidateIds.has(report.id)
    );
    if (!localCandidate) {
      return 'unknown';
    }
    if (localCandidate.relayProtocol) {
      return `TURN-${localCandidate.relayProtocol.toUpperCase()}` as ConnectionType;
    }
    return localCandidate.protocol?.toUpperCase();
  }
}

export { ConnectionState } from './connection-state-handler';
export { MediaStreamTrackKind, RTCDataChannelOptions, PeerConnection };
