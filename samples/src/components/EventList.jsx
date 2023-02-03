import ListGroup from 'react-bootstrap/ListGroup';

export default (props) => {
  if(props.trackEvents.length > 0)
  return (
    <ListGroup>
      {props.trackEvents.map((event) => {
        return <ListGroup.Item>{event.message}</ListGroup.Item>;
      })}
    </ListGroup>
  );
};
