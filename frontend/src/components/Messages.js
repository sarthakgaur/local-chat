import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Message from "./Message";
import SocketContext from "../context/socket";

const Messages = () => {
  const socket = useContext(SocketContext);
  const [events, setEvents] = useState([]);
  const endElement = useRef();

  useEffect(() => {
    const addEvent = (event) => {
      setEvents((events) => events.concat(event));
    };

    socket.on("userConnected", addEvent);
    socket.on("userDisconnected", addEvent);
    socket.on("chatMessage", addEvent);
    socket.on("fileUpload", addEvent);

    socket.on("oldEvents", (events) => {
      events.forEach((event) => {
        switch (event.type) {
          case "userConnected":
          case "userDisconnected":
          case "chatMessage":
          case "fileUpload":
            addEvent(event);
            break;
          default:
            break;
        }
      });
    });
  }, [socket]);

  useLayoutEffect(() => {
    endElement.current.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  return (
    <div>
      {events.map((event) => (
        <Message key={event.uuid} event={event} />
      ))}
      <div ref={endElement}></div>
    </div>
  );
};

export default Messages;
