insert into storage.buckets (id, name, public, file_size_limit)
values ('site-assets', 'site-assets', false, 10485760)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;
