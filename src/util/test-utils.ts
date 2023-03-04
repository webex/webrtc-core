import MediaStreamStub from '../mocks/media-stream-stub';
import MediaStreamTrackStub from '../mocks/media-stream-track-stub';
import { mocked } from '../mocks/mock';

jest.mock('../mocks/media-stream-stub');
jest.mock('../mocks/media-stream-track-stub');

/**
 * Create a mocked stream with a mocked MediaStreamTrack.
 *
 * @returns A Mocked MediaStreamStub type coerced to a MediaStream.
 */
export const createMockedStream = (): MediaStream => {
  // eslint-disable-next-line no-use-before-define
  return createMockedStreamWithSize(640, 480);
};

/**
 * Create a mocked stream with specific width & height.
 *
 * @param width - Expected mocked width of media track.
 * @param height - Expected mocked height of media track.
 * @returns A Mocked MediaStreamStub type coerced to a MediaStream.
 */
export const createMockedStreamWithSize = (width: number, height: number): MediaStream => {
  const mockStream = mocked(new MediaStreamStub());
  const track = mocked(new MediaStreamTrackStub());
  track.getSettings.mockReturnValue({
    height,
    width,
    aspectRatio: width / height,
  });
  track.applyConstraints.mockImplementation((constraints?: MediaTrackConstraints) => {
    track.constraints = constraints || {};
  });
  track.getConstraints.mockImplementation(() => {
    return track.constraints;
  });
  mockStream.getVideoTracks.mockReturnValue([track as unknown as MediaStreamTrack]);
  mockStream.getTracks.mockReturnValue([track as unknown as MediaStreamTrack]);
  return mockStream as unknown as MediaStream;
};
