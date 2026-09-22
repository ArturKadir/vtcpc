CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = uid);
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin');
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE public.builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price_eur numeric(10,2) NOT NULL DEFAULT 0,
  availability text NOT NULL DEFAULT 'made_to_order',
  cpu text NOT NULL DEFAULT '',
  gpu text NOT NULL DEFAULT '',
  ram text NOT NULL DEFAULT '',
  storage text NOT NULL DEFAULT '',
  psu text NOT NULL DEFAULT '',
  pc_case text NOT NULL DEFAULT '',
  image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.builds TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.builds TO authenticated;
GRANT ALL ON public.builds TO service_role;
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published builds are public" ON public.builds FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "Admins read all builds" ON public.builds FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage builds" ON public.builds FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER builds_touch BEFORE UPDATE ON public.builds FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  price_eur numeric(10,2) NOT NULL DEFAULT 0,
  in_stock boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.parts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parts TO authenticated;
GRANT ALL ON public.parts TO service_role;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published parts are public" ON public.parts FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "Admins read all parts" ON public.parts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage parts" ON public.parts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER parts_touch BEFORE UPDATE ON public.parts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  note text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_eur numeric(10,2) NOT NULL DEFAULT 0,
  kind text NOT NULL DEFAULT 'cart',
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.orders TO service_role;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.builds (slug, name, tagline, description, price_eur, availability, cpu, gpu, ram, storage, psu, pc_case, sort_order) VALUES
('vtcpc-start-1','VTCPC Start','Žaidimams 1080p','Puikus pirmasis žaidimų kompiuteris. Sklandžiai sukasi populiariausi žaidimai 1080p raiška.',749.00,'made_to_order','AMD Ryzen 5 5500','NVIDIA RTX 3050 8GB','16GB DDR4 3200MHz','500GB NVMe SSD','550W 80+ Bronze','Micro-ATX, grūdintas stiklas',1),
('vtcpc-start-plus','VTCPC Start+','Daugiau kadrų 1080p','Sustiprinta pradinio lygio versija – aukštesnis kadrų dažnis ir daugiau vietos failams.',865.00,'made_to_order','AMD Ryzen 5 5600','NVIDIA RTX 4060 8GB','16GB DDR4 3600MHz','1TB NVMe SSD','650W 80+ Bronze','Micro-ATX, grūdintas stiklas',2),
('vtcpc-play','VTCPC Play','1440p žaidimams','Subalansuotas kompiuteris 1440p žaidimams ir kūrybiniam darbui.',1190.00,'made_to_order','Intel Core i5-13400F','NVIDIA RTX 4060 Ti 8GB','32GB DDR4 3600MHz','1TB NVMe SSD','650W 80+ Gold','ATX, trys ventiliatoriai',3),
('vtcpc-pro','VTCPC Pro','Galingas 1440p','Mūsų populiariausias vidurinės klasės sprendimas – tinka ir žaidimams, ir montažui.',1700.00,'made_to_order','AMD Ryzen 7 7700','NVIDIA RTX 4070 Super 12GB','32GB DDR5 6000MHz','2TB NVMe SSD','750W 80+ Gold','ATX, oro aušinimas',4),
('vtcpc-creator','VTCPC Creator','Vaizdo montažui','Skirtas vaizdo montažui, 3D ir srautinei transliacijai.',2250.00,'made_to_order','AMD Ryzen 9 7900X','NVIDIA RTX 4070 Ti Super 16GB','64GB DDR5 6000MHz','2TB NVMe SSD + 4TB HDD','850W 80+ Gold','ATX, skysčio aušinimas',5),
('vtcpc-ultra','VTCPC Ultra','4K žaidimams','Be kompromisų: 4K raiška, aukštas kadrų dažnis, tylus aušinimas.',3100.00,'made_to_order','Intel Core i7-14700K','NVIDIA RTX 4080 Super 16GB','64GB DDR5 6400MHz','4TB NVMe SSD','1000W 80+ Gold','ATX, 360mm AIO',6),
('vtcpc-extreme','VTCPC Extreme','Maksimalus našumas','Viskas, ką galima sudėti į vieną korpusą. Surenkama pagal užsakymą.',3950.00,'made_to_order','AMD Ryzen 9 7950X3D','NVIDIA RTX 4090 24GB','64GB DDR5 6400MHz','4TB NVMe SSD','1200W 80+ Platinum','Full tower, 360mm AIO',7),
('vtcpc-office','VTCPC Office','Darbui ir biurui','Tylus, kompaktiškas kompiuteris kasdieniam darbui ir mokslams.',489.00,'made_to_order','Intel Core i3-13100','Integruota Intel UHD 730','16GB DDR4 3200MHz','500GB NVMe SSD','450W 80+ Bronze','Kompaktiškas Mini-ATX',8);

INSERT INTO public.parts (category, name, price_eur, in_stock, sort_order) VALUES
('case','Kompaktiškas Mini-ATX korpusas',59.00,true,1),
('case','Micro-ATX korpusas su stiklu',79.00,true,2),
('case','ATX korpusas, 3 ventiliatoriai',109.00,true,3),
('case','Full tower korpusas',169.00,false,4),
('cpu','Intel Core i3-13100',129.00,true,1),
('cpu','Intel Core i5-13400F',199.00,true,2),
('cpu','Intel Core i7-14700K',399.00,true,3),
('cpu','AMD Ryzen 5 5600',129.00,true,4),
('cpu','AMD Ryzen 7 7700',329.00,true,5),
('cpu','AMD Ryzen 9 7950X3D',649.00,false,6),
('gpu','Be vaizdo plokštės (integruota grafika)',0.00,true,1),
('gpu','NVIDIA RTX 3050 8GB',229.00,true,2),
('gpu','NVIDIA RTX 4060 8GB',319.00,true,3),
('gpu','NVIDIA RTX 4060 Ti 8GB',429.00,true,4),
('gpu','NVIDIA RTX 4070 Super 12GB',649.00,true,5),
('gpu','NVIDIA RTX 4080 Super 16GB',1099.00,false,6),
('ram','16GB DDR4 3200MHz',44.00,true,1),
('ram','32GB DDR4 3600MHz',85.00,true,2),
('ram','32GB DDR5 6000MHz',119.00,true,3),
('ram','64GB DDR5 6400MHz',239.00,true,4),
('storage','500GB NVMe SSD',45.00,true,1),
('storage','1TB NVMe SSD',75.00,true,2),
('storage','2TB NVMe SSD',139.00,true,3),
('storage','4TB NVMe SSD',289.00,false,4),
('psu','450W 80+ Bronze',49.00,true,1),
('psu','650W 80+ Gold',89.00,true,2),
('psu','850W 80+ Gold',129.00,true,3),
('psu','1000W 80+ Gold',169.00,true,4),
('cooling','Standartinis oro aušintuvas',0.00,true,1),
('cooling','Bokštinis oro aušintuvas',39.00,true,2),
('cooling','240mm skysčio aušinimas',89.00,true,3),
('cooling','360mm skysčio aušinimas',129.00,true,4),
('os','Be operacinės sistemos',0.00,true,1),
('os','Windows 11 Home',119.00,true,2),
('os','Windows 11 Pro',159.00,true,3);