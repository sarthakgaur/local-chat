CREATE DATABASE local_chat;

CREATE TABLE messages(
  message_id BIGSERIAL PRIMARY KEY, 
  message_time TIMESTAMP NOT NULL,
  message_user VARCHAR(255) NOT NULL,
  message_text TEXT NOT NULL
);

CREATE FUNCTION delete_old_rows() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
BEGIN
	DELETE FROM messages WHERE message_id < (
		SELECT message_id 
		FROM messages
		ORDER BY message_id DESC
		LIMIT 1
	) - 100;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trigger_delete_old_rows
  AFTER INSERT ON messages
  EXECUTE PROCEDURE delete_old_rows();
