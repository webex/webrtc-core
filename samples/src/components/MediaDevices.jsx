import {Button, Col, Form} from "react-bootstrap";

const createMicrophoneTrack = () => {}
const applyQuality = () => {}
const setPlayback = () => {}
const createCameraTrack = () => {}
const applyResolution = () => {}
const createDisplayTrack = () => {}
export default () => {
  return (
    <Form>
      <h2>Media Devices</h2>
      <Form.Group>
        <Col>
          <label>Audio Input Device</label>
        </Col>
        <Col>
          <Form.Select></Form.Select>
        </Col>
        <Col>
          <Button onClick={createMicrophoneTrack}>createMicrophoneTrack</Button>
        </Col>
      </Form.Group>
      <Col>
        <Form.Check
          id="echoCancellation-checkbox"
          type="checkbox"
          label="echoCancellation"
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
          <Button onClick={applyQuality}>applyQuality</Button>
        </Col>
      </Form.Group>
      <Form.Group>
        <Col>
          <label>Audio Output Device</label>
        </Col>
        <Col>
          <Form.Select></Form.Select>
        </Col>
        <Col>
          <Button onClick={setPlayback}>setPlayback</Button>
        </Col>
      </Form.Group>
      <Form.Group>
        <Col>
          <label>Video Input Device</label>
        </Col>
        <Col>
          <Form.Select></Form.Select>
        </Col>
        <Col>
          <Button onClick={createCameraTrack}>createCameraTrack</Button>
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
          <Button onClick={applyResolution}>applyResolution</Button>
        </Col>
      </Form.Group>
      <Col>
        <Button onClick={createDisplayTrack}>createDisplayTrack</Button>
      </Col>
    </Form>
  )
}
