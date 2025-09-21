-- Create achievements table for gamification
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  requirement_type TEXT NOT NULL, -- 'distance', 'trips_count', 'places_visited', 'special'
  requirement_value INTEGER,
  badge_color TEXT NOT NULL DEFAULT 'primary',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Create user statistics table for tracking progress
CREATE TABLE public.user_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_distance NUMERIC DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  places_visited INTEGER DEFAULT 0,
  countries_visited INTEGER DEFAULT 0,
  longest_trip_distance NUMERIC DEFAULT 0,
  total_trip_duration INTEGER DEFAULT 0, -- in minutes
  favorite_travel_mode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Achievements policies (public read, no write for users)
CREATE POLICY "Anyone can view achievements" 
ON public.achievements 
FOR SELECT 
USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON public.user_achievements 
FOR UPDATE 
USING (auth.uid() = user_id);

-- User statistics policies
CREATE POLICY "Users can view their own statistics" 
ON public.user_statistics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" 
ON public.user_statistics 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" 
ON public.user_statistics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_statistics_updated_at
BEFORE UPDATE ON public.user_statistics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, badge_color) VALUES
('First Journey', 'Complete your first trip', 'MapPin', 'trips', 'trips_count', 1, 'primary'),
('Explorer', 'Complete 5 trips', 'Compass', 'trips', 'trips_count', 5, 'secondary'),
('Adventurer', 'Complete 25 trips', 'Mountain', 'trips', 'trips_count', 25, 'accent'),
('Travel Master', 'Complete 100 trips', 'Crown', 'trips', 'trips_count', 100, 'primary'),
('Short Distance', 'Travel 10km total', 'Footprints', 'distance', 'distance', 10, 'muted'),
('City Explorer', 'Travel 100km total', 'Building', 'distance', 'distance', 100, 'secondary'),
('Road Warrior', 'Travel 1000km total', 'Car', 'distance', 'distance', 1000, 'accent'),
('Globe Trotter', 'Travel 10000km total', 'Globe', 'distance', 'distance', 10000, 'primary'),
('Social Butterfly', 'Share your first trip', 'Share', 'social', 'special', 1, 'secondary'),
('Memory Keeper', 'Add photos to 10 trips', 'Camera', 'photos', 'special', 10, 'accent'),
('Place Collector', 'Save 20 favorite places', 'Heart', 'favorites', 'special', 20, 'muted'),
('Speed Demon', 'Complete a trip in under 5 minutes', 'Zap', 'special', 'special', 5, 'accent');

-- Function to update user statistics when trip is completed
CREATE OR REPLACE FUNCTION public.update_user_statistics_on_trip()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user statistics
  INSERT INTO public.user_statistics (
    user_id, 
    total_distance, 
    total_trips,
    longest_trip_distance,
    total_trip_duration
  ) VALUES (
    NEW.user_id,
    COALESCE(NEW.distance, 0),
    1,
    COALESCE(NEW.distance, 0),
    COALESCE(NEW.duration, 0)
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    total_distance = user_statistics.total_distance + COALESCE(NEW.distance, 0),
    total_trips = user_statistics.total_trips + 1,
    longest_trip_distance = GREATEST(user_statistics.longest_trip_distance, COALESCE(NEW.distance, 0)),
    total_trip_duration = user_statistics.total_trip_duration + COALESCE(NEW.duration, 0),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for trip completion
CREATE TRIGGER update_stats_on_trip_complete
AFTER INSERT ON public.trips
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION public.update_user_statistics_on_trip();