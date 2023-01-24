import { Button, Col, Form } from 'react-bootstrap';
import { useState } from 'react';
export default (props) => {
  const [selectedAudioDevice, setAudioDevice] = useState('default');
  const [selectedCameraDevice, setCameraDevice] = useState('default');
  const [selectedSpeakerDevice, setSpeakerDevice] = useState('');
  return (
    <Form>
      <h2>Media Devices</h2>
      <Form.Group>
        <Col>
          <label>Audio Input Device</label>
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
      </Form.Group>
      <Col>
        <Form.Check
          id='echoCancellation-checkbox'
          type='checkbox'
          label='echoCancellation'
        />
      </Col>
      <Form.Group>
        <Col>
          <label>Audio Quality</label>
        </Col>
        <Col>
          <Form.Select></Form.Select>
        </Col>
        <Col>
          <Button onClick={props.applyQuality}>applyQuality</Button>
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
      <Form.Group>
        <Col>
          <label>Video Input Device</label>
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
          <Button
            onClick={() => {
              props.createCameraTrackAction(selectedCameraDevice);
            }}
          >
            createCameraTrack
          </Button>
        </Col>
      </Form.Group>
      <Form.Group>
        <Col>
          <label>Resolution</label>
        </Col>
        <Col>
          <Form.Select></Form.Select>
        </Col>
        <Col>
          <Button onClick={props.applyResolution}>applyResolution</Button>
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
