-- =====================================================
-- BE FIT - SUPABASE QUICK FIX
-- =====================================================
-- Ejecuta esto en Supabase Dashboard > SQL Editor
-- Esto corrige los problemas de permisos RLS

-- =====================================================
-- 1. Agregar política INSERT para profiles
-- =====================================================
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- =====================================================
-- 2. Agregar columna onboarding_completed si no existe
-- =====================================================
alter table public.profiles 
add column if not exists onboarding_completed boolean default false;

-- =====================================================
-- 3. Agregar política INSERT para measurements
-- =====================================================
drop policy if exists "Users can insert own measurements" on public.measurements;
create policy "Users can insert own measurements"
  on public.measurements for insert
  with check (auth.uid() = user_id);

-- =====================================================
-- 4. Asegurar que profiles tenga todas las columnas
-- =====================================================
alter table public.profiles 
add column if not exists last_active_at timestamp with time zone;

alter table public.profiles 
add column if not exists streak_days integer default 0;

alter table public.profiles 
add column if not exists total_workouts integer default 0;

-- =====================================================
-- 5. Trigger para auto-crear perfil al registrarse
-- =====================================================
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
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- 6. Crear perfil para usuarios existentes que no lo tengan
-- =====================================================
insert into public.profiles (id, email, onboarding_completed)
select id, email, false
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- Mensaje de confirmación
select 'RLS policies and triggers configured successfully!' as status;
