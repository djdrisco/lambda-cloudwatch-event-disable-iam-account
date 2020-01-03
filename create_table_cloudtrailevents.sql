CREATE TABLE CloudTrailEvents (
  event_version varchar(80),
  user_identity jsonb,
  event_time timestamp,
  event_source varchar(255),
  event_name varchar(255),  
  aws_region varchar(80),
  source_ip_address varchar(80),
  useragent varchar(255),
  request_parameters jsonb,
  response_elements jsonb,
  resources jsonb,
  request_id varchar(255),
  shared_event_id varchar(255),
  event_id int,
  event_type varchar(255),
  recipient_account_id varchar(255)
)