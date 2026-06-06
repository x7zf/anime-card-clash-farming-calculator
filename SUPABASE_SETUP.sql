
create table teams (
 id uuid primary key default gen_random_uuid(),
 category text not null,
 subcategory text not null,
 difficulty text not null,
 rng text,
 result text,
 title text not null,
 tags text,
 notes text,
 image_url text,
 created_at timestamptz default now()
);

create table presets (
 id bigint generated always as identity primary key,
 category text not null,
 subcategory text not null
);
