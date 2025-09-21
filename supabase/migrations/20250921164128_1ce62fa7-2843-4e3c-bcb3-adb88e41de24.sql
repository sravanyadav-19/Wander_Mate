-- Fix security warning: Update function with proper search_path
CREATE OR REPLACE FUNCTION public.update_user_statistics_on_trip()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;