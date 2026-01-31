-- Helper script to Promote a User to Admin by Email
-- Usage: Replace 'admin@dailyfresh.com' with the email of the user you want to promote.
-- NOTE: The user MUST have already signed up in the app (exist in auth.users).

insert into public.admins (id, email)
select id, email
from auth.users
where email = 'admin@dailyfresh.com' -- <--- CHANGE THIS EMAIL
on conflict (id) do nothing; -- Prevents errors if already added
