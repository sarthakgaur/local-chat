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
