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

import {
  NoiseReductionEffect,
  VirtualBackgroundEffect,
} from "@webex-connect/web-media-effects";

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
    await createMicrophoneTrack({ deviceId }).then((localMicrophoneTrack) => {
      setLocalMicrophoneTrack(localMicrophoneTrack.getMediaStreamTrack());
    });
  };

  const createCameraTrackAction = async (deviceId) => {
    const effect = new VirtualBackgroundEffect({
      mode: `BLUR`,
      blurStrength: `STRONG`,
      quality: `HIGH`,
    });
    await createCameraTrack({ deviceId }).then((localCameraTrack) => {
      setLocalCameraTrack(localCameraTrack.getMediaStreamTrack());
      window.localCameraTrack = localCameraTrack;

      localCameraTrack.on("underlying-track-change", () => {
        console.log(localCameraTrack.getMediaStreamTrackWithEffects());
        setLocalCameraTrack(
          localCameraTrack.getMediaStreamTrackWithEffects() ||
            localCameraTrack.getMediaStreamTrack()
        );
      });
      localCameraTrack.addEffect("blur", effect);
      effect.enable();
    });
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
        <Col>
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
              init,
            }}
          />
        </Col>
        <Col id={"meetingStreams"}>
          <MediaStreams {...{ localMicrophoneTrack, localCameraTrack }} />
        </Col>
      </Container>
    </>
  );
}

export default App;
