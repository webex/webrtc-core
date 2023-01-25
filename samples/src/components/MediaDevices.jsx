import { Button, Col, Form } from 'react-bootstrap';
import { useState } from 'react';
export default (props) => {
  const [selectedAudioDevice, setAudioDevice] = useState('default');
  const [selectedCameraDevice, setCameraDevice] = useState('default');
  const [selectedSpeakerDevice, setSpeakerDevice] = useState('');
  return (
    <Form>
      <h2>Media Devices</h2>
      <Button id='btn-get-devices' size='sm' onClick={props.init}>
        gather devices(audio, video, playback)
      </Button>
      <Form.Group>
        <Col>
          <label>Audio</label>
        </Col>
        <Col>
          <Form.Select
            onChange={(choice) => setAudioDevice(choice.target.value)}
          >
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
          <Button
            onClick={() => {
              props.createMicrophoneTrackAction(selectedAudioDevice);
            }}
          >
            createMicrophoneTrack
          </Button>
        </Col>
        <Col>
          <Button
            onClick={() => {
              props.stopAudioTrack();
            }}
          >
            Stop
          </Button>
        </Col>
        <Col>
          <Button>AEC</Button>
          <Button>AGC</Button>
          <Button>ANS</Button>
        </Col>
        <Col>
          <Button
            onClick={() => {
              props.stopAudioTrack();
            }}
          >
            Load Bnr
          </Button>
        </Col>
        <Col>
          <Button
            onClick={() => {
              props.stopAudioTrack();
            }}
          >
            enableBnr
          </Button>
        </Col>
        <Col>
          <Button
            onClick={() => {
              props.stopAudioTrack();
            }}
          >
            disableBnr
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
            }}
          >
            createCameraTrack
          </Button>
        </Col>
        <Col>
          <Button>Blur</Button>
          <Button>virtualBackground</Button>
        </Col>
      </Form.Group>
      <Form.Group>
        <Col>
          <label>Audio Output Device</label>
        </Col>
        <Col>
          <Form.Select
            onChange={(choice) => setSpeakerDevice(choice.target.value)}
          >
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
      <Col>
        <Button onClick={props.createDisplayTrackAction}>
          createDisplayTrack
        </Button>
      </Col>
    </Form>
  );
};
