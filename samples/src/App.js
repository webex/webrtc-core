import "bootswatch/dist/pulse/bootstrap.min.css";
import './App.css';
import { Col, Container, Navbar, Row } from 'react-bootstrap';
import Initialization from "./components/Initialization";
import MediaDevices from "./components/MediaDevices";
import Background from "./components/Background";
import MediaStreams from "./components/MediaStreams";

function App() {
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
             <Initialization />
           </Row>
           <Row>
             <MediaDevices />
           </Row>
           <Row>
             <Background />
           </Row>
         </Col>
         <Col id={'meetingStreams'}>
           <MediaStreams />
         </Col>
       </Row>
     </Container>
   </>
  );
}

export default App;
