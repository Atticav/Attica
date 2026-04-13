-- =============================================
-- MIGRATION 006: Add upload image/video URL columns
-- =============================================

-- Add image_url to strategic_sections for illustrative images
ALTER TABLE public.strategic_sections
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add photo_url to restaurants for restaurant photos
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add image_url to cultural_info for illustrative images
ALTER TABLE public.cultural_info
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add video_url to photography_tips for video links/uploads
ALTER TABLE public.photography_tips
  ADD COLUMN IF NOT EXISTS video_url TEXT;
