create or replace function public.taken_dates(_sid uuid)
returns setof date language sql stable security definer set search_path = public as $$
  select date from public.availability
   where supplier_id = _sid and status in ('blocked','booked') and date >= current_date
  union
  select event_date from public.booking_requests
   where supplier_id = _sid and status in ('requested','supplier_reviewing','offer_sent','customer_accepted','payment_pending','confirmed') and event_date >= current_date
$$;
alter table public.booking_requests drop constraint if exists booking_requests_status_check;
alter table public.booking_requests add constraint booking_requests_status_check check (status in ('requested','supplier_reviewing','offer_sent','customer_accepted','payment_pending','confirmed','rejected','cancelled','completed'));
alter table public.availability drop constraint if exists availability_status_check;
alter table public.availability add constraint availability_status_check check (status in ('available','pending','booked','blocked'));