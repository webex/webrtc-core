import { useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';

export default (props) => {
  const [selectedAudioDevice, setAudioDevice] = useState('default');
  const [selectedCameraDevice, setCameraDevice] = useState('default');
  const [selectedSpeakerDevice, setSpeakerDevice] = useState('');
  const [bnrStatus, setBnrStatus] = useState({ loaded: false, enabled: false });
  const [videoEffectsStatus, setVideoEffectStatus] = useState({
    blur: false,
    video: false,
    background: false,
  });
  const [audioStatus, setAudioStatus] = useState({
    muted: false,
    stopped: false,
    AEC: false,
    AGC: false,
    ANS: false,
  });

  const [videoStatus, setVideoStatus] = useState({
    muted: false,
    stopped: false,
    resolution: '1080p',
  });

  const [shareStatus, setShareStatus] = useState({
    muted: false,
    stopped: false,
    sourceType: 'screen',
    withAudio: false,
  });

  return (
    <Form>
      <h2>Media Devices</h2>
      <Button id="btn-get-devices" size="sm" onClick={props.init}>
        gather devices(audio, video, playback)
      </Button>
      <Form.Group className="d-flex">
        <h4>Audio</h4>
      </Form.Group>
      <Form.Group className="d-flex">
        <Form.Select
          onChange={(choice) => setAudioDevice(choice.target.value)}
          style={{ width: '250px' }}>
          {props.audioDevice?.map((device) => {
            return (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            );
          })}
        </Form.Select>
        <Button
          onClick={() => {
            props.createMicrophoneTrackAction(selectedAudioDevice);
          }}>
          createMicrophoneTrack
        </Button>
      </Form.Group>
      <Form.Group className="d-flex">
        <Button>AEC</Button>
        <Button>AGC</Button>
        <Button>ANS</Button>
        <Button
          variant={audioStatus.muted ? 'danger' : 'primary'}
          onClick={() => {
            setAudioStatus({ ...audioStatus, muted: !audioStatus.muted });
            props.muteAudioTrack(audioStatus.muted);
          }}>
          {audioStatus.muted ? 'unMute' : 'Mute'}
        </Button>
        <Button
          onClick={() => {
            props.stopAudioTrack();
          }}>
          Stop
        </Button>
        <Button
          onClick={() => {
            props.enableBnr();
          }}>
          enableBnr
        </Button>
      </Form.Group>
      <Form.Group className="d-flex">
        <h4>Video</h4>
      </Form.Group>
      <Form.Group className="d-flex">
        <Form.Select
          onChange={(choice) => setCameraDevice(choice.value)}
          style={{ width: '250px' }}>
          {props.cameraDevice?.map((device) => {
            return (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            );
          })}
        </Form.Select>
        <Form.Select
          onChange={(choice) => setCameraDevice(choice.value)}
          style={{ width: '100px' }}>
          <option>1080p</option>
          <option>720p</option>
          <option>480p</option>
          <option>360p</option>
        </Form.Select>
        <Button
          onClick={() => {
            props.createCameraTrackAction(selectedCameraDevice);
          }}>
          createCameraTrack
        </Button>
      </Form.Group>
      <Form.Group className="d-flex">
        <Button
          onClick={() => {
            props.stopVideoTrack();
          }}>
          stop
        </Button>
        <Button
          variant={videoEffectsStatus.bnrStatus ? 'danger' : 'primary'}
          onClick={() => {
            props.enableBlurBackground(!videoEffectsStatus.bnrStatus);
            setVideoEffectStatus({
              ...videoEffectsStatus,
              bnrStatus: !videoEffectsStatus.bnrStatus,
            });
          }}>
          {videoEffectsStatus.bnrStatus ? 'enableBlur' : 'disableBlur'}
        </Button>
        <Button>virtualBackground</Button>
      </Form.Group>
      <Form.Group className="d-flex">
        <h4>Display</h4>
      </Form.Group>
      <Form.Group className="d-flex">
        <Button
          onClick={() => {
            props.createDisplayTrackAction({
              withAudio: shareStatus.withAudio,
            });
          }}>
          createDisplayTrack
        </Button>
        <Button
          onClick={() => {
            props.stopDisplayTrack();
          }}>
          stop
        </Button>
      </Form.Group>
      <Form.Group className="d-flex">
        <p>
          withAudio <input type="checkbox" checked={true} onChange={() => {}} />
        </p>
      </Form.Group>
      <Form.Group className="d-flex">
        <h4>Output</h4>
      </Form.Group>
      <Form.Group className="d-flex">
        <h5>Audio Output Device</h5>
      </Form.Group>
      <Form.Group className="d-flex">
        <Form.Select
          onChange={(choice) => setSpeakerDevice(choice.target.value)}
          style={{ width: '150px' }}>
          {props.speakerDevice?.map((device) => {
            return (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            );
          })}
        </Form.Select>
        <Button onClick={props.setPlayback}>setPlayback</Button>
      </Form.Group>
    </Form>
  );
};
