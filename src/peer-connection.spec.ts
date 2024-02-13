import { BrowserInfo } from '@webex/web-capabilities';
import { MockedObjectDeep } from 'ts-jest';
import { ConnectionState, ConnectionStateHandler } from './connection-state-handler';
import { mocked } from './mocks/mock';
import { RTCPeerConnectionStub } from './mocks/rtc-peer-connection-stub';
import { PeerConnection } from './peer-connection';
import { createRTCPeerConnection } from './rtc-peer-connection-factory';

jest.mock('./mocks/rtc-peer-connection-stub');
jest.mock('./rtc-peer-connection-factory');
jest.mock('./connection-state-handler');

const mockCreateRTCPeerConnection = mocked(createRTCPeerConnection, true);

// eslint-disable-next-line jsdoc/require-jsdoc
function constructCandidatePairStats(id: string, localCandidateId: string, state: string) {
  return {
    id: `${id}`,
    timestamp: 1671091266890.878,
    type: 'candidate-pair',
    transportId: 'T11',
    localCandidateId: `${localCandidateId}`,
    remoteCandidateId: 'I+UUFv24B',
    state: `${state}`,
  };
}

// eslint-disable-next-line jsdoc/require-jsdoc
function constructLocalCandidateStats(
  id: string,
  protocol: string,
  relayProtocol: string | undefined
) {
  return {
    id,
    timestamp: 1671091266890.878,
    type: 'local-candidate',
    transportId: 'T21',
    isRemote: false,
    networkType: 'vpn',
    ip: '2001:420:c0c8:1005::456',
    address: '2001:420:c0c8:1005::456',
    port: 53906,
    protocol,
    candidateType: 'host',
    priority: 2122197247,
    relayProtocol,
  };
}

describe('PeerConnection', () => {
  describe('getCurrentConnectionType', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const mockPc = mocked(new RTCPeerConnectionStub(), true);
    Object.defineProperty(mockPc, 'iceConnectionState', {
      value: 'connected',
      writable: true,
      configurable: true,
    });

    it('normal case', async () => {
      expect.hasAssertions();
      mockCreateRTCPeerConnection.mockReturnValueOnce(mockPc as unknown as RTCPeerConnection);
      mockPc.getStats.mockImplementation(() => {
        return new Promise((resolve) => {
          resolve([
            constructCandidatePairStats('001', 'localCandidateId1', 'succeeded'),
            constructCandidatePairStats('002', 'localCandidateId2', 'succeeded'),
            constructLocalCandidateStats('localCandidateId1', 'udp', undefined),
            constructLocalCandidateStats('localCandidateId1', 'udp', undefined),
          ]);
        });
      });
      const pc = new PeerConnection();
      const connectionType = await pc.getCurrentConnectionType();
      expect(connectionType).toBe('UDP');
    });
    it('first candidate pair state is not succeeded', async () => {
      expect.hasAssertions();
      mockCreateRTCPeerConnection.mockReturnValueOnce(mockPc as unknown as RTCPeerConnection);
      mockPc.getStats.mockImplementation(() => {
        return new Promise((resolve) => {
          resolve([
            constructCandidatePairStats('001', 'localCandidateId1', 'failed'),
            constructCandidatePairStats('002', 'localCandidateId2', 'succeeded'),
            constructLocalCandidateStats('localCandidateId2', 'udp', undefined),
            constructLocalCandidateStats('localCandidateId1', 'udp', undefined),
          ]);
        });
      });
      const pc = new PeerConnection();
      const connectionType = await pc.getCurrentConnectionType();
      expect(connectionType).toBe('UDP');
    });
    it('no candidate matched', async () => {
      expect.hasAssertions();
      mockCreateRTCPeerConnection.mockReturnValueOnce(mockPc as unknown as RTCPeerConnection);
      mockPc.getStats.mockImplementation(() => {
        return new Promise((resolve) => {
          resolve([
            constructCandidatePairStats('001', 'localCandidateId1', 'failed'),
            constructCandidatePairStats('002', 'localCandidateId2', 'succeeded'),
            constructLocalCandidateStats('localCandidateId1', 'udp', undefined),
            constructLocalCandidateStats('localCandidateId1', 'udp', undefined),
          ]);
        });
      });
      const pc = new PeerConnection();
      const connectionType = await pc.getCurrentConnectionType();
      expect(connectionType).toBe('unknown');
    });
    it('no candidate matched caused by all failed', async () => {
      expect.hasAssertions();
      mockCreateRTCPeerConnection.mockReturnValueOnce(mockPc as unknown as RTCPeerConnection);
      mockPc.getStats.mockImplementation(() => {
        return new Promise((resolve) => {
          resolve([
            constructCandidatePairStats('001', 'localCandidateId1', 'failed'),
            constructCandidatePairStats('002', 'localCandidateId2', 'failed'),
            constructLocalCandidateStats('localCandidateId2', 'udp', undefined),
            constructLocalCandidateStats('localCandidateId2', 'udp', undefined),
          ]);
        });
      });
      const pc = new PeerConnection();
      const connectionType = await pc.getCurrentConnectionType();
      expect(connectionType).toBe('unknown');
    });
    it('relay candidate case', async () => {
      expect.hasAssertions();
      mockCreateRTCPeerConnection.mockReturnValueOnce(mockPc as unknown as RTCPeerConnection);
      mockPc.getStats.mockImplementation(() => {
        return new Promise((resolve) => {
          resolve([
            constructCandidatePairStats('001', 'localCandidateId1', 'failed'),
            constructCandidatePairStats('002', 'localCandidateId2', 'succeeded'),
            constructLocalCandidateStats('localCandidateId1', 'udp', 'tls'),
            constructLocalCandidateStats('localCandidateId2', 'udp', 'tls'),
          ]);
        });
      });
      const pc = new PeerConnection();
      const connectionType = await pc.getCurrentConnectionType();
      expect(connectionType).toBe('TURN-TLS');
    });

    it('ice state is not connected/completed', async () => {
      expect.hasAssertions();
      Object.defineProperty(mockPc, 'iceConnectionState', {
        // eslint-disable-next-line jsdoc/require-jsdoc
        get() {
          return 'disconnected';
        },
      });
      mockCreateRTCPeerConnection.mockReturnValueOnce(mockPc as unknown as RTCPeerConnection);
      const pc = new PeerConnection();
      await expect(pc.getCurrentConnectionType()).rejects.toThrow(
        'Ice connection is not established'
      );
    });
  });
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

  describe('createOffer', () => {
    let mockPc: MockedObjectDeep<RTCPeerConnectionStub>;
    let createOfferSpy: jest.SpyInstance;
    const callback = jest.fn();
    let pc: PeerConnection;
    const mockedReturnedOffer: RTCSessionDescriptionInit = {
      sdp: 'blah',
      type: 'offer',
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockPc = mocked(new RTCPeerConnectionStub(), true);
      mockPc.createOffer.mockImplementation(() => {
        return Promise.resolve(mockedReturnedOffer);
      });
      mockCreateRTCPeerConnection.mockReturnValueOnce(mockPc as unknown as RTCPeerConnection);
      pc = new PeerConnection();
      createOfferSpy = jest.spyOn(pc, 'createOffer');
      pc.on(PeerConnection.Events.CreateOfferOnSuccess, callback);
    });

    it('should emit event when createOffer called', async () => {
      expect.hasAssertions();
      const options: RTCOfferOptions = {
        iceRestart: true,
      };
      const offer = await pc.createOffer(options);
      expect(offer).toStrictEqual(mockedReturnedOffer);
      expect(createOfferSpy).toHaveBeenCalledWith(options);
      expect(callback).toHaveBeenCalledWith(mockedReturnedOffer);
    });

    it('should not emit event when createOffer failed', async () => {
      expect.hasAssertions();
      mockPc.createOffer.mockImplementation(() => {
        return Promise.reject(new Error());
      });
      const offerPromise = pc.createOffer(null as unknown as RTCOfferOptions);
      await expect(offerPromise).rejects.toThrow(Error);
      expect(createOfferSpy).toHaveBeenCalledWith(null);
      expect(callback).toHaveBeenCalledTimes(0);
    });
  });

  describe('setLocalDescription', () => {
    let mockPc: MockedObjectDeep<RTCPeerConnectionStub>;
    let setLocalDescriptionSpy: jest.SpyInstance;
    const callback = jest.fn();
    let pc: PeerConnection;

    beforeEach(() => {
      jest.clearAllMocks();
      mockPc = mocked(new RTCPeerConnectionStub(), true);
      mockCreateRTCPeerConnection.mockReturnValueOnce(mockPc as unknown as RTCPeerConnection);
      mockPc.setLocalDescription.mockImplementation(() => {
        return Promise.resolve();
      });
      setLocalDescriptionSpy = jest.spyOn(mockPc, 'setLocalDescription');
      pc = new PeerConnection();
      pc.on(PeerConnection.Events.SetLocalDescriptionOnSuccess, callback);
    });

    it('sets the local description with an SDP offer', async () => {
      expect.hasAssertions();
      const description = { type: 'offer', sdp: 'fake sdp' } as RTCSessionDescriptionInit;
      pc.setLocalDescription(description);
      expect(setLocalDescriptionSpy).toHaveBeenCalledWith(description);
    });
    it('sets the local description with no SDP offer', async () => {
      expect.hasAssertions();
      pc.setLocalDescription();
      expect(setLocalDescriptionSpy).toHaveBeenCalledWith(undefined);
    });
    it('throws an error when the SDP has an invalid media line on Firefox', async () => {
      expect.hasAssertions();
      jest.spyOn(BrowserInfo, 'isFirefox').mockReturnValue(true);
      await expect(
        pc.setLocalDescription({ type: 'offer', sdp: 'm=video 9 UDP/TLS/RTP' })
      ).rejects.toThrow(Error);
    });

    it('should emit event when setLocalDescription called', async () => {
      expect.hasAssertions();
      const options = {
        sdp: 'blah',
      };
      await pc.setLocalDescription(options as unknown as RTCSessionDescriptionInit);
      expect(setLocalDescriptionSpy).toHaveBeenCalledWith(options);
      expect(callback).toHaveBeenCalledWith(options);
    });

    it('should not emit event when setLocalDescription failed', async () => {
      expect.hasAssertions();
      mockPc.setLocalDescription.mockImplementation(() => {
        return Promise.reject(new Error());
      });
      const options = {
        sdp: 'reject',
      };
      const offerPromise = pc.setLocalDescription(options as unknown as RTCSessionDescriptionInit);
      await expect(offerPromise).rejects.toThrow(Error);
      expect(setLocalDescriptionSpy).toHaveBeenCalledWith(options);
      expect(callback).toHaveBeenCalledTimes(0);
    });
  });

  describe('setRemoteDescription', () => {
    let mockPc: MockedObjectDeep<RTCPeerConnectionStub>;
    let setRemoteDescriptionSpy: jest.SpyInstance;
    const callback = jest.fn();
    let pc: PeerConnection;

    beforeEach(() => {
      jest.clearAllMocks();
      mockPc = mocked(new RTCPeerConnectionStub(), true);
      mockPc.setRemoteDescription.mockImplementation(() => {
        return Promise.resolve();
      });
      mockCreateRTCPeerConnection.mockReturnValueOnce(mockPc as unknown as RTCPeerConnection);
      pc = new PeerConnection();
      setRemoteDescriptionSpy = jest.spyOn(pc, 'setRemoteDescription');
      pc.on(PeerConnection.Events.SetRemoteDescriptionOnSuccess, callback);
    });

    it('should emit event when setRemoteDescription called', async () => {
      expect.hasAssertions();
      const options = {
        sdp: 'blah',
      };
      await pc.setRemoteDescription(options as unknown as RTCSessionDescriptionInit);
      expect(setRemoteDescriptionSpy).toHaveBeenCalledWith(options);
      expect(callback).toHaveBeenCalledWith(options);
    });

    it('should not emit event when setRemoteDescription failed', async () => {
      expect.hasAssertions();
      mockPc.setRemoteDescription.mockImplementation(() => {
        return Promise.reject(new Error());
      });
      const options = {
        sdp: 'reject',
      };
      const offerPromise = pc.setRemoteDescription(options as unknown as RTCSessionDescriptionInit);
      await expect(offerPromise).rejects.toThrow(Error);
      expect(setRemoteDescriptionSpy).toHaveBeenCalledWith(options);
      expect(callback).toHaveBeenCalledTimes(0);
    });
  });
});
