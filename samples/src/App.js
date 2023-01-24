import "bootswatch/dist/pulse/bootstrap.min.css";
import "./App.css";
import { useState } from "react";
import { Col, Container, Navbar, Row } from "react-bootstrap";
import Initialization from "./components/Initialization";
import MediaDevices from "./components/MediaDevices";
import Background from "./components/Background";
import MediaStreams from "./components/MediaStreams";
import {
  createMicrophoneTrack,
  createCameraTrack,
  getSpeakers,
  getMicrophones,
  getCameras,
} from "@webex/webrtc-core";

const createDisplayTrackAction = () => {};
const applyQuality = () => {};
const setPlayback = () => {};

const applyResolution = () => {};

function App() {
  const [audioDevice, setAudioDevice] = useState([]);
  const [cameraDevice, setCameraDevice] = useState([]);
  const [speakerDevice, setSpeakerDevice] = useState([]);

  const [localCameraTrack, setLocalCameraTrack] = useState();
  const [localMicrophoneTrack, setLocalMicrophoneTrack] = useState();

  const createMicrophoneTrackAction = async (deviceId) => {
    await createMicrophoneTrack({ deviceId }).then(setLocalMicrophoneTrack);
  };

  const createCameraTrackAction = async (deviceId) => {
    await createCameraTrack({ deviceId }).then(setLocalCameraTrack);
  };

  const init = async () => {
    // on load get the supported devices and

    await getMicrophones().then((audioDevice) => {
      setAudioDevice(audioDevice);
    });

    await getCameras().then((cameraDevice) => {
      setCameraDevice(cameraDevice);
    });

    await getSpeakers().then((speakerDevice) => {
      setSpeakerDevice(speakerDevice);
    });
  };

  return (
    <>
      <Navbar bg="light">
        <Container>
          <h1>Webrtc Core Samples</h1>
        </Container>
      </Navbar>
      <Container>
        <Row>
          <Col>
            <Row>
              <Initialization {...{ init }} />
            </Row>
            <Row>
              <MediaDevices
                {...{
                  createMicrophoneTrackAction,
                  applyQuality,
                  createCameraTrackAction,
                  createDisplayTrackAction,
                  applyResolution,
                  setPlayback,
                  audioDevice,
                  cameraDevice,
                  speakerDevice,
                }}
              />
            </Row>
            <Row>
              <Background />
            </Row>
          </Col>
          <Col id={"meetingStreams"}>
            <MediaStreams {...{ localMicrophoneTrack, localCameraTrack }} />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default App;
