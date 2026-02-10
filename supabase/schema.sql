-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
-- Handled by Supabase Auth, but usually good to have a public profile table.
-- For now, we will link directly toauth.users if needed, or just store user_id.

-- AGENTS TABLE (Models our users)
-- Link to auth.users. Stores profile info.
create table if not exists agents (
    id uuid primary key references auth.users (id) on delete cascade,
    name text,
    email text,
    phone text,
    agency_name text,
    created_at timestamp with time zone default timezone ('utc'::text, now()) not null
);

-- MESSAGES TABLE
create table if not exists messages (
    id uuid default uuid_generate_v4 () primary key,
    agent_id uuid references agents (id) on delete cascade not null,
    content text not null,
    role text check (role in ('user', 'assistant')) not null,
    created_at timestamp with time zone default timezone ('utc'::text, now()) not null
);

-- CLIENTS TABLE (Models customers for agents)
-- People interested in properties.
create table if not exists clients (
    id uuid default uuid_generate_v4 () primary key,
    agent_id uuid references agents (id) on delete cascade not null,
    name text,
    phone text,
    requirements text, -- e.g. "Looking for 2BHK in Bandra"
    budget_min numeric,
    budget_max numeric,
    status text default 'active', -- 'active', 'closed', 'lead'
    created_at timestamp with time zone default timezone ('utc'::text, now()) not null
);

-- PROPERTIES TABLE
-- Properties that agents have or find.
create table if not exists properties (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references agents(id) on delete cascade not null,

-- Extracted Fields
raw_text text, -- Original message text if from a forward
location text,
price text, -- Keeping as text for now
type text, -- 'Sell', 'Rent'
bhk text, -- '2BHK', '3BHK'
description text,
contact_info text,

-- Metadata
status text default 'available', -- 'available', 'sold', 'rented'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Row Level Security)
alter table agents enable row level security;

alter table messages enable row level security;

alter table clients enable row level security;

alter table properties enable row level security;

-- Agents: Can view/update their own profile
create policy "Agents can view own profile" on agents for
select using (auth.uid () = id);

create policy "Agents can update own profile" on agents
for update
    using (auth.uid () = id);

create policy "Agents can insert own profile" on agents for insert
with
    check (auth.uid () = id);

-- Messages: Users can only see/insert their own messages
create policy "Agents can view own messages" on messages for
select using (auth.uid () = agent_id);

create policy "Agents can insert own messages" on messages for insert
with
    check (auth.uid () = agent_id);

-- Clients: Agents can only view/manage their OWN clients
create policy "Agents can view own clients" on clients for
select using (auth.uid () = agent_id);

create policy "Agents can insert own clients" on clients for insert
with
    check (auth.uid () = agent_id);

create policy "Agents can update own clients" on clients
for update
    using (auth.uid () = agent_id);

-- Properties: Agents can only view/manage their OWN properties
create policy "Agents can view own properties" on properties for
select using (auth.uid () = agent_id);

create policy "Agents can insert own properties" on properties for insert
with
    check (auth.uid () = agent_id);

create policy "Agents can update own properties" on properties
for update
    using (auth.uid () = agent_id);

-- USER MANAGEMENT TRIGGER
-- Automatically create an agent profile when a new user signs up via Supabase Auth.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.agents (id, email, name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name' -- Assuming 'full_name' is passed in metadata, or null
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();