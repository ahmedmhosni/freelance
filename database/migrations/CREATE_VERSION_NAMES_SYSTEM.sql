-- Create version names table for managing coffee-themed names
CREATE TABLE IF NOT EXISTS version_names (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  name_type VARCHAR(20) NOT NULL, -- 'minor' or 'major'
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_version_names_type ON version_names(name_type, sort_order);
CREATE INDEX IF NOT EXISTS idx_version_names_active ON version_names(is_active, name_type);

-- Insert default minor names (coffee roasting levels)
INSERT INTO version_names (name, name_type, sort_order, description) VALUES
('Nordic', 'minor', 1, 'Lightest roast - very light brown'),
('Blonde', 'minor', 2, 'Light roast with mild flavor'),
('Cinnamon', 'minor', 3, 'Light brown, cinnamon color'),
('New England', 'minor', 4, 'Light-medium roast'),
('Light City', 'minor', 5, 'Light brown, American style'),
('City', 'minor', 6, 'Medium brown, standard roast'),
('Breakfast Roast', 'minor', 7, 'Popular morning roast'),
('American Roast', 'minor', 8, 'Medium roast, balanced'),
('Medium Roast', 'minor', 9, 'Classic medium brown'),
('House Roast', 'minor', 10, 'Café standard roast'),
('Full City', 'minor', 11, 'Medium-dark roast'),
('Full City+', 'minor', 12, 'Darker medium roast'),
('Vienna', 'minor', 13, 'Dark roast, European style'),
('French Roast', 'minor', 14, 'Very dark, bold flavor'),
('Italian Roast', 'minor', 15, 'Nearly black, intense'),
('Espresso Roast', 'minor', 16, 'Dark, for espresso'),
('Dark Roast', 'minor', 17, 'Darkest roast level')
ON CONFLICT (name) DO NOTHING;

-- Insert default major names (specialty coffee drinks)
INSERT INTO version_names (name, name_type, sort_order, description) VALUES
('Espresso', 'major', 1, 'Pure concentrated coffee'),
('Ristretto', 'major', 2, 'Short shot espresso'),
('Lungo', 'major', 3, 'Long shot espresso'),
('Doppio', 'major', 4, 'Double espresso'),
('Americano', 'major', 5, 'Espresso with hot water'),
('Long Black', 'major', 6, 'Water then espresso'),
('Macchiato', 'major', 7, 'Espresso with foam'),
('Cortado', 'major', 8, 'Espresso with warm milk'),
('Piccolo', 'major', 9, 'Small latte'),
('Cappuccino', 'major', 10, 'Espresso, milk, foam'),
('Flat White', 'major', 11, 'Espresso with microfoam'),
('Latte', 'major', 12, 'Espresso with steamed milk'),
('Mocha', 'major', 13, 'Latte with chocolate'),
('Caffè Latte', 'major', 14, 'Italian style latte'),
('Caffè au Lait', 'major', 15, 'French coffee with milk'),
('Caffè Crème', 'major', 16, 'Swiss coffee with cream'),
('Affogato', 'major', 17, 'Espresso over ice cream'),
('Cold Brew', 'major', 18, 'Cold steeped coffee'),
('Nitro Cold Brew', 'major', 19, 'Nitrogen-infused cold brew'),
('Iced Americano', 'major', 20, 'Cold americano'),
('Iced Latte', 'major', 21, 'Cold latte'),
('Iced Mocha', 'major', 22, 'Cold mocha'),
('Frappé', 'major', 23, 'Blended iced coffee'),
('Red Eye', 'major', 24, 'Coffee with espresso shot'),
('Irish Coffee', 'major', 25, 'Coffee with whiskey'),
('Turkish Coffee', 'major', 26, 'Unfiltered strong coffee'),
('Vietnamese Coffee', 'major', 27, 'Coffee with condensed milk'),
('Café Cubano', 'major', 28, 'Sweet Cuban espresso'),
('Cortadito', 'major', 29, 'Cuban cortado')
ON CONFLICT (name) DO NOTHING;
