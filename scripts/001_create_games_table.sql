-- Create games table to store all game sessions
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  player_x_id text not null,
  player_o_id text not null,
  current_turn text not null check (current_turn in ('X', 'O')),
  board jsonb not null default '["","","","","","","","",""]',
  winner text check (winner in ('X', 'O', 'draw', null)),
  player_x_score integer not null default 0,
  player_o_score integer not null default 0,
  status text not null default 'playing' check (status in ('playing', 'finished', 'waiting_continue', 'punishment')),
  turn_started_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.games enable row level security;

-- Allow players to view games they are part of
create policy "games_select_own"
  on public.games for select
  using (
    player_x_id = current_setting('request.headers', true)::json->>'x-player-id' 
    or player_o_id = current_setting('request.headers', true)::json->>'x-player-id'
  );

-- Allow any player to insert a new game (for matchmaking)
create policy "games_insert_any"
  on public.games for insert
  with check (true);

-- Allow players to update games they are part of
create policy "games_update_own"
  on public.games for update
  using (
    player_x_id = current_setting('request.headers', true)::json->>'x-player-id'
    or player_o_id = current_setting('request.headers', true)::json->>'x-player-id'
  );

-- Create index for faster queries
create index if not exists games_player_x_id_idx on public.games(player_x_id);
create index if not exists games_player_o_id_idx on public.games(player_o_id);
create index if not exists games_status_idx on public.games(status);
create index if not exists games_created_at_idx on public.games(created_at desc);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger games_updated_at
  before update on public.games
  for each row
  execute function public.handle_updated_at();
