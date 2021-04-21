CREATE DATABASE local_chat;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE events(
  event_id BIGSERIAL PRIMARY KEY, 
  event_uuid uuid DEFAULT uuid_generate_v4(),
  event_time TIMESTAMP NOT NULL,
  event_user VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  event_info JSON NOT NULL
);

CREATE OR REPLACE FUNCTION delete_old_rows() RETURNS trigger
  LANGUAGE plpgsql
  AS $$
BEGIN
	DELETE FROM events WHERE event_id < (
		SELECT event_id 
		FROM events
		ORDER BY event_id DESC
		LIMIT 1
	) - 100;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_delete_old_rows
  AFTER INSERT ON events
  EXECUTE PROCEDURE delete_old_rows();
