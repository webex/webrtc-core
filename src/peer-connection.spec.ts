import { ConnectionState, ConnectionStateHandler } from './connection-state-handler';
import { mocked } from './mocks/mock';
import { RTCPeerConnectionStub } from './mocks/rtc-peer-connection-stub';
import { PeerConnection } from './peer-connection';
import { createRTCPeerConnection } from './rtc-peer-connection-factory';

jest.mock('./mocks/rtc-peer-connection-stub');
jest.mock('./rtc-peer-connection-factory');
jest.mock('./connection-state-handler');

const mockCreateRTCPeerConnection = mocked(createRTCPeerConnection, true);

describe('PeerConnection', () => {
  it('should pass the correct options through when calling createOffer', async () => {
    expect.hasAssertions();
    const mockPc = mocked(new RTCPeerConnectionStub(), true);
    mockPc.createOffer.mockImplementation(() => {
      return new Promise((resolve) => {
        resolve({
          type: 'offer',
          sdp: 'blah',
        });
      });
    });
    mockCreateRTCPeerConnection.mockReturnValueOnce(mockPc as unknown as RTCPeerConnection);
    const pc = new PeerConnection();
    const createOfferOptions = {
      iceRestart: true,
    };
    await pc.createOffer(createOfferOptions);
    expect(mockPc.createOffer.mock.calls).toHaveLength(1);
    expect(mockPc.createOffer.mock.calls[0][0]).toStrictEqual(createOfferOptions);
  });

  describe('connection state handling', () => {
    let mockPc: RTCPeerConnectionStub;
    let pc: PeerConnection;

    beforeEach(() => {
      mockPc = mocked(new RTCPeerConnectionStub(), true);
      mockCreateRTCPeerConnection.mockReturnValueOnce(mockPc as unknown as RTCPeerConnection);
      pc = new PeerConnection();
    });

    /**
     * Gets the instance of ConnectionStateHandler that was created by the PeerConnection
     * under test.
     *
     * @returns Instance of ConnectionStateHandler.
     */
    const getInstantiatedConnectionStateHandler = () =>
      (ConnectionStateHandler as unknown as jest.Mock).mock.instances[0];

    it('instantiates ConnectionStateHandler', () => {
      expect.hasAssertions();
      expect(ConnectionStateHandler).toHaveBeenCalledTimes(1);
    });
    it("forwards RTCPeerConnection's ice connection event to ConnectionStateHandler", () => {
      expect.hasAssertions();
      const connectionStateHandler = getInstantiatedConnectionStateHandler();

      mockPc.oniceconnectionstatechange();

      expect(connectionStateHandler.onIceConnectionStateChange).toHaveBeenCalledTimes(1);
    });
    it("forwards RTCPeerConnection's connection event to ConnectionStateHandler", () => {
      expect.hasAssertions();
      const connectionStateHandler = getInstantiatedConnectionStateHandler();

      mockPc.onconnectionstatechange();

      expect(connectionStateHandler.onConnectionStateChange).toHaveBeenCalledTimes(1);
    });
    it('returns connection state from connection state handler when geConnectionState() is called', () => {
      expect.assertions(2);
      const connectionStateHandler = getInstantiatedConnectionStateHandler();
      connectionStateHandler.getConnectionState.mockReturnValueOnce(ConnectionState.Connected);

      expect(pc.getConnectionState()).toStrictEqual(ConnectionState.Connected);
      expect(connectionStateHandler.getConnectionState).toHaveBeenCalledTimes(1);
    });
    it("listens on ConnectionStateHandler's ConnectionStateChange event and emits it", () => {
      expect.assertions(2);
      const connectionStateHandler = getInstantiatedConnectionStateHandler();

      pc.on(PeerConnection.Events.ConnectionStateChange, (state) => {
        expect(state).toStrictEqual(ConnectionState.Connecting);
      });

      // verify that PeerConnection listens for the right event
      expect(connectionStateHandler.on.mock.calls[0][0]).toStrictEqual(
        ConnectionStateHandler.Events.ConnectionStateChanged
      );

      // trigger the fake event from ConnectionStateHandler
      const connectionStateHandlerListener = connectionStateHandler.on.mock.calls[0][1];
      connectionStateHandlerListener(ConnectionState.Connecting);
    });
  });
});
