/* eslint-disable jest/prefer-expect-assertions */
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from 'chai';
import { enumerateDevices, getDisplayMedia, getUserMedia } from './media';

describe('Media integration test', () => {
  describe('getUserMedia video', () => {
    it('should return a video stream', async () => {
      const cameraStream: MediaStream = await getUserMedia({ video: true });
      expect(cameraStream.getTracks()[0].kind).equal('video');
    });
  });

  describe('getUserMedia audio', () => {
    it('should return an audio stream', async () => {
      const audioStream: MediaStream = await getUserMedia({ audio: true });
      expect(audioStream.getTracks()[0].kind).equal('audio');
    });
  });

  describe('getDisplayMedia', () => {
    it('should return a display stream', async () => {
      const btn = document.createElement('button');
      btn.addEventListener('click', async () => {
        const displayStream: MediaStream = await getDisplayMedia({ video: true });
        expect(displayStream.getTracks()[0].kind).equal('video');
      });
      btn.click();
    });
  });

  describe('enumerateDevices', () => {
    it('should return all devices', async () => {
      const devices: MediaDeviceInfo[] = await enumerateDevices();
      expect(devices.length).greaterThan(0);
    });
  });
});
