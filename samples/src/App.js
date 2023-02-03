import "bootswatch/dist/pulse/bootstrap.min.css";
import { useState } from "react";
import { Col, Container, Navbar } from "react-bootstrap";
import "./App.css";
import {
  createCameraTrack,
  createDisplayTrack,
  createMicrophoneTrack,
  getCameras,
  getMicrophones,
  getSpeakers
} from "./bundle.js";
import EventList from './components/EventList';
import MediaDevices from "./components/MediaDevices";
import MediaStreams from "./components/MediaStreams";

import {
  VirtualBackgroundEffect
} from "@webex-connect/web-media-effects";

const applyQuality = () => {};
const setPlayback = () => {};

const applyResolution = () => {};

function App() {
  const [audioDevice, setAudioDevice] = useState([]);
  const [cameraDevice, setCameraDevice] = useState([]);
  const [speakerDevice, setSpeakerDevice] = useState([]);

  const [localCameraTrack, setLocalCameraTrack] = useState();
  const [localMicrophoneTrack, setLocalMicrophoneTrack] = useState();
  const [localDisplayTracks, setLocalDisplayTracks] = useState();

  const [bnrEffect, setBnrEffect] = useState();
  const [blurEffect, setBlurEffect] = useState();
  const [vbgEffect, setVirtualBackgroundEffect] = useState();
  const [videoEffect, setVideoEffect] = useState();

  const [trackEvents, setTrackEvents] = useState([]);

  const updateEvents = (event) => {
    setTrackEvents(trackEvents => [...trackEvents,{message: event}]);
  }

  const enableBnr = (enabled) =>{
    const options = {
      audioContext,
      processorUrl,
      legacyProcessorUrl,
      mode,
    };
    effect = new NoiseReductionEffect(options);

  }

  const enableVirtualBackground = (enabled) => {

    if(!videoEffect) {
      effect = new VirtualBackgroundEffect({
        mode: "IMAGE",
        bgVideoUrl: VIDEO_URL,
      });

      localCameraTrack.addEffect("virtualBackground", effect)
    }

  }

  const enableVideoBackground = (enabled) => {
    effect = new VirtualBackgroundEffect({
      mode: "VIDEO",
      bgVideoUrl: VIDEO_URL,
    });
  }

  const enableBlurBackground = async (enabled) => {
    let effect = null;
    if(!blurEffect) {
      effect = new VirtualBackgroundEffect({
        mode: `BLUR`,
        blurStrength: `STRONG`,
        quality: `HIGH`,
      });
      await localCameraTrack.addEffect("blur", effect);
      setBlurEffect(effect)
    } else {
      effect = blurEffect
    }


    if(enabled) {
      effect.enable()
    } else {
      effect.disable()
    }



  }

  const createMicrophoneTrackAction = async (deviceId) => {
    await createMicrophoneTrack({ deviceId }).then((localMicrophoneTrack) => {
      setLocalMicrophoneTrack(localMicrophoneTrack);
      updateEvents("Microphone track added ")
      localMicrophoneTrack.on('muted',(event) =>{
        updateEvents("Microphone "+ event.trackState.muted)
      })

      localMicrophoneTrack.on('ended',() =>{
        updateEvents("Microphone ended")
      })

      localMicrophoneTrack.on("underlying-track-change",() =>{
        updateEvents("Microphone track change")
      })
    });
  };

  const createCameraTrackAction = async (deviceId) => {

    await createCameraTrack({ deviceId }).then((localCameraTrack) => {
      setLocalCameraTrack(localCameraTrack);
      window.localCameraTrack = localCameraTrack;

      localCameraTrack.on('muted',(event) =>{
        updateEvents("Camera track", event.trackState.muted)
      })
      localCameraTrack.on('ended',(event) =>{
        updateEvents("Camera track Ended")
      })


      localCameraTrack.on("underlying-track-change", () => {
        updateEvents("Camera track change ")
        console.log(localCameraTrack.getMediaStreamTrackWithEffects());
      });
    });
  };

  const createDisplayTrackAction = async ({ withAudio, constraints }) => {
    await createDisplayTrack({ constraints, withAudio }).then(
      ({ localDisplayTrack, localComputerAudioTrack }) => {
        const displayTracks = [];
        displayTracks.push(localDisplayTrack);
        if (localComputerAudioTrack) {
          localComputerAudioTrack.on('muted',(event) =>{
            updateEvents("Computer Audio ", event.trackState.muted)
          })
          localComputerAudioTrack.on('ended',(event) =>{
            updateEvents("Computer Audio Track Ended ")
          })

          localDisplayTrack.on("underlying-track-change",(event) =>{
            updateEvents("Computer Audio underlying-track-change")
          })
          displayTracks.push(localComputerAudioTrack);
        }
          


        localDisplayTrack.on('muted',() =>{

          })
          localDisplayTrack.on('ended',() =>{
            
          })


          
        setLocalDisplayTracks(displayTracks);
      }
    );
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
              enableBlurBackground,
              enableVirtualBackground,
              enableBnr,
              stopAudioTrack: () => {localMicrophoneTrack.stop()},
              stopVideoTrack: () => {localCameraTrack.stop()},
              stopDisplayTrack: () => {localDisplayTrack.stop()},
              muteAudioTrack: (muted) => {localMicrophoneTrack.setMuted(muted)},
              muteVideoTrack: (muted) => {localCameraTrack.setMuted(muted)},
              init,
            }}
          />
        </Col>
        <Col>
        <p>Track Events </p>
        <EventList  
          {...{
            trackEvents}}
        />
        </Col>
        <Col id={"meetingStreams"}>
          <MediaStreams
            {...{ localMicrophoneTrack, localCameraTrack, localDisplayTracks }}
          />
        </Col>
      </Container>
    </>
  );
}

export default App;
