/*
  # Create orders and order_items tables

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `status` (text)
      - `total` (numeric)
      - `shipping_address` (text)
      - `created_at` (timestamp with time zone)
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `price` (numeric)
  2. Security
    - Enable RLS on both tables
    - Add policies for users to read their own orders
    - Add policies for admin users to read all orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  status text DEFAULT 'pending',
  total numeric NOT NULL,
  shipping_address text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for orders
CREATE POLICY "Users can read their own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin users can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@polos-sales.com');

-- Policies for order_items
CREATE POLICY "Users can read their own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admin users can read all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@polos-sales.com');