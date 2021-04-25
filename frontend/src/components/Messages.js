import React, { useLayoutEffect, useRef } from "react";
import Message from "./Message";

const Messages = ({ events }) => {
  const endElement = useRef();

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
