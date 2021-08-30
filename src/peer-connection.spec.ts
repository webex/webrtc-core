import { createRTCPeerConnection } from './rtc-peer-connection-factory';
import { PeerConnection } from './peer-connection';
import { RTCPeerConnectionStub } from './mocks/rtc-peer-connection-stub';
import { mocked } from './mocks/mock';

jest.mock('./mocks/rtc-peer-connection-stub');
jest.mock('./rtc-peer-connection-factory');

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
});
