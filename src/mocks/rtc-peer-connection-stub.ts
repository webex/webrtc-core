/* eslint-disable */

/**
 * This is a 'stub' implementation which only strives to match the API of the
 * dom's RTCPeerConnection class.  Arguments and returns values must match,
 * but the implementations of the methods can be 'filler', as they are not used.
 * This stub exists to act as a scaffold for creating a mock.
 */
class RTCPeerConnectionStub {
  createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit> {
    return new Promise(() => {});
  }
  createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> {
    return new Promise(() => {});
  }
  getStats(): Promise<any> {
    return new Promise(() => {});
  }
  setLocalDescription(
    description?: RTCSessionDescription | RTCSessionDescriptionInit
  ): Promise<void> {
    return new Promise(() => {});
  }

  setRemoteDescription(
    description?: RTCSessionDescription | RTCSessionDescriptionInit
  ): Promise<void> {
    return new Promise(() => {});
  }
  onconnectionstatechange: () => void = () => {};
  oniceconnectionstatechange: () => void = () => {};
  onicecandidate: (event: RTCPeerConnectionIceEvent) => void = () => {};
}

/**
 * We do this to fill in the type that would normally be in the dom.
 */
Object.defineProperty(window, 'RTCPeerConnection', {
  writable: true,
  value: Function(),
});

export { RTCPeerConnectionStub };
