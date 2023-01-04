import 'webrtc-adapter';

/**
 * Creates an RTCPeerConnection.
 *
 * @returns An RTCPeerConnection instance.
 */
function createRTCPeerConnection(): RTCPeerConnection {
  return new RTCPeerConnection();
}

export { createRTCPeerConnection };
