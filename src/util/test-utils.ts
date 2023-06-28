/* eslint-disable no-use-before-define */
import MediaStreamStub from '../mocks/media-stream-stub';
import MediaStreamTrackStub from '../mocks/media-stream-track-stub';
import { mocked } from '../mocks/mock';

jest.mock('../mocks/media-stream-stub');
jest.mock('../mocks/media-stream-track-stub');

/**
 * Create a mocked stream with a mocked video MediaStreamTrack.
 *
 * @param videoHeight - Video height.
 * @returns A Mocked MediaStreamStub type coerced to a MediaStream.
 */
export const createMockedStream = (videoHeight = 360): MediaStream => {
  const mockStream = mocked(new MediaStreamStub());
  const videoTrack = createMockedVideoTrack((videoHeight * 16) / 9, videoHeight);

  mockStream.getVideoTracks.mockReturnValue([videoTrack]);
  mockStream.getAudioTracks.mockReturnValue([]);
  mockStream.getTracks.mockReturnValue([videoTrack]);

  return mockStream as unknown as MediaStream;
};

/**
 * Create a mocked stream with mocked video and audio MediaStreamTracks.
 *
 * @param videoHeight - Video height.
 * @returns A Mocked MediaStreamStub type coerced to a MediaStream.
 */
export const createMockedStreamWithAudio = (videoHeight = 360): MediaStream => {
  const mockStream = mocked(new MediaStreamStub());
  const videoTrack = createMockedVideoTrack((videoHeight * 16) / 9, videoHeight);
  const audioTrack = createMockedAudioTrack();

  mockStream.getVideoTracks.mockReturnValue([videoTrack]);
  mockStream.getAudioTracks.mockReturnValue([audioTrack]);
  mockStream.getTracks.mockReturnValue([videoTrack, audioTrack]);

  return mockStream as unknown as MediaStream;
};

/**
 * Create a mocked video track with specific width & height.
 *
 * @param width - Expected mocked width of media track.
 * @param height - Expected mocked height of media track.
 * @returns A Mocked MediaStreamTrackStub type coerced to a MediaStreamTrack.
 */
const createMockedVideoTrack = (width: number, height: number): MediaStreamTrack => {
  const track = mocked(new MediaStreamTrackStub());
  track.getSettings.mockReturnValue({
    height,
    width,
    aspectRatio: width / height,
  });
  track.applyConstraints.mockImplementation((constraints?: MediaTrackConstraints) => {
    track.constraints = constraints || {};
    return Promise.resolve();
  });
  track.getConstraints.mockImplementation(() => {
    return track.constraints;
  });
  return track as unknown as MediaStreamTrack;
};

/**
 * Create a mocked audio track.
 *
 * @returns A Mocked MediaStreamTrackStub type coerced to a MediaStreamTrack.
 */
const createMockedAudioTrack = (): MediaStreamTrack => {
  const track = mocked(new MediaStreamTrackStub());
  return track as unknown as MediaStreamTrack;
};
