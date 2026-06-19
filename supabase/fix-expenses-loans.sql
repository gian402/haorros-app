-- Ejecuta esto en el SQL Editor de Supabase
-- Elimina y recrea expenses y loans con FK a auth.users (no public.users)

drop table if exists public.loans;
drop table if exists public.expenses;

create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount      numeric(12,2) not null check (amount > 0),
  category    text,
  created_at  timestamptz default now() not null
);

alter table public.expenses enable row level security;

create policy "expenses_owner" on public.expenses
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table public.loans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount      numeric(12,2) not null check (amount > 0),
  paid        boolean default false not null,
  created_at  timestamptz default now() not null
);

alter table public.loans enable row level security;

create policy "loans_owner" on public.loans
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
