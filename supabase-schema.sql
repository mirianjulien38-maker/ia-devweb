-- ====================================================================
-- SUPABASE SAAS MULTI-TENANT DATABASE SCHEMA
-- This SQL script sets up the multi-tenant SaaS architecture for DevWeb AI.
-- All client tables are secured with Row Level Security (RLS).
-- Each table contains a 'user_id' column linked to Auth.users,
-- ensuring clients can only view and edit their own websites and projects.
-- Run this in the Supabase SQL Editor.
-- ====================================================================

-- 1. PROFILES / USERS TABLE
-- Automatically synchronizes with Supabase Auth users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  display_name text,
  avatar_url text,
  credits numeric default 15.0 not null,
  tokens_used bigint default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- 2. PROJECTS TABLE
-- Stores logical client projects (websites being built)
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  prompt text not null,
  status text default 'active' not null, -- 'active', 'draft', 'archived'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Projects
alter table public.projects enable row level security;

create policy "Users can read their own projects" 
  on public.projects for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own projects" 
  on public.projects for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own projects" 
  on public.projects for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own projects" 
  on public.projects for delete 
  using (auth.uid() = user_id);

-- 3. WEBSITES TABLE
-- Stores specific domain and layout information for the project
create table if not exists public.websites (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  domain text,
  subdomain text unique,
  template_chosen text,
  theme_config jsonb default '{}'::jsonb not null,
  status text default 'published' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Websites
alter table public.websites enable row level security;

create policy "Users can read their own websites" 
  on public.websites for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own websites" 
  on public.websites for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own websites" 
  on public.websites for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own websites" 
  on public.websites for delete 
  using (auth.uid() = user_id);

-- 4. PAGES TABLE
-- Stores page content, HTML, blocks, and titles for each website
create table if not exists public.pages (
  id uuid default gen_random_uuid() primary key,
  website_id uuid references public.websites(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null,
  slug text not null, -- 'home', 'about', 'contact', etc.
  html_content text not null,
  is_published boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Pages
alter table public.pages enable row level security;

create policy "Users can read their own pages" 
  on public.pages for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own pages" 
  on public.pages for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own pages" 
  on public.pages for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own pages" 
  on public.pages for delete 
  using (auth.uid() = user_id);

-- 5. BLOG POSTS TABLE
-- Multi-tenant blog entries
create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  website_id uuid references public.websites(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null,
  content text not null,
  excerpt text,
  cover_image text,
  status text default 'published' not null, -- 'published', 'draft'
  published_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Blog Posts
alter table public.blog_posts enable row level security;

create policy "Users can read their own blog posts" 
  on public.blog_posts for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own blog posts" 
  on public.blog_posts for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own blog posts" 
  on public.blog_posts for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own blog posts" 
  on public.blog_posts for delete 
  using (auth.uid() = user_id);

-- 6. MEDIA TABLE
-- Keeps track of Unsplash or generated images
create table if not exists public.media (
  id uuid default gen_random_uuid() primary key,
  website_id uuid references public.websites(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  url text not null,
  title text,
  file_type text, -- 'image/jpeg', 'image/png', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Media
alter table public.media enable row level security;

create policy "Users can read their own media" 
  on public.media for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own media" 
  on public.media for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own media" 
  on public.media for delete 
  using (auth.uid() = user_id);

-- 7. SETTINGS TABLE
-- Configuration parameters, colors, fonts, styles
create table if not exists public.settings (
  id uuid default gen_random_uuid() primary key,
  website_id uuid references public.websites(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  layout_style text default 'modern' not null,
  font_pair text default 'Inter / Inter' not null,
  primary_color text default '#0ea5e9' not null,
  secondary_color text default '#64748b' not null,
  header_logo_url text,
  footer_text text,
  social_links jsonb default '{}'::jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Settings
alter table public.settings enable row level security;

create policy "Users can read their own settings" 
  on public.settings for select 
  using (auth.uid() = user_id);

create policy "Users can update their own settings" 
  on public.settings for update 
  using (auth.uid() = user_id);

-- 8. SEO TABLE
-- SEO Configuration (meta tags, descriptions, sitemap details)
create table if not exists public.seo (
  id uuid default gen_random_uuid() primary key,
  website_id uuid references public.websites(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  meta_title text,
  meta_description text,
  meta_keywords text,
  og_image text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for SEO
alter table public.seo enable row level security;

create policy "Users can read their own SEO" 
  on public.seo for select 
  using (auth.uid() = user_id);

create policy "Users can update their own SEO" 
  on public.seo for update 
  using (auth.uid() = user_id);

-- 9. FORMS TABLE
-- Client forms and visitor contact form submissions
create table if not exists public.forms (
  id uuid default gen_random_uuid() primary key,
  website_id uuid references public.websites(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  form_name text not null, -- e.g., 'Contact Submission'
  visitor_name text,
  visitor_email text,
  visitor_message text,
  payload jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Forms
alter table public.forms enable row level security;

create policy "Users can read their own form submissions" 
  on public.forms for select 
  using (auth.uid() = user_id);

create policy "Users can insert form submissions (public role)" 
  on public.forms for insert 
  with check (true); -- Visitors can submit forms! RLS allows public inserts.

create policy "Users can delete form submissions" 
  on public.forms for delete 
  using (auth.uid() = user_id);

-- 10. ANALYTICS TABLE
-- Stores website pageviews, visitors, devices
create table if not exists public.analytics (
  id uuid default gen_random_uuid() primary key,
  website_id uuid references public.websites(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  page_url text not null,
  referrer text,
  user_agent text,
  visitor_ip_hash text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Analytics
alter table public.analytics enable row level security;

create policy "Users can read their own analytics" 
  on public.analytics for select 
  using (auth.uid() = user_id);

create policy "Anyone can insert analytics (public page view track)" 
  on public.analytics for insert 
  with check (true);

-- ====================================================================
-- PROFILE SYNC TRIGGER
-- Automatically creates a profile record when a new user registers via Supabase Auth
-- ====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url, credits, tokens_used)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', 'Mpampiasa vaovao'),
    new.raw_user_meta_data->>'avatar_url',
    15.0,
    0
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute on auth.users insert
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
