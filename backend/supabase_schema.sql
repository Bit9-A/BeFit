-- =====================================================
-- BE FIT - SUPABASE SCHEMA OPTIMIZADO PARA PERSISTENCIA
-- =====================================================
-- IMPORTANTE: Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- Esto garantiza que los datos se guarden y no se repitan peticiones

-- Enable extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE - DATOS PERSISTENTES DEL USUARIO
-- =====================================================
-- Esta tabla se crea automáticamente cuando un usuario se registra
-- y mantiene TODOS sus datos personales

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  
  -- Datos físicos (se piden UNA VEZ en onboarding)
  height numeric(5,2) check (height > 0 and height < 300),
  birth_date date check (birth_date < current_date),
  gender text check (gender in ('male', 'female', 'other')),
  
  -- Preferencias fitness (editables en Perfil)
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal text check (goal in ('muscle_gain', 'weight_loss', 'maintenance')),
  
  -- IMPORTANTE: Este campo controla si se muestra onboarding o no
  onboarding_completed boolean default false,
  
  -- Configuración de notificaciones
  notifications_enabled boolean default true,
  reminder_time time default '09:00:00',
  
  -- Tracking de actividad
  last_active_at timestamp with time zone,
  streak_days integer default 0,
  total_workouts integer default 0,
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Auto-update updated_at on any change
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, onboarding_completed)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    false  -- New users need onboarding
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS: Users can only see/edit their own profile
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =====================================================
-- 2. MEASUREMENTS - HISTORIAL DE PESO Y MÉTRICAS
-- =====================================================
-- Cada registro de peso se guarda aquí, NO se sobrescribe

create table if not exists public.measurements (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  
  -- Medidas
  weight numeric(5,2) not null check (weight > 0 and weight < 500),
  body_fat_percentage numeric(4,2) check (body_fat_percentage >= 0 and body_fat_percentage <= 100),
  
  -- Métricas calculadas (guardadas para historial)
  bmi numeric(4,2) check (bmi > 0),
  tmb numeric(7,2) check (tmb > 0),
  tdee numeric(7,2) check (tdee > 0),
  
  notes text,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.measurements enable row level security;

drop policy if exists "Users can manage own measurements" on public.measurements;
create policy "Users can manage own measurements"
  on public.measurements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Vista para obtener el peso más reciente fácilmente
create or replace view public.latest_measurements as
select distinct on (user_id)
  user_id,
  weight,
  bmi,
  tmb,
  tdee,
  recorded_at
from public.measurements
order by user_id, recorded_at desc;

-- =====================================================
-- 3. ROUTINES - RUTINAS DE EJERCICIO
-- =====================================================

create table if not exists public.routines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  ai_explanation text,
  plan_data jsonb not null default '{"exercises": []}',
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration_minutes integer check (duration_minutes > 0),
  calories_burned integer check (calories_burned >= 0),
  is_completed boolean default false,
  completed_at timestamp with time zone,
  scheduled_date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.routines enable row level security;

drop policy if exists "Users can manage own routines" on public.routines;
create policy "Users can manage own routines"
  on public.routines for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- 4. NUTRITION_LOGS - REGISTRO DE COMIDAS
-- =====================================================

create table if not exists public.nutrition_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text,
  meal_name text,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  calories integer check (calories >= 0),
  protein_g numeric(6,2) check (protein_g >= 0),
  carbs_g numeric(6,2) check (carbs_g >= 0),
  fat_g numeric(6,2) check (fat_g >= 0),
  ingredients jsonb default '[]',
  recipe_instructions text,
  ai_analysis text,
  consumed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.nutrition_logs enable row level security;

drop policy if exists "Users can manage own nutrition logs" on public.nutrition_logs;
create policy "Users can manage own nutrition logs"
  on public.nutrition_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- 5. MENTAL_JOURNAL - CHAT DE TERAPIA AI
-- =====================================================

create table if not exists public.mental_journal (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_id uuid default uuid_generate_v4() not null,
  message_type text check (message_type in ('user', 'assistant')) not null,
  content text not null,
  mood_detected text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.mental_journal enable row level security;

drop policy if exists "Users can view own journal" on public.mental_journal;
create policy "Users can view own journal"
  on public.mental_journal for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert journal entries" on public.mental_journal;
create policy "Users can insert journal entries"
  on public.mental_journal for insert
  with check (auth.uid() = user_id);

-- =====================================================
-- INDEXES PARA PERFORMANCE
-- =====================================================
create index if not exists idx_measurements_user_date on public.measurements(user_id, recorded_at desc);
create index if not exists idx_routines_user_date on public.routines(user_id, scheduled_date desc);
create index if not exists idx_nutrition_user_date on public.nutrition_logs(user_id, consumed_at desc);
create index if not exists idx_journal_user_session on public.mental_journal(user_id, session_id);
create index if not exists idx_profiles_onboarding on public.profiles(onboarding_completed);

-- =====================================================
-- FUNCIONES HELPER
-- =====================================================

-- Función para marcar onboarding como completado
create or replace function public.complete_onboarding(user_uuid uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set 
    onboarding_completed = true,
    updated_at = now()
  where id = user_uuid;
end;
$$;

-- Función para obtener resumen del usuario
create or replace function public.get_user_summary(user_uuid uuid)
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'profile', row_to_json(p),
    'latest_weight', (
      select weight from public.measurements 
      where user_id = user_uuid 
      order by recorded_at desc 
      limit 1
    ),
    'workouts_this_week', (
      select count(*) from public.routines 
      where user_id = user_uuid 
        and is_completed = true 
        and completed_at >= now() - interval '7 days'
    ),
    'total_workouts', (
      select count(*) from public.routines 
      where user_id = user_uuid 
        and is_completed = true
    )
  ) into result
  from public.profiles p
  where p.id = user_uuid;
  
  return result;
end;
$$;

-- =====================================================
-- GRANTS (permisos)
-- =====================================================
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant execute on all functions in schema public to anon, authenticated;
