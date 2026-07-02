-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. Create custom user profiles table extending Supabase Auth
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    whatsapp_number TEXT NOT NULL,
    instagram_handle TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles." ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile." ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update own profile (non-role fields only)
CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user');

-- 2. Create Events Table
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    reg_link TEXT NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    venue TEXT NOT NULL,
    ticket_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up RLS for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone." ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert events." ON public.events
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update events." ON public.events
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete events." ON public.events
  FOR DELETE USING (public.is_admin());

-- 3. Create Event Interests Table (RSVPs)
CREATE TABLE public.event_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, event_id) -- Prevents a user from marking interested twice on the same event
);

-- Set up RLS for event interests
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own interests." ON public.event_interests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own interests." ON public.event_interests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interests." ON public.event_interests FOR DELETE USING (auth.uid() = user_id);
