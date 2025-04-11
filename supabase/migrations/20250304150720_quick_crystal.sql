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



create table admins (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  password text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insertar el usuario administrador
insert into admins (username, password) values ('admin', 'tesis2024');