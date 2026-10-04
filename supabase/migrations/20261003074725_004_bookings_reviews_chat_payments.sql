/*
# Bookings, Quotations, Reviews, Notifications, Chat, Payments

1. New Tables:
   - `booking_requests` — Customer requests to suppliers
   - `booking_status_history` — Status changes for booking requests
   - `quotations` — Supplier quotations for booking requests
   - `quotation_items` — Line items in quotations
   - `reviews` — Customer reviews of suppliers
   - `notifications` — User notifications
   - `conversations` — Chat conversations between customer and supplier
   - `messages` — Individual chat messages
   - `payments` — Payment records
   - `payment_transactions` — Individual payment transactions
   - `commission_records` — Platform commission records

2. Security:
   - booking_requests: customer & supplier can read their own; customer can create; both can update
   - reviews: public read; customer can create/update/delete only their own
   - notifications: owner-only CRUD
   - conversations/messages: participants can read; participants can send
   - payments: customer & supplier can read their own

3. Notes:
   - Booking statuses: REQUESTED, SUPPLIER_REVIEWING, OFFER_SENT, CUSTOMER_ACCEPTED, PAYMENT_PENDING, CONFIRMED, REJECTED, CANCELLED, COMPLETED
   - Customer cannot directly set status to CONFIRMED (must go through server-side logic in future)
*/

-- Booking Requests
CREATE TABLE IF NOT EXISTS booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE SET NULL,
  event_date date NOT NULL,
  city_id uuid REFERENCES cities(id),
  guest_count int,
  budget numeric(10,2),
  message text,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'supplier_reviewing', 'offer_sent', 'customer_accepted', 'payment_pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customer_read_bookings" ON booking_requests;
CREATE POLICY "customer_read_bookings" ON booking_requests FOR SELECT TO authenticated USING (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = booking_requests.supplier_id AND sp.user_id = auth.uid()));
DROP POLICY IF EXISTS "customer_insert_bookings" ON booking_requests;
CREATE POLICY "customer_insert_bookings" ON booking_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "customer_update_bookings" ON booking_requests;
CREATE POLICY "customer_update_bookings" ON booking_requests FOR UPDATE TO authenticated USING (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = booking_requests.supplier_id AND sp.user_id = auth.uid())) WITH CHECK (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = booking_requests.supplier_id AND sp.user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_booking_requests_customer ON booking_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_supplier ON booking_requests(supplier_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);

-- Booking Status History
CREATE TABLE IF NOT EXISTS booking_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id uuid NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES profiles(id),
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "participants_read_history" ON booking_status_history;
CREATE POLICY "participants_read_history" ON booking_status_history FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM booking_requests br WHERE br.id = booking_status_history.booking_request_id AND br.customer_id = auth.uid()) OR EXISTS (SELECT 1 FROM booking_requests br JOIN supplier_profiles sp ON sp.id = br.supplier_id WHERE br.id = booking_status_history.booking_request_id AND sp.user_id = auth.uid()));

-- Quotations
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id uuid NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description text,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  required_deposit numeric(10,2) NOT NULL DEFAULT 0,
  expiration_date date,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'rejected', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "participants_read_quotations" ON quotations;
CREATE POLICY "participants_read_quotations" ON quotations FOR SELECT TO authenticated USING (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = quotations.supplier_id AND sp.user_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_quotations_booking ON quotations(booking_request_id);

-- Quotation Items
CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "participants_read_quotation_items" ON quotation_items;
CREATE POLICY "participants_read_quotation_items" ON quotation_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM quotations q WHERE q.id = quotation_items.quotation_id AND q.customer_id = auth.uid()) OR EXISTS (SELECT 1 FROM quotations q JOIN supplier_profiles sp ON sp.id = q.supplier_id WHERE q.id = quotation_items.quotation_id AND sp.user_id = auth.uid()));

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  booking_request_id uuid REFERENCES booking_requests(id) ON DELETE SET NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified boolean NOT NULL DEFAULT false,
  customer_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_reviews" ON reviews;
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "customer_insert_review" ON reviews;
CREATE POLICY "customer_insert_review" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "customer_update_own_review" ON reviews;
CREATE POLICY "customer_update_own_review" ON reviews FOR UPDATE TO authenticated USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);
DROP POLICY IF EXISTS "customer_delete_own_review" ON reviews;
CREATE POLICY "customer_delete_own_review" ON reviews FOR DELETE TO authenticated USING (auth.uid() = customer_id);

CREATE INDEX IF NOT EXISTS idx_reviews_supplier ON reviews(supplier_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title_he text,
  title_ar text,
  body_he text,
  body_ar text,
  data jsonb,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "owner_read_notifications" ON notifications;
CREATE POLICY "owner_read_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_update_notifications" ON notifications;
CREATE POLICY "owner_update_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_delete_notifications" ON notifications;
CREATE POLICY "owner_delete_notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  booking_request_id uuid REFERENCES booking_requests(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(customer_id, supplier_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "participants_read_conversations" ON conversations;
CREATE POLICY "participants_read_conversations" ON conversations FOR SELECT TO authenticated USING (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = conversations.supplier_id AND sp.user_id = auth.uid()));

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "participants_read_messages" ON messages;
CREATE POLICY "participants_read_messages" ON messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.customer_id = auth.uid()) OR EXISTS (SELECT 1 FROM conversations c JOIN supplier_profiles sp ON sp.id = c.supplier_id WHERE c.id = messages.conversation_id AND sp.user_id = auth.uid()));
DROP POLICY IF EXISTS "participants_insert_messages" ON messages;
CREATE POLICY "participants_insert_messages" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.customer_id = auth.uid()) OR EXISTS (SELECT 1 FROM conversations c JOIN supplier_profiles sp ON sp.id = c.supplier_id WHERE c.id = messages.conversation_id AND sp.user_id = auth.uid())));

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id uuid NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  payment_type text NOT NULL CHECK (payment_type IN ('deposit', 'final', 'full')),
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "customer_read_payments" ON payments;
CREATE POLICY "customer_read_payments" ON payments FOR SELECT TO authenticated USING (auth.uid() = customer_id OR EXISTS (SELECT 1 FROM supplier_profiles sp WHERE sp.id = payments.supplier_id AND sp.user_id = auth.uid()));

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  provider text,
  provider_transaction_id text,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "participants_read_txns" ON payment_transactions;
CREATE POLICY "participants_read_txns" ON payment_transactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM payments p WHERE p.id = payment_transactions.payment_id AND p.customer_id = auth.uid()) OR EXISTS (SELECT 1 FROM payments p JOIN supplier_profiles sp ON sp.id = p.supplier_id WHERE p.id = payment_transactions.payment_id AND sp.user_id = auth.uid()));

-- Commission Records
CREATE TABLE IF NOT EXISTS commission_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_request_id uuid NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  commission_rate numeric(5,2) NOT NULL DEFAULT 0,
  commission_amount numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_commissions" ON commission_records;
CREATE POLICY "admin_read_commissions" ON commission_records FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));