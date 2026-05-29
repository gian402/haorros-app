-- Tabla users (sincronizada con auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

-- Tabla goals
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  target_amount numeric(12,2) not null check (target_amount > 0),
  current_amount numeric(12,2) not null default 0,
  image_url text,
  owner_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Tabla goal_members
create table public.goal_members (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  unique(goal_id, user_id)
);

-- Tabla transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  created_at timestamptz default now()
);

-- Función para incrementar current_amount de forma atómica
create or replace function increment_goal_amount(goal_id uuid, increment numeric)
returns void language sql as $$
  update public.goals
  set current_amount = current_amount + increment
  where id = goal_id;
$$;

-- RLS: habilitar en todas las tablas
alter table public.users enable row level security;
alter table public.goals enable row level security;
alter table public.goal_members enable row level security;
alter table public.transactions enable row level security;

-- Políticas users
create policy "Auth users can search by email" on public.users for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Políticas goals: owner o miembro puede leer
create policy "Goal access" on public.goals for select
  using (
    owner_id = auth.uid() or
    exists (select 1 from public.goal_members where goal_id = id and user_id = auth.uid())
  );
create policy "Owner can insert goals" on public.goals for insert with check (owner_id = auth.uid());
create policy "Owner can update goals" on public.goals for update using (owner_id = auth.uid());

-- Políticas goal_members
create policy "Members can read" on public.goal_members for select
  using (
    user_id = auth.uid() or
    exists (select 1 from public.goals where id = goal_id and owner_id = auth.uid())
  );
create policy "Owner can add members" on public.goal_members for insert
  with check (
    exists (select 1 from public.goals where id = goal_id and owner_id = auth.uid())
  );

-- Políticas transactions
create policy "Members can read transactions" on public.transactions for select
  using (
    exists (
      select 1 from public.goals g
      left join public.goal_members gm on gm.goal_id = g.id
      where g.id = goal_id and (g.owner_id = auth.uid() or gm.user_id = auth.uid())
    )
  );
create policy "Members can insert transactions" on public.transactions for insert
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.goals g
      left join public.goal_members gm on gm.goal_id = g.id
      where g.id = goal_id and (g.owner_id = auth.uid() or gm.user_id = auth.uid())
    )
  );

-- Realtime: habilitar para goals y transactions
alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.transactions;

-- Storage bucket para imágenes
insert into storage.buckets (id, name, public) values ('goal-images', 'goal-images', true);
create policy "Public read goal images" on storage.objects for select using (bucket_id = 'goal-images');
create policy "Auth users upload goal images" on storage.objects for insert
  with check (bucket_id = 'goal-images' and auth.role() = 'authenticated');
