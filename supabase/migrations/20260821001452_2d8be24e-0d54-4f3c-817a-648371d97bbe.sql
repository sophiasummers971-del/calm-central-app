CREATE TYPE public.support_status AS ENUM ('open','in_progress','resolved');

ALTER TABLE public.support_requests
  ADD COLUMN status public.support_status NOT NULL DEFAULT 'open',
  ADD COLUMN resolver_notes text,
  ADD COLUMN resolved_at timestamptz,
  ADD COLUMN updated_by uuid;

CREATE POLICY "Admins can update support requests"
ON public.support_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));