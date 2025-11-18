-- Create matchmaking queue table
create table if not exists public.matchmaking_queue (
  id uuid primary key default gen_random_uuid(),
  player_id text not null unique,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.matchmaking_queue enable row level security;

-- Allow anyone to view the queue (needed for matchmaking logic)
create policy "queue_select_all"
  on public.matchmaking_queue for select
  using (true);

-- Allow anyone to insert into queue
create policy "queue_insert_any"
  on public.matchmaking_queue for insert
  with check (true);

-- Allow anyone to delete from queue (needed when match is found)
create policy "queue_delete_any"
  on public.matchmaking_queue for delete
  using (true);

-- Create index
create index if not exists matchmaking_queue_created_at_idx 
  on public.matchmaking_queue(created_at asc);
