import React, { useContext, useEffect, useRef, useState } from "react";
import Message from "./Message";
import SocketContext from "../context/socket";
import debounce from "../utils/debounce";

const Messages = () => {
  const socket = useContext(SocketContext);
  const [events, setEvents] = useState([]);
  const endElement = useRef();

  useEffect(() => {
    const handleScroll = () => {
      if (document.documentElement.scrollTop === 0) {
        socket.emit("oldEvents");
      }
    };

    const debouncedHandleScroll = debounce(handleScroll);

    const addEvent = (event) => {
      setEvents((events) => events.concat(event));
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400
      ) {
        endElement.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    const handleRecentEvents = (events) => {
      setEvents(events);
      setTimeout(() => {
        endElement.current.scrollIntoView({ behavior: "smooth" });
      }, 500);
    };

    const handleOldEvents = (oldEvents) => {
      if (oldEvents.length === 0) {
        window.removeEventListener("scroll", debouncedHandleScroll);
      } else {
        setEvents((events) => oldEvents.concat(events));
      }
    };

    window.addEventListener("scroll", debouncedHandleScroll);
    socket.on("userConnected", addEvent);
    socket.on("userDisconnected", addEvent);
    socket.on("chatMessage", addEvent);
    socket.on("fileUpload", addEvent);
    socket.on("recentEvents", handleRecentEvents);
    socket.on("oldEvents", handleOldEvents);

    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll);
      socket.off("userConnected", addEvent);
      socket.off("userDisconnected", addEvent);
      socket.off("chatMessage", addEvent);
      socket.off("fileUpload", addEvent);
      socket.off("recentEvents", handleRecentEvents);
      socket.off("oldEvents", handleOldEvents);
    };
  }, [socket]);

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
