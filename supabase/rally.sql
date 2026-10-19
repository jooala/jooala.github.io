-- Rally minigame: daily leaderboard.
-- Run once in your Supabase project (SQL editor). Online rooms use Realtime
-- broadcast/presence and need no tables.

create table if not exists public.rally_times (
  id          bigint generated always as identity primary key,
  day         date        not null,
  name        text        not null check (char_length(name) between 1 and 16),
  time_ms     integer     not null check (time_ms between 30000 and 900000),
  best_lap_ms integer              check (best_lap_ms is null or best_lap_ms between 8000 and 300000),
  created_at  timestamptz not null default now()
);

create index if not exists rally_times_day_time on public.rally_times (day, time_ms);

alter table public.rally_times enable row level security;

-- Anyone can read the boards
drop policy if exists "rally times are public" on public.rally_times;
create policy "rally times are public"
  on public.rally_times for select
  to anon, authenticated
  using (true);

-- Anyone can post a time, but only for today's circuit (± a day around the
-- UTC date: the circuit changes at midnight Finnish time, and races can end
-- just after midnight)
drop policy if exists "post a time for today" on public.rally_times;
create policy "post a time for today"
  on public.rally_times for insert
  to anon, authenticated
  with check (day between (now() at time zone 'utc')::date - 1 and (now() at time zone 'utc')::date + 1);

-- No updates or deletes from the client
revoke update, delete on public.rally_times from anon, authenticated;
