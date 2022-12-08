import {Button, Form} from "react-bootstrap";

const gatherDevices = () => {}

export default () => {
  return (
    <Form>
      <h2>Initialization</h2>
      <div>
        <Button id="btn-get-devices" size="sm" onClick={gatherDevices}>
          gather devices(audio, video, playback)
        </Button>
      </div>
    </Form>
  )
}
