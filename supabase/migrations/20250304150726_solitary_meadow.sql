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

create table content (
  id uuid default uuid_generate_v4() primary key,
  page_id text not null,
  title text,
  content text,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insertar las secciones iniciales
insert into content (page_id, title, description) values
  ('introduccion', 'Introducción', 'Fundamentos y Marco Teórico'),
  ('capitulo1', 'Generalidades', 'Fundamentos y conceptos básicos'),
  ('capitulo2', 'Diversidad Biológica', 'Análisis de la biodiversidad del área'),
  ('capitulo3', 'Ecosistemas Terrestres', 'Estudio de los ecosistemas y su dinámica'),
  ('capitulo4', 'Cambio Climático', 'Impacto y adaptación al cambio climático'),
  ('capitulo5', 'Tradiciones', 'Aspectos culturales y tradicionales de la región'),
  ('capitulo6', 'CBC', 'Conservación Basada en Comunidades');