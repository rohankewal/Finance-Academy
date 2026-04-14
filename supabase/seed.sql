-- Finance Academy — badges seed
-- Run after migration to populate the badges catalog

insert into public.badges (slug, name, description, emoji, criteria_type, criteria_value, display_order) values
  ('first-lesson',         'First Step',                'Complete your first lesson',                              '🌱', 'lessons_completed', '1',    1),
  ('five-lessons',         'Getting Started',           'Complete 5 lessons',                                      '📚', 'lessons_completed', '5',    2),
  ('ten-lessons',          'Committed',                 'Complete 10 lessons',                                     '🎯', 'lessons_completed', '10',   3),
  ('all-lessons',          'Finance Academy Graduate',  'Complete every lesson on the platform',                   '🎓', 'lessons_completed', '11',   4),
  ('money-basics-complete','Money Mastered',            'Finish the entire Money Basics track',                    '💰', 'track_completed',   'money-basics',              5),
  ('debt-101-complete',    'Debt Destroyer',            'Finish the entire Debt 101 track',                        '⛓️', 'track_completed',   'debt-101',                  6),
  ('investing-complete',   'Future Millionaire',        'Finish the entire Investing Fundamentals track',          '📈', 'track_completed',   'investing-fundamentals',    7),
  ('calculator-curious',   'Number Cruncher',           'Use all 5 calculators at least once',                     '🧮', 'all_calculators',   'true',                      8),
  ('week-streak',          'On Fire',                   'Maintain a 7-day learning streak',                        '🔥', 'streak',            '7',    9),
  ('month-streak',         'Unstoppable',               'Maintain a 30-day learning streak',                       '🚀', 'streak',            '30',   10),
  ('hundred-streak',       'Legendary',                 'Maintain a 100-day learning streak',                      '👑', 'streak',            '100',  11),
  ('quick-learner',        'Quick Learner',             'Pass 5 lesson quizzes on your first try',                 '⚡', 'quiz_streak',       '5',    12),
  ('first-thousand',       'First Thousand',            'Earn 1,000 total XP',                                     '💵', 'xp_threshold',      '1000', 13)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  emoji = excluded.emoji,
  criteria_type = excluded.criteria_type,
  criteria_value = excluded.criteria_value,
  display_order = excluded.display_order;
