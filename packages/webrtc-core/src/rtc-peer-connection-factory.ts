import 'webrtc-adapter';

/**
 * Creates an RTCPeerConnection.
 *
 * @param configuration - Config to the RTCPeerConnection constructor.
 * @returns An RTCPeerConnection instance.
 */
function createRTCPeerConnection(configuration?: RTCConfiguration | undefined): RTCPeerConnection {
  return new RTCPeerConnection(configuration);
}

export { createRTCPeerConnection };
