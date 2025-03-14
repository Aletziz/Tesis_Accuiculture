/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `price` (numeric, not null)
      - `description` (text)
      - `image` (text)
      - `category` (text)
      - `rating` (numeric)
      - `stock` (integer)
      - `created_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `products` table
    - Add policy for authenticated users to read all products
    - Add policy for admin users to insert, update, delete products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  description text,
  image text,
  category text,
  rating numeric DEFAULT 0,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Admin users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'admin@polos-sales.com');

CREATE POLICY "Admin users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@polos-sales.com');

CREATE POLICY "Admin users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin@polos-sales.com');