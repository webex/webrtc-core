import {Form} from "react-bootstrap";

export default () => {
  return (
    <Form>
      <h2>Meeting Streams</h2>
      <Form.Group>
        <h3>Local Video</h3>
        <video id="localVideo" muted={true} autoPlay playsInline></video>
      </Form.Group>
      <Form.Group>
        <h3>Local Screen Share</h3>
        <video id="localScreenShare" muted={true} autoPlay playsInline></video>
      </Form.Group>
      <Form.Group>
        <h3>Remote Video</h3>
        <video id="remoteVideo" muted={true} autoPlay playsInline></video>
      </Form.Group>
      <Form.Group>
        <h3>Remote Screen Share</h3>
        <video id="remoteScreenShare" muted={true} autoPlay playsInline></video>
      </Form.Group>
    </Form>
  )
}
