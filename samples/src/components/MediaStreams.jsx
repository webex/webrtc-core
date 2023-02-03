import { useRef } from 'react';
import { Form } from 'react-bootstrap';
export default (props) => {
  const localAudio = useRef();
  const localVideo = useRef();
  const localShare = useRef();

  if (localAudio.current && props.localMicrophoneTrack)
    localAudio.current.srcObject = new MediaStream([
      props.localMicrophoneTrack.getMediaStreamTrack(),
    ]);

  if (localVideo.current && props.localCameraTrack)
    if(props.localCameraTrack.getEffect('blur')){
      localVideo.current.srcObject = new MediaStream([props.localCameraTrack.getMediaStreamTrackWithEffects()]);

    } else {
      localVideo.current.srcObject = new MediaStream([props.localCameraTrack.getMediaStreamTrack()]);

    }
   
  if (localAudio.current && props.localDisplayTracks)
    localShare.current.srcObject = new MediaStream(props.localDisplayTracks.getMediaStreamTrack());

  return (
    <Form>
      <h2>Meeting Streams</h2>
      <Form.Group>
        <h3>Local Audio</h3>
        <audio ref={localAudio} id='localAudio' autoPlay playsInline></audio>
      </Form.Group>
      <Form.Group>
        <h3>Local Video</h3>
        <video
          ref={localVideo}
          id='localVideo'
          muted={true}
          autoPlay
          playsInline
        ></video>
      </Form.Group>
      <Form.Group>
        <h3>Local Screen Share</h3>
        <video
          ref={localShare}
          id='localScreenShare'
          muted={true}
          autoPlay
          playsInline
        ></video>
      </Form.Group>
    </Form>
  );
};
