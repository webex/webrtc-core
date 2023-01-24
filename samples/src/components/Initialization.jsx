import { Button, Form } from 'react-bootstrap';

export default (props) => {
  return (
    <Form>
      <h2>Initialization</h2>
      <div>
        <Button id='btn-get-devices' size='sm' onClick={props.init}>
          gather devices(audio, video, playback)
        </Button>
      </div>
    </Form>
  );
};
