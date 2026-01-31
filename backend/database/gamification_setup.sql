-- Add Gamification Columns to Profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL, -- Ionicons name
  xp_reward INTEGER DEFAULT 100,
  condition_type TEXT NOT NULL, -- 'streak', 'total_workouts', 'weight_goal'
  condition_value INTEGER NOT NULL
);

-- Create User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Initial Achievements Data
INSERT INTO achievements (name, description, icon, xp_reward, condition_type, condition_value) VALUES
('Novato Cibernético', 'Completa tu primer entrenamiento', 'fitness', 100, 'total_workouts', 1),
('Guerrero de Neón', 'Alcanza una racha de 3 días', 'flame', 300, 'streak', 3),
('Hacker de Calorías', 'Registra 10 comidas', 'nutrition', 200, 'total_meals', 10),
('Titanio Puro', 'Levanta 1000kg en total', 'barbell', 500, 'total_volume', 1000);
