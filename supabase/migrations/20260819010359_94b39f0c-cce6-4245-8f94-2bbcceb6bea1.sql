CREATE TABLE public.support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  topic text,
  message text NOT NULL,
  screenshot_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.support_requests TO anon, authenticated;
GRANT SELECT ON public.support_requests TO authenticated;
GRANT ALL ON public.support_requests TO service_role;

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can send a support request"
  ON public.support_requests FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(message) BETWEEN 1 AND 4000 AND char_length(email) <= 255);

CREATE POLICY "People can read their own support requests"
  ON public.support_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can upload a support screenshot"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'support-screenshots');