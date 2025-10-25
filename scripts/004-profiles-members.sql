-- add profiles and members tables to reflect approvals beyond pending_members

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  phone text unique,
  gender text not null check (gender in ('male','female')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (profile_id)
);

create index if not exists idx_profiles_email on profiles (email);
create index if not exists idx_profiles_phone on profiles (phone);
create index if not exists idx_members_profile_id on members (profile_id);
