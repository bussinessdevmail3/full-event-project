create type public.app_role as enum ('admin','supplier','customer');
create type public.supplier_status as enum ('pending','approved','rejected','suspended');
create type public.event_status as enum ('pending','confirmed','rejected','cancelled','completed');

create table public.regions (id uuid primary key default gen_random_uuid(), name_he text not null, name_ar text not null, created_at timestamptz not null default now());
create table public.cities (id uuid primary key default gen_random_uuid(), region_id uuid references public.regions(id) on delete set null, name_he text not null, name_ar text not null, created_at timestamptz not null default now());
create table public.supplier_types (id uuid primary key default gen_random_uuid(), code text unique not null, name_he text not null, name_ar text not null);
create table public.amenities (id uuid primary key default gen_random_uuid(), name_he text not null, name_ar text not null);
create table public.genres (id uuid primary key default gen_random_uuid(), name_he text not null, name_ar text not null);
create table public.event_types (id uuid primary key default gen_random_uuid(), name_he text not null, name_ar text not null);

create table public.profiles (id uuid primary key, full_name text, phone text, email text, preferred_language text not null default 'he', created_at timestamptz not null default now());
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null, role public.app_role not null, unique(user_id, role));

create table public.supplier_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  supplier_type text not null default 'venue',
  business_name text not null,
  description text,
  city_id uuid references public.cities(id) on delete set null,
  phone text, email text, cover_url text,
  status public.supplier_status not null default 'pending',
  created_at timestamptz not null default now()
);
create table public.venues (supplier_id uuid primary key references public.supplier_profiles(id) on delete cascade, capacity_min int, capacity_max int, address text);
create table public.artists (supplier_id uuid primary key references public.supplier_profiles(id) on delete cascade, stage_name text, band_size int);
create table public.venue_amenities (supplier_id uuid references public.supplier_profiles(id) on delete cascade, amenity_id uuid references public.amenities(id) on delete cascade, primary key (supplier_id, amenity_id));
create table public.artist_genres (supplier_id uuid references public.supplier_profiles(id) on delete cascade, genre_id uuid references public.genres(id) on delete cascade, primary key (supplier_id, genre_id));
create table public.supplier_packages (id uuid primary key default gen_random_uuid(), supplier_id uuid not null references public.supplier_profiles(id) on delete cascade, name text not null, description text, price numeric(10,2) not null default 0, is_active boolean not null default true, created_at timestamptz not null default now());
create table public.events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  supplier_id uuid not null references public.supplier_profiles(id) on delete cascade,
  package_id uuid references public.supplier_packages(id) on delete set null,
  event_type_id uuid references public.event_types(id) on delete set null,
  event_date date not null,
  guests int, notes text, total_price numeric(10,2),
  status public.event_status not null default 'pending',
  created_at timestamptz not null default now()
);
create table public.availability (id uuid primary key default gen_random_uuid(), supplier_id uuid not null references public.supplier_profiles(id) on delete cascade, date date not null, is_blocked boolean not null default true, event_id uuid references public.events(id) on delete set null, unique(supplier_id, date));

create or replace function public.has_role(_user_id uuid, _role public.app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;
create or replace function public.owns_supplier(_sid uuid) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.supplier_profiles where id = _sid and user_id = auth.uid()) $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email) values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- grants
grant select on public.regions, public.cities, public.supplier_types, public.amenities, public.genres, public.event_types to anon, authenticated;
grant insert, update, delete on public.regions, public.cities, public.supplier_types, public.amenities, public.genres, public.event_types to authenticated;
grant select, insert, update, delete on public.profiles, public.user_roles, public.supplier_profiles, public.venues, public.artists, public.venue_amenities, public.artist_genres, public.supplier_packages, public.events, public.availability to authenticated;
grant all on all tables in schema public to service_role;

do $$ declare t text; begin
  foreach t in array array['regions','cities','supplier_types','amenities','genres','event_types','profiles','user_roles','supplier_profiles','venues','artists','venue_amenities','artist_genres','supplier_packages','events','availability'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
  foreach t in array array['regions','cities','supplier_types','amenities','genres','event_types'] loop
    execute format('create policy "read %1$s" on public.%1$I for select using (true)', t);
    execute format('create policy "admin write %1$s" on public.%1$I for all to authenticated using (public.has_role(auth.uid(),''admin'')) with check (public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

create policy "own profile" on public.profiles for all to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin')) with check (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "supplier own or admin" on public.supplier_profiles for select to authenticated using (user_id = auth.uid() or status = 'approved' or public.has_role(auth.uid(),'admin'));
create policy "supplier insert self" on public.supplier_profiles for insert to authenticated with check (user_id = auth.uid() and status = 'pending');
create policy "supplier update own" on public.supplier_profiles for update to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin')) with check (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admin delete supplier" on public.supplier_profiles for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- prevent suppliers from changing their own status
create or replace function public.guard_supplier_status() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status and not public.has_role(auth.uid(),'admin') then
    raise exception 'Only admins can change supplier status';
  end if;
  return new;
end $$;
create trigger guard_supplier_status before update on public.supplier_profiles for each row execute function public.guard_supplier_status();

-- grant supplier role on supplier profile creation
create or replace function public.grant_supplier_role() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.user_roles(user_id, role) values (new.user_id, 'supplier') on conflict do nothing; return new; end $$;
create trigger grant_supplier_role after insert on public.supplier_profiles for each row execute function public.grant_supplier_role();

do $$ declare t text; begin
  foreach t in array array['venues','artists','venue_amenities','artist_genres','supplier_packages','availability'] loop
    execute format('create policy "owner or admin %1$s" on public.%1$I for all to authenticated using (public.owns_supplier(supplier_id) or public.has_role(auth.uid(),''admin'')) with check (public.owns_supplier(supplier_id) or public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;

create policy "events read" on public.events for select to authenticated using (customer_id = auth.uid() or public.owns_supplier(supplier_id) or public.has_role(auth.uid(),'admin'));
create policy "events insert customer" on public.events for insert to authenticated with check (customer_id = auth.uid());
create policy "events update" on public.events for update to authenticated using (public.owns_supplier(supplier_id) or public.has_role(auth.uid(),'admin')) with check (public.owns_supplier(supplier_id) or public.has_role(auth.uid(),'admin'));
create policy "events delete admin" on public.events for delete to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.supplier_types(code,name_he,name_ar) values ('venue','אולם','قاعة'),('artist','זמר/אמן','مطرب/فنان');
