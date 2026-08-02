ALTER TABLE "profiles"
ADD COLUMN "today_widgets" TEXT[] NOT NULL DEFAULT ARRAY['water', 'movement', 'temperature', 'weight', 'plan']::TEXT[],
ADD COLUMN "today_hidden_widgets" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "today_hidden_date" DATE;
