import { Form } from 'react-bootstrap';

export default (props) => {
  if (props.localMicrophoneTrack || props.localCameraTrack) {
    return (
      <Form>
        <h2>Meeting Streams</h2>
        <Form.Group>
          <h3>Local Audio</h3>
          <audio
            ref={(audio) => {
              console.log(audio);
              audio.srcObject = props.localMicrophoneTrack
                ? new MediaStream([
                    props.localMicrophoneTrack.getMediaStreamTrack(),
                  ])
                : null;
            }}
            id='localAudio'
            autoPlay
            playsInline
          ></audio>
        </Form.Group>
        <Form.Group>
          <h3>Local Video</h3>
          <video
            ref={(video) => {
              console.log(video);
              video.srcObject = props.localCameraTrack
                ? new MediaStream([
                    props.localCameraTrack.getMediaStreamTrack(),
                  ])
                : null;
            }}
            id='localVideo'
            muted={true}
            autoPlay
            playsInline
          ></video>
        </Form.Group>
        <Form.Group>
          <h3>Local Screen Share</h3>
          <video
            id='localScreenShare'
            muted={true}
            autoPlay
            playsInline
          ></video>
        </Form.Group>
        <Form.Group>
          <h3>Remote Video</h3>
          <video id='remoteVideo' muted={true} autoPlay playsInline></video>
        </Form.Group>
        <Form.Group>
          <h3>Remote Screen Share</h3>
          <video
            id='remoteScreenShare'
            muted={true}
            autoPlay
            playsInline
          ></video>
        </Form.Group>
      </Form>
    );
  }
};
