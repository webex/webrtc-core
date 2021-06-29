// we need something like https://github.com/twilio/twilio-webrtc.js to make sure it suits all the user cases


/**
 * Class to create peerconnection
 */
export interface PeerConnectionConfig {
  /** max bitrate */
  maxBitrate: number;
  /** max frameRate */
  frameRate: number;
  /** frameSize required */
  frameSize: number;
}

// check if can extend some kind of state machine
export default class PeerConnection {
  private sdpRevision: number = 0;
  private iceConnectionState: string = "INIT";
  private iceGatheringState: string = "INIT";

  constructor(peerConnectionConfig: PeerConnectionConfig) {

    /**
     * @property {number} _sdpRevision current SDP version negotiated
     * @name PeerConnection#_sdpRevision
     */

    /**
     * @property {string} _iceConnectionState ice connection state of peerconnection
     * @name PeerConnection#_iceConnectionState
     */

    /**
     * @property {string} _iceGatheringState current SDP version negotiated
     * @name PeerConnection#_iceGatheringState
     */

    /**
     * @property {string} _lastSdpVersion last sdp version
     * @name PeerConnection#_lastSdpVersion
     */

    /**
     * @property {string} _localDescription local description
     * @name PeerConnection#_localDescription
     */

    /**
     * @property {string} _remoteDescription remote description
     * @name PeerConnection#_remoteDescription
     */

    /**
     * @property {string} _rtpSender rtp sender
     * @name PeerConnection#_rtpSender
     */

    /**
     * @property {string} _rtpReceiver rtp receiver
     * @name PeerConnection#_rtpReceiver
     */

    /**
     * @property {string} _iceConnectionMonitor ice connection monitor
     * @name PeerConnection#_iceConnectionMonitor
     */

    /**
     * @property {string} _iceReconnectionTimeout ice reconnection timeout
     * @name PeerConnection#_iceReconnectionTimeout
     */

    /**
     * @property {boolean} _busyNegotiating peerconnection is busy negiotating
     * @name PeerConnection#_busyNegotiating
     */
  }

  /**
   * peer connection state changed
   * @eventProperty  peerConnection:connectionStatusChanged
   * @instance
   * @memberof PeerConnection
   */

  /**
   * ice candidate event
   * @eventProperty  peerConnection:icecandidate
   * @instance
   * @memberof PeerConnection
   */

  /**
   * ice connection state changed
   * @eventProperty  peerConnection:iceConnectionState
   * @instance
   * @memberof PeerConnection
   */

  /**
   * event for track added event
   * @eventProperty  peerConnection:track
   * @instance
   * @memberof PeerConnection
   */

  /**
   * event for success of failur for setting remote SDP
   * @eventProperty  peerConnection:remoteSdpReceived
   * @instance
   * @memberof PeerConnection
   */

  /**
   * event for success of failur for setting local sdp
   * @eventProperty  peerConnection:localSdpGenerated
   * @instance
   * @memberof PeerConnection
   */

  /**
   * event when ice fails mid call
   * @eventProperty  peerConnection:iceFailed ?
   * @instance
   * @memberof PeerConnection
   */

  /**
   * event when ice gathering has started
   * @eventProperty  peerConnection:iceStart ?
   * @instance
   * @memberof PeerConnection
   */

  /**
   * event for ice gathering ended (can indicate TCP/UDP/ able to reach server)
   * @eventProperty  peerConnection:iceEnd ?
   * @instance
   * @memberof PeerConnection
   */

  /**
   * event for invalid ice candidate/
   * @eventProperty peerConnection:iceGatheringFailed
   * @instance
   * @memberof PeerConnection
   */

  /**
   * re negotation
   * @eventProperty  peerConnection:renegotationneeded
   * @instance
   * @memberof PeerConnection
   */

  /**
   * event for any error in peerconenction apis (send SDK metrics )
   * @eventProperty  peerConnection:failure
   * @instance
   * @memberof PeerConnection
   */

  /**
   * PeerConnection Ice State
   * RTCIceConnectionState.
   * @property {RTCIceConnectionState}
   */
  // get iceConnectionState
  // iceConnectionState() {}

  /**
   * replaces the track for a media line
   * @property {MediaStreamTrack} track
   * @property {number} mid
   */

  addTransceiver(track: MediaStreamTrack, mid: number) {}

  /**
   * updated the transcerver with track
   * @param {RTCPeerConnection} peerConnection
   * @param {RTCRtpTransceiver} transceiver
   * @param {MediaStreamTrack} track
   * @returns {Promise}
   */
  updateTransceiver(
    peerConnection: RTCPeerConnection,
    transceiver: RTCRtpTransceiver,
    track: MediaStreamTrack
  ) {}

  /**
   * sets remote description
   * @param {RTCSessionDescription} remoteDescription
   */
  setRemoteDescription(remoteDescription: RTCSessionDescription) {}

  /**
   * create offer with offer SDP
   * @param {RTCSessionDescription} offerSdp
   */
  createOffer(offerSdp: RTCSessionDescription) {}

  /**
   * generate answer for a offer sdp
   * @property {RTCSessionDescription} answerSdp
   */
  createAnswer(answerSdp: RTCSessionDescription) {}

  /**
   * Handle glare condition and rollback peerconnection
   * @fires peerConnection:iceEnd
   * @param {RTCSessionDescription} answerSdp
   */
  _handleGlare() {
    // @listen documents the events the function listens for
  }

  /**
   * close peerconnection
   */
  close() {}

  _recycleTransciver() {}
  /**
   * initiate ice restart
   */

  initiateIceRestart() {}

  /**
   * restart dtls
   * @fires peerConnection:iceEnd
   */
  restartDtls() {}
}
