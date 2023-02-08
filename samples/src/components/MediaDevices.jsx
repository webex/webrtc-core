import { useState } from 'react';
import { Button, Col, Form } from 'react-bootstrap';

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
      <Form.Group>
        <Col>
          <label>Audio</label>
        </Col>
        <Col>
          <Form.Select onChange={(choice) => setAudioDevice(choice.target.value)}>
            {props.audioDevice?.map((device) => {
              return (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              );
            })}
          </Form.Select>
        </Col>
        <Col>
          <Button>AEC</Button>
          <Button>AGC</Button>
          <Button>ANS</Button>
        </Col>
        <Col>
          <Button
            onClick={() => {
              props.createMicrophoneTrackAction(selectedAudioDevice);
            }}>
            createMicrophoneTrack
          </Button>
        </Col>
        <Col>
          <Button
            variant={audioStatus.muted ? 'danger' : 'primary'}
            onClick={() => {
              setAudioStatus({ ...audioStatus, muted: !audioStatus.muted });
              props.muteAudioTrack(audioStatus.muted);
            }}>
            {audioStatus.muted ? 'unMute' : 'Mute'}
          </Button>
        </Col>
        <Col>
          <Button
            onClick={() => {
              props.stopAudioTrack();
            }}>
            Stop
          </Button>
        </Col>
        <Col>
          <Button
            onClick={() => {
              props.enableBnr();
            }}>
            enableBnr
          </Button>
        </Col>
      </Form.Group>
      <Form.Group>
        <Col>
          <label>Video </label>
        </Col>
        <Col>
          <Form.Select onChange={(choice) => setCameraDevice(choice.value)}>
            {props.cameraDevice?.map((device) => {
              return (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              );
            })}
          </Form.Select>
        </Col>
        <Col>
          <Form.Select onChange={(choice) => setCameraDevice(choice.value)}>
            <option>1080p</option>
            <option>720p</option>
            <option>480p</option>
            <option>360p</option>
          </Form.Select>
        </Col>
        <Col>
          <Button
            onClick={() => {
              props.createCameraTrackAction(selectedCameraDevice);
            }}>
            createCameraTrack
          </Button>

          <Button
            onClick={() => {
              props.stopVideoTrack();
            }}>
            stop
          </Button>
        </Col>
        <Col>
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
        </Col>
      </Form.Group>
      <Form.Group>
        <Col>Display</Col>
        <Col>
          <p>
            withAudio <input type="checkbox" checked={true} onChange={() => {}} />
          </p>
        </Col>
        <Col>
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
        </Col>
      </Form.Group>
      <Form.Group>
        <Col>
          <label>Audio Output Device</label>
        </Col>
        <Col>
          <Form.Select onChange={(choice) => setSpeakerDevice(choice.target.value)}>
            {props.speakerDevice?.map((device) => {
              return (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              );
            })}
          </Form.Select>
        </Col>
        <Col>
          <Button onClick={props.setPlayback}>setPlayback</Button>
        </Col>
      </Form.Group>
    </Form>
  );
};
