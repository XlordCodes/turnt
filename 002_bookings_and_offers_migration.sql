-- 4. Create Bookings Table
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    offer_code TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, event_id) -- One booking per user per event
);

-- Set up RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bookings." ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookings." ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings." ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- 5. Create Offer Usage Table
CREATE TABLE public.offer_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    offer_code TEXT NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, offer_code) -- One use per user per offer code
);

-- Set up RLS for offer_usage
ALTER TABLE public.offer_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own offer usage." ON public.offer_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own offer usage." ON public.offer_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
