import {Button, Col, Form} from "react-bootstrap";

export default () => {
  const enableBNR = () => {}
  const disableBNR = () => {}

  return (
    <Form>
      <h2>Background Noise Reduction</h2>
      <Col>
        <label>Please put your headphones on for better listening</label>
      </Col>
      <Form.Group>
        <Col>
          <Button onClick={enableBNR}>enableBNR</Button>
          <Button variant="danger" onClick={disableBNR}>disableBNR</Button>
        </Col>
      </Form.Group>
    </Form>
  )
}
