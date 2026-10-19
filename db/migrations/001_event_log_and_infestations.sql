create extension if not exists postgis;

-- Source of truth (ADR 0002). Append-only: see the trigger below.
create table events (
  id           bigserial primary key,
  kind         text not null check (kind in ('report_submitted')),
  report_id    uuid not null,
  occurred_at  timestamptz not null,
  submitter_ref text,
  payload      jsonb not null
);

create function events_are_append_only() returns trigger as $$
begin
  raise exception 'events is append-only';
end;
$$ language plpgsql set search_path = '';

create trigger events_no_update_delete
  before update or delete on events
  for each row execute function events_are_append_only();

-- Projections: rebuildable from events, written in the same transaction.
create table infestations (
  id                 uuid primary key,
  location           geography(Point, 4326) not null,
  type               text not null check (type in ('find', 'remove')),
  status             text not null check (status in ('reported', 'verified')),
  latest_report_id   uuid not null
);
create index infestations_location_idx on infestations using gist (location);

create table reports (
  id               uuid primary key,
  infestation_id   uuid not null references infestations (id),
  type             text not null check (type in ('find', 'remove')),
  location         geography(Point, 4326) not null,
  observed_on      date not null,
  submitted_at     timestamptz not null,
  description      text
);
