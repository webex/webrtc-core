/* eslint-disable */

import { mocked } from './mocks/mock';
import { PeerConnection } from './peer-connection';
import { getLocalDescriptionWithIceCandidates } from './peer-connection-utils';

jest.mock('./peer-connection');

const dummyLocalDesc = {
  type: 'offer',
  sdp: 'sdp with candidates',
  toJSON: () => undefined,
} as RTCSessionDescription;

describe('getLocalDescriptionWithIceCandidates', () => {
  const mockPc = mocked(new PeerConnection(), true);
  test('return the correct offer after ice gathering has finished', (done) => {
    mockPc.getLocalDescription.mockReturnValueOnce(dummyLocalDesc);

    const promise = new PromiseHelper(
      getLocalDescriptionWithIceCandidates(mockPc as unknown as PeerConnection)
    );
    expect(mockPc.on.mock.calls).toHaveLength(1);
    expect(mockPc.on.mock.calls[0][0]).toBe(PeerConnection.Events.IceGatheringStateChange);
    // Grab the listener that was installed
    const iceGatheringStateListener = mockPc.on.mock.calls[0][1];
    iceGatheringStateListener({
      target: {
        iceGatheringState: 'gathering',
      },
    });
    // The reason for these nested calls to Promise.resolve is because, unlike many tests around
    // Promises, here we're trying to validate that a promise _wasn't_ resolved when it shouldn't
    // have been.  In order to do that, we make use of PromiseHelper, and also the use of
    // Promise.resolve so that the test validation tasks are queued properly with the resolution of
    // the promise in the code we're testing.
    Promise.resolve().then(() => {
      // Verify the promise hasn't been completed yet
      expect(promise.isFinished()).toBe(false);
      // Now fire another event with the complete state
      iceGatheringStateListener({
        target: {
          iceGatheringState: 'complete',
        },
      });
      // Make sure the helper has had a chance to resolve its promise before we check again
      Promise.resolve().then(() => {
        expect(mockPc.getLocalDescription.mock.calls).toHaveLength(1);
        expect(promise.isFinished()).toBe(true);
        expect(promise.resolvedValue).toBe(dummyLocalDesc);
        done();
      });
    });
  });

  test('rejects if the local description is null', async () => {
    mockPc.getLocalDescription.mockReturnValueOnce(null);
    const promise = getLocalDescriptionWithIceCandidates(mockPc as unknown as PeerConnection);
    const iceGatheringStateListener = mockPc.on.mock.calls[0][1];
    iceGatheringStateListener({
      target: {
        iceGatheringState: 'complete',
      },
    });
    await expect(promise).rejects.toStrictEqual(expect.any(Error));
  });

  test('resolves immediately if the ICE candidates have already been gathered', () => {
    mockPc.getLocalDescription.mockReturnValueOnce(dummyLocalDesc);
    Object.defineProperty(mockPc, 'iceGatheringState', {
      get: () => 'complete',
    });

    return getLocalDescriptionWithIceCandidates(mockPc as unknown as PeerConnection);
  });
});

/**
 * PromiseHelper is a wrapper which enables checking the state of the contained promise.
 */
class PromiseHelper<T> {
  resolvedValue?: T;
  error?: any;

  constructor(promise: Promise<T>) {
    promise
      .then((value: T) => {
        this.resolvedValue = value;
      })
      .catch((e) => {
        this.error = e;
      });
  }

  /**
   * Returns true if the Promise has completed (either successfully or unsuccessfully), false
   * otherwise.
   */
  isFinished(): boolean {
    return this.resolvedValue !== undefined || this.error !== undefined;
  }

  /**
   * Returns true if the Promise has completed successfully, false otherwise
   */
  isResolved(): boolean {
    return this.resolvedValue !== undefined;
  }

  /**
   * Returns true if the Promise has completed unsuccessfully, false otherwise
   */
  isError(): boolean {
    return this.error !== undefined;
  }
}
