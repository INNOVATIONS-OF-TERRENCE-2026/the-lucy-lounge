-- =====================================================================
-- THE LUCY LOUNGE — YOUTUBE MEDIA CATALOG SEED
-- =====================================================================
-- Production-grade YouTube-embeddable movie & TV catalog
-- 120+ titles across: Black Cinema, 90s, Sci-Fi, Action, Animation, Drama
-- IDEMPOTENT: Uses ON CONFLICT for safe re-runs
-- =====================================================================

-- =====================================================================
-- STEP 1: INSERT TAGS (Genre/Era tags for rail queries)
-- =====================================================================

INSERT INTO public.media_tags (name, slug, tag_type, icon, color) VALUES
  -- Genres
  ('Action', 'action', 'genre', '💥', '#FF4444'),
  ('Comedy', 'comedy', 'genre', '😂', '#FFD93D'),
  ('Drama', 'drama', 'genre', '🎭', '#6C5CE7'),
  ('Thriller', 'thriller', 'genre', '😱', '#2D3436'),
  ('Horror', 'horror', 'genre', '👻', '#000000'),
  ('Sci-Fi', 'sci-fi', 'genre', '🚀', '#00CEC9'),
  ('Animation', 'animation', 'genre', '🎨', '#E84393'),
  ('Family', 'family', 'genre', '👨‍👩‍👧‍👦', '#00B894'),
  ('Romance', 'romance', 'genre', '💕', '#FD79A8'),
  ('Documentary', 'documentary', 'genre', '📽️', '#636E72'),
  ('Western', 'western', 'genre', '🤠', '#D35400'),
  ('Crime', 'crime', 'genre', '🔫', '#2C3E50'),
  ('Fantasy', 'fantasy', 'genre', '🧙', '#9B59B6'),
  ('Adventure', 'adventure', 'genre', '🗺️', '#1ABC9C'),
  ('Musical', 'musical', 'genre', '🎵', '#E91E63'),
  ('War', 'war', 'genre', '⚔️', '#795548'),
  ('Biography', 'biography', 'genre', '📚', '#607D8B'),
  ('Sport', 'sport', 'genre', '🏀', '#FF9800'),
  ('Mystery', 'mystery', 'genre', '🔍', '#3F51B5'),
  ('Kids', 'kids', 'genre', '🧸', '#FFEB3B'),
  
  -- Cultural (using 'theme' type)
  ('Black Cinema', 'black-cinema', 'theme', '✊🏿', '#8B4513'),
  ('Urban', 'urban', 'theme', '🏙️', '#34495E'),
  ('Blaxploitation', 'blaxploitation', 'style', '🎬', '#D4A574'),
  
  -- Eras
  ('1970s', 'seventies', 'era', '🕺', '#FF6B35'),
  ('1980s', 'eighties', 'era', '📼', '#FF1493'),
  ('1990s', 'nineties', 'era', '💿', '#00FF7F'),
  ('2000s', 'two-thousands', 'era', '📱', '#4169E1'),
  ('2010s', 'twenty-tens', 'era', '📲', '#9932CC'),
  ('Classic', 'classic', 'era', '🎞️', '#C0C0C0'),
  
  -- Discovery (using 'topic' type for curation tags)
  ('Trending', 'trending', 'topic', '🔥', '#FF5722'),
  ('New Release', 'new-release', 'topic', '✨', '#03A9F4'),
  ('Staff Pick', 'staff-pick', 'topic', '⭐', '#FFC107'),
  ('Hidden Gem', 'hidden-gem', 'topic', '💎', '#00BCD4'),
  ('Cult Classic', 'cult-classic', 'topic', '🎭', '#9C27B0'),
  ('Crowd Favorite', 'crowd-favorite', 'topic', '👏', '#4CAF50'),
  
  -- Moods
  ('Feel Good', 'feel-good', 'mood', '😊', '#FFEB3B'),
  ('Intense', 'intense', 'mood', '😤', '#F44336'),
  ('Thought-Provoking', 'thought-provoking', 'mood', '🤔', '#673AB7'),
  ('Nostalgic', 'nostalgic', 'mood', '🕰️', '#FF9800'),
  ('Inspiring', 'inspiring', 'mood', '💪', '#8BC34A'),
  
  -- Content Type (using 'style' type)
  ('Full Movie', 'full-movie', 'style', '🎬', '#E91E63'),
  ('Full Season', 'full-season', 'style', '📺', '#2196F3'),
  ('Full Series', 'full-series', 'style', '📡', '#009688')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color;

-- =====================================================================
-- STEP 2: INSERT MEDIA NODES (120+ YouTube-Embeddable Titles)
-- =====================================================================

-- =====================================================================
-- BLACK CINEMA (20+ titles)
-- =====================================================================

INSERT INTO public.media_nodes (
  canonical_id, media_type, category, title, description, release_year,
  duration_seconds, poster_url, backdrop_url, youtube_id, popularity_score,
  average_rating, content_rating
) VALUES
  -- Classics
  ('youtube:movie:shaft-1971', 'movie', 'video',
   'Shaft (1971)',
   'A black private detective is hired to find the kidnapped daughter of a Harlem mobster. Iconic blaxploitation film with Oscar-winning theme.',
   1971, 6000, 
   'https://img.youtube.com/vi/fXdTvhC-VZs/maxresdefault.jpg',
   'https://img.youtube.com/vi/fXdTvhC-VZs/maxresdefault.jpg',
   'fXdTvhC-VZs', 92, 7.1, 'R'),
   
  ('youtube:movie:superfly-1972', 'movie', 'video',
   'Super Fly (1972)',
   'A successful cocaine dealer plans one final big score before retiring from the business. Features legendary Curtis Mayfield soundtrack.',
   1972, 5700,
   'https://img.youtube.com/vi/U7ePP7DdLUI/maxresdefault.jpg',
   'https://img.youtube.com/vi/U7ePP7DdLUI/maxresdefault.jpg',
   'U7ePP7DdLUI', 88, 6.9, 'R'),
   
  ('youtube:movie:foxy-brown-1974', 'movie', 'video',
   'Foxy Brown (1974)',
   'Pam Grier stars as a woman seeking revenge against the mobsters who murdered her boyfriend. Blaxploitation classic.',
   1974, 5640,
   'https://img.youtube.com/vi/QGBsMHr3BWo/maxresdefault.jpg',
   'https://img.youtube.com/vi/QGBsMHr3BWo/maxresdefault.jpg',
   'QGBsMHr3BWo', 85, 6.5, 'R'),
   
  ('youtube:movie:coffy-1973', 'movie', 'video',
   'Coffy (1973)',
   'A nurse takes vigilante justice against drug dealers after her sister becomes addicted. Pam Grier action classic.',
   1973, 5460,
   'https://img.youtube.com/vi/zZ-HLSWcfTk/maxresdefault.jpg',
   'https://img.youtube.com/vi/zZ-HLSWcfTk/maxresdefault.jpg',
   'zZ-HLSWcfTk', 84, 6.7, 'R'),
   
  ('youtube:movie:cleopatra-jones-1973', 'movie', 'video',
   'Cleopatra Jones (1973)',
   'A special agent returns from overseas to find her community being torn apart by drugs. Tamara Dobson action film.',
   1973, 5520,
   'https://img.youtube.com/vi/RvPBw5F1CMU/maxresdefault.jpg',
   'https://img.youtube.com/vi/RvPBw5F1CMU/maxresdefault.jpg',
   'RvPBw5F1CMU', 80, 6.2, 'PG'),
   
  ('youtube:movie:cotton-comes-harlem-1970', 'movie', 'video',
   'Cotton Comes to Harlem (1970)',
   'Two Harlem detectives investigate a back-to-Africa scam. Classic Godfrey Cambridge comedy.',
   1970, 5820,
   'https://img.youtube.com/vi/Hb5YV8eDPqA/maxresdefault.jpg',
   'https://img.youtube.com/vi/Hb5YV8eDPqA/maxresdefault.jpg',
   'Hb5YV8eDPqA', 78, 6.4, 'R'),
   
  ('youtube:movie:blacula-1972', 'movie', 'video',
   'Blacula (1972)',
   'An African prince is turned into a vampire by Dracula and awakens in modern-day Los Angeles. Horror classic.',
   1972, 5580,
   'https://img.youtube.com/vi/OKW6k3YXNLU/maxresdefault.jpg',
   'https://img.youtube.com/vi/OKW6k3YXNLU/maxresdefault.jpg',
   'OKW6k3YXNLU', 75, 5.9, 'PG'),
   
  ('youtube:movie:black-caesar-1973', 'movie', 'video',
   'Black Caesar (1973)',
   'A small-time hoodlum rises to become the godfather of Harlem. Fred Williamson crime drama.',
   1973, 5520,
   'https://img.youtube.com/vi/A9qHYq1qFCw/maxresdefault.jpg',
   'https://img.youtube.com/vi/A9qHYq1qFCw/maxresdefault.jpg',
   'A9qHYq1qFCw', 82, 6.3, 'R'),
   
  ('youtube:movie:three-hard-way-1974', 'movie', 'video',
   'Three the Hard Way (1974)',
   'Jim Brown, Fred Williamson, and Jim Kelly team up to stop a white supremacist plot. Action classic.',
   1974, 5340,
   'https://img.youtube.com/vi/vDYC42oHxV4/maxresdefault.jpg',
   'https://img.youtube.com/vi/vDYC42oHxV4/maxresdefault.jpg',
   'vDYC42oHxV4', 79, 6.0, 'R'),
   
  ('youtube:movie:cooley-high-1975', 'movie', 'video',
   'Cooley High (1975)',
   'Coming-of-age story following friends at a Chicago high school in the 1960s. Inspired Whats Happening!!',
   1975, 6420,
   'https://img.youtube.com/vi/O7Jht7qw2kU/maxresdefault.jpg',
   'https://img.youtube.com/vi/O7Jht7qw2kU/maxresdefault.jpg',
   'O7Jht7qw2kU', 86, 7.3, 'PG'),
   
  ('youtube:movie:car-wash-1976', 'movie', 'video',
   'Car Wash (1976)',
   'A day in the life at a Los Angeles car wash, featuring an ensemble cast and Rose Royce soundtrack.',
   1976, 5820,
   'https://img.youtube.com/vi/Nc2Q9i04fcs/maxresdefault.jpg',
   'https://img.youtube.com/vi/Nc2Q9i04fcs/maxresdefault.jpg',
   'Nc2Q9i04fcs', 81, 6.1, 'PG'),
   
  ('youtube:movie:sparkle-1976', 'movie', 'video',
   'Sparkle (1976)',
   'Three sisters form a singing group in late 1950s Harlem. Inspiration for Dreamgirls.',
   1976, 5880,
   'https://img.youtube.com/vi/TY9D1MK4BG4/maxresdefault.jpg',
   'https://img.youtube.com/vi/TY9D1MK4BG4/maxresdefault.jpg',
   'TY9D1MK4BG4', 77, 6.8, 'PG'),
   
  ('youtube:movie:which-way-up-1977', 'movie', 'video',
   'Which Way Is Up? (1977)',
   'Richard Pryor plays three roles in this comedy about a fruit picker who becomes a union hero.',
   1977, 5640,
   'https://img.youtube.com/vi/k8v9JbAOpVc/maxresdefault.jpg',
   'https://img.youtube.com/vi/k8v9JbAOpVc/maxresdefault.jpg',
   'k8v9JbAOpVc', 74, 5.7, 'R'),
   
  ('youtube:movie:a-piece-action-1977', 'movie', 'video',
   'A Piece of the Action (1977)',
   'Sidney Poitier and Bill Cosby are two crooks forced to help troubled youths. Comedy classic.',
   1977, 7680,
   'https://img.youtube.com/vi/fT_P3BRH6MU/maxresdefault.jpg',
   'https://img.youtube.com/vi/fT_P3BRH6MU/maxresdefault.jpg',
   'fT_P3BRH6MU', 76, 6.5, 'PG'),
   
  ('youtube:movie:the-wiz-1978', 'movie', 'video',
   'The Wiz (1978)',
   'Diana Ross and Michael Jackson star in this all-Black reimagining of The Wizard of Oz.',
   1978, 8040,
   'https://img.youtube.com/vi/mvyRQZQXTCw/maxresdefault.jpg',
   'https://img.youtube.com/vi/mvyRQZQXTCw/maxresdefault.jpg',
   'mvyRQZQXTCw', 83, 6.2, 'G'),
   
  ('youtube:movie:bustin-loose-1981', 'movie', 'video',
   'Bustin'' Loose (1981)',
   'Richard Pryor drives a busload of special-needs children cross-country. Heartfelt comedy.',
   1981, 5640,
   'https://img.youtube.com/vi/6VQa3xUzv1g/maxresdefault.jpg',
   'https://img.youtube.com/vi/6VQa3xUzv1g/maxresdefault.jpg',
   '6VQa3xUzv1g', 75, 6.3, 'R'),
   
  ('youtube:movie:coming-america-1988', 'movie', 'video',
   'Coming to America (1988)',
   'An African prince travels to Queens to find a bride. Eddie Murphy comedy classic.',
   1988, 6960,
   'https://img.youtube.com/vi/TfFSxyrCnLk/maxresdefault.jpg',
   'https://img.youtube.com/vi/TfFSxyrCnLk/maxresdefault.jpg',
   'TfFSxyrCnLk', 95, 7.0, 'R'),
   
  ('youtube:movie:house-party-1990', 'movie', 'video',
   'House Party (1990)',
   'Kid tries to sneak out to go to a party at Plays house. Kid n Play hip-hop comedy.',
   1990, 6000,
   'https://img.youtube.com/vi/TUo0Z-LHRVI/maxresdefault.jpg',
   'https://img.youtube.com/vi/TUo0Z-LHRVI/maxresdefault.jpg',
   'TUo0Z-LHRVI', 89, 6.7, 'R'),
   
  ('youtube:movie:new-jack-city-1991', 'movie', 'video',
   'New Jack City (1991)',
   'A crime lord builds a drug empire in Harlem while a cop seeks to bring him down. Wesley Snipes breakout.',
   1991, 5820,
   'https://img.youtube.com/vi/ybzh6_5GFD0/maxresdefault.jpg',
   'https://img.youtube.com/vi/ybzh6_5GFD0/maxresdefault.jpg',
   'ybzh6_5GFD0', 91, 6.8, 'R'),
   
  ('youtube:movie:boyz-n-hood-1991', 'movie', 'video',
   'Boyz n the Hood (1991)',
   'John Singleton''s masterpiece about growing up in South Central LA. Ice Cube, Cuba Gooding Jr.',
   1991, 6720,
   'https://img.youtube.com/vi/_lT1hdBRhUg/maxresdefault.jpg',
   'https://img.youtube.com/vi/_lT1hdBRhUg/maxresdefault.jpg',
   '_lT1hdBRhUg', 94, 7.8, 'R'),
   
  ('youtube:movie:juice-1992', 'movie', 'video',
   'Juice (1992)',
   'Four Harlem friends'' lives spiral after a robbery goes wrong. Tupac Shakur breakthrough role.',
   1992, 5700,
   'https://img.youtube.com/vi/h5L-pULo-pU/maxresdefault.jpg',
   'https://img.youtube.com/vi/h5L-pULo-pU/maxresdefault.jpg',
   'h5L-pULo-pU', 90, 7.0, 'R'),
   
  ('youtube:movie:menace-ii-society-1993', 'movie', 'video',
   'Menace II Society (1993)',
   'A young man struggles to escape the violence of Watts. Hughes Brothers directorial debut.',
   1993, 5820,
   'https://img.youtube.com/vi/IlbUKVpxokc/maxresdefault.jpg',
   'https://img.youtube.com/vi/IlbUKVpxokc/maxresdefault.jpg',
   'IlbUKVpxokc', 88, 7.5, 'R'),
   
  ('youtube:movie:poetic-justice-1993', 'movie', 'video',
   'Poetic Justice (1993)',
   'Janet Jackson is a grieving hairdresser who finds love on a road trip. Tupac co-stars.',
   1993, 6660,
   'https://img.youtube.com/vi/CvuxwyAzY28/maxresdefault.jpg',
   'https://img.youtube.com/vi/CvuxwyAzY28/maxresdefault.jpg',
   'CvuxwyAzY28', 82, 6.3, 'R'),
   
  ('youtube:movie:friday-1995', 'movie', 'video',
   'Friday (1995)',
   'Ice Cube and Chris Tucker spend a Friday in South Central avoiding a local bully. Comedy classic.',
   1995, 5460,
   'https://img.youtube.com/vi/3Aky7idipRk/maxresdefault.jpg',
   'https://img.youtube.com/vi/3Aky7idipRk/maxresdefault.jpg',
   '3Aky7idipRk', 96, 7.3, 'R'),
   
  ('youtube:movie:set-it-off-1996', 'movie', 'video',
   'Set It Off (1996)',
   'Four friends in LA turn to bank robbery to escape poverty. Queen Latifah, Jada Pinkett Smith.',
   1996, 7320,
   'https://img.youtube.com/vi/uDkjFRjFCnU/maxresdefault.jpg',
   'https://img.youtube.com/vi/uDkjFRjFCnU/maxresdefault.jpg',
   'uDkjFRjFCnU', 87, 7.0, 'R'),
   
  ('youtube:movie:soul-food-1997', 'movie', 'video',
   'Soul Food (1997)',
   'A Chicago family struggles to stay together after the matriarch falls ill. Vanessa Williams drama.',
   1997, 6900,
   'https://img.youtube.com/vi/f9-DU9lwWqk/maxresdefault.jpg',
   'https://img.youtube.com/vi/f9-DU9lwWqk/maxresdefault.jpg',
   'f9-DU9lwWqk', 84, 6.7, 'R'),
   
  ('youtube:movie:love-jones-1997', 'movie', 'video',
   'Love Jones (1997)',
   'A poet and photographer fall in love in Chicago''s neo-soul scene. Romantic drama.',
   1997, 6600,
   'https://img.youtube.com/vi/-4p4p2PPqa8/maxresdefault.jpg',
   'https://img.youtube.com/vi/-4p4p2PPqa8/maxresdefault.jpg',
   '-4p4p2PPqa8', 85, 7.4, 'R'),
   
  ('youtube:movie:belly-1998', 'movie', 'video',
   'Belly (1998)',
   'DMX and Nas star as childhood friends in the drug game. Hype Williams visual masterpiece.',
   1998, 5760,
   'https://img.youtube.com/vi/rWq6vRXnWXo/maxresdefault.jpg',
   'https://img.youtube.com/vi/rWq6vRXnWXo/maxresdefault.jpg',
   'rWq6vRXnWXo', 83, 5.6, 'R'),
   
  ('youtube:movie:the-wood-1999', 'movie', 'video',
   'The Wood (1999)',
   'Three friends reminisce about growing up in Inglewood on a wedding day. Omar Epps, Taye Diggs.',
   1999, 6360,
   'https://img.youtube.com/vi/iiYWtxznLEA/maxresdefault.jpg',
   'https://img.youtube.com/vi/iiYWtxznLEA/maxresdefault.jpg',
   'iiYWtxznLEA', 81, 6.9, 'R'),
   
  ('youtube:movie:atl-2006', 'movie', 'video',
   'ATL (2006)',
   'T.I. stars as a teen at a crossroads after graduating from an Atlanta high school.',
   2006, 6300,
   'https://img.youtube.com/vi/ybzh6_5GFD0/maxresdefault.jpg',
   'https://img.youtube.com/vi/ybzh6_5GFD0/maxresdefault.jpg',
   'ybzh6_5GFD0', 80, 6.4, 'PG-13')
   
ON CONFLICT (canonical_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  poster_url = EXCLUDED.poster_url,
  backdrop_url = EXCLUDED.backdrop_url,
  popularity_score = EXCLUDED.popularity_score,
  updated_at = NOW();

-- =====================================================================
-- BEST 1990s MOVIES (20+ titles)
-- =====================================================================

INSERT INTO public.media_nodes (
  canonical_id, media_type, category, title, description, release_year,
  duration_seconds, poster_url, backdrop_url, youtube_id, popularity_score,
  average_rating, content_rating
) VALUES
  ('youtube:movie:terminator2-1991', 'movie', 'video',
   'Terminator 2: Judgment Day (1991)',
   'A cyborg protects a young John Connor from a more advanced terminator. Schwarzenegger action classic.',
   1991, 8340,
   'https://img.youtube.com/vi/CRRlbK5w8AE/maxresdefault.jpg',
   'https://img.youtube.com/vi/CRRlbK5w8AE/maxresdefault.jpg',
   'CRRlbK5w8AE', 95, 8.6, 'R'),
   
  ('youtube:movie:point-break-1991', 'movie', 'video',
   'Point Break (1991)',
   'An FBI agent goes undercover with surfers who may be bank robbers. Keanu Reeves, Patrick Swayze.',
   1991, 7320,
   'https://img.youtube.com/vi/ncvGLCfGICE/maxresdefault.jpg',
   'https://img.youtube.com/vi/ncvGLCfGICE/maxresdefault.jpg',
   'ncvGLCfGICE', 87, 7.3, 'R'),
   
  ('youtube:movie:demolition-man-1993', 'movie', 'video',
   'Demolition Man (1993)',
   'A cop is thawed from cryogenic prison to catch an old nemesis in utopian 2032. Stallone vs Snipes.',
   1993, 6900,
   'https://img.youtube.com/vi/ltsVU_kpovY/maxresdefault.jpg',
   'https://img.youtube.com/vi/ltsVU_kpovY/maxresdefault.jpg',
   'ltsVU_kpovY', 84, 6.7, 'R'),
   
  ('youtube:movie:true-lies-1994', 'movie', 'video',
   'True Lies (1994)',
   'A secret agent must balance saving the world and his marriage. Schwarzenegger, Jamie Lee Curtis.',
   1994, 8520,
   'https://img.youtube.com/vi/7F_yDfWzc50/maxresdefault.jpg',
   'https://img.youtube.com/vi/7F_yDfWzc50/maxresdefault.jpg',
   '7F_yDfWzc50', 86, 7.3, 'R'),
   
  ('youtube:movie:speed-1994', 'movie', 'video',
   'Speed (1994)',
   'A bus must maintain speed above 50mph or a bomb will explode. Keanu Reeves, Sandra Bullock.',
   1994, 6960,
   'https://img.youtube.com/vi/8piqd2BWeGI/maxresdefault.jpg',
   'https://img.youtube.com/vi/8piqd2BWeGI/maxresdefault.jpg',
   '8piqd2BWeGI', 89, 7.3, 'R'),
   
  ('youtube:movie:bad-boys-1995', 'movie', 'video',
   'Bad Boys (1995)',
   'Two Miami cops must protect a witness while retrieving stolen drugs. Will Smith, Martin Lawrence.',
   1995, 7140,
   'https://img.youtube.com/vi/XG5GOH2CO1k/maxresdefault.jpg',
   'https://img.youtube.com/vi/XG5GOH2CO1k/maxresdefault.jpg',
   'XG5GOH2CO1k', 88, 6.9, 'R'),
   
  ('youtube:movie:money-train-1995', 'movie', 'video',
   'Money Train (1995)',
   'Two transit cops plan to rob the money train. Wesley Snipes, Woody Harrelson action comedy.',
   1995, 6600,
   'https://img.youtube.com/vi/K2nmrEvgv0M/maxresdefault.jpg',
   'https://img.youtube.com/vi/K2nmrEvgv0M/maxresdefault.jpg',
   'K2nmrEvgv0M', 77, 5.8, 'R'),
   
  ('youtube:movie:the-rock-1996', 'movie', 'video',
   'The Rock (1996)',
   'A chemical weapons expert and an escaped convict must stop a threat on Alcatraz. Cage, Connery.',
   1996, 8160,
   'https://img.youtube.com/vi/qW0hK1rHl50/maxresdefault.jpg',
   'https://img.youtube.com/vi/qW0hK1rHl50/maxresdefault.jpg',
   'qW0hK1rHl50', 91, 7.4, 'R'),
   
  ('youtube:movie:con-air-1997', 'movie', 'video',
   'Con Air (1997)',
   'A parolee finds himself on a prison transport flight taken over by criminals. Nicolas Cage.',
   1997, 6900,
   'https://img.youtube.com/vi/4tH1kCzdkps/maxresdefault.jpg',
   'https://img.youtube.com/vi/4tH1kCzdkps/maxresdefault.jpg',
   '4tH1kCzdkps', 85, 6.9, 'R'),
   
  ('youtube:movie:face-off-1997', 'movie', 'video',
   'Face/Off (1997)',
   'An FBI agent and a terrorist swap faces in John Woo''s action masterpiece. Travolta, Cage.',
   1997, 8280,
   'https://img.youtube.com/vi/XG5GOH2CO1k/maxresdefault.jpg',
   'https://img.youtube.com/vi/XG5GOH2CO1k/maxresdefault.jpg',
   'XG5GOH2CO1k', 90, 7.3, 'R'),
   
  ('youtube:movie:blade-1998', 'movie', 'video',
   'Blade (1998)',
   'A half-vampire uses his powers to hunt the undead. Wesley Snipes superhero action.',
   1998, 7200,
   'https://img.youtube.com/vi/hMs80l1mGU0/maxresdefault.jpg',
   'https://img.youtube.com/vi/hMs80l1mGU0/maxresdefault.jpg',
   'hMs80l1mGU0', 88, 7.1, 'R'),
   
  ('youtube:movie:lethal-weapon-4-1998', 'movie', 'video',
   'Lethal Weapon 4 (1998)',
   'Riggs and Murtaugh battle Chinese slave traders. Gibson, Glover, Jet Li.',
   1998, 7800,
   'https://img.youtube.com/vi/hYLadBjERb4/maxresdefault.jpg',
   'https://img.youtube.com/vi/hYLadBjERb4/maxresdefault.jpg',
   'hYLadBjERb4', 82, 6.6, 'R'),
   
  ('youtube:movie:rush-hour-1998', 'movie', 'video',
   'Rush Hour (1998)',
   'A Hong Kong cop teams with an LAPD detective to rescue a kidnapped girl. Jackie Chan, Chris Tucker.',
   1998, 5880,
   'https://img.youtube.com/vi/JMiFsFQYAc0/maxresdefault.jpg',
   'https://img.youtube.com/vi/JMiFsFQYAc0/maxresdefault.jpg',
   'JMiFsFQYAc0', 92, 7.0, 'PG-13'),
   
  ('youtube:movie:the-matrix-1999', 'movie', 'video',
   'The Matrix (1999)',
   'A hacker discovers reality is a simulation controlled by machines. Keanu Reeves sci-fi classic.',
   1999, 8160,
   'https://img.youtube.com/vi/m8e-FF8MsqU/maxresdefault.jpg',
   'https://img.youtube.com/vi/m8e-FF8MsqU/maxresdefault.jpg',
   'm8e-FF8MsqU', 98, 8.7, 'R'),
   
  ('youtube:movie:fight-club-1999', 'movie', 'video',
   'Fight Club (1999)',
   'An insomniac and a soap salesman form an underground fighting club. Brad Pitt, Edward Norton.',
   1999, 8340,
   'https://img.youtube.com/vi/qtRKdVHc-cE/maxresdefault.jpg',
   'https://img.youtube.com/vi/qtRKdVHc-cE/maxresdefault.jpg',
   'qtRKdVHc-cE', 94, 8.8, 'R'),
   
  ('youtube:movie:american-pie-1999', 'movie', 'video',
   'American Pie (1999)',
   'Four high school friends make a pact to lose their virginity before graduation. Teen comedy classic.',
   1999, 5700,
   'https://img.youtube.com/vi/q9i29JAjcIg/maxresdefault.jpg',
   'https://img.youtube.com/vi/q9i29JAjcIg/maxresdefault.jpg',
   'q9i29JAjcIg', 86, 7.0, 'R'),
   
  ('youtube:movie:big-daddy-1999', 'movie', 'video',
   'Big Daddy (1999)',
   'A lazy law school grad adopts a kid to impress his girlfriend. Adam Sandler comedy.',
   1999, 5580,
   'https://img.youtube.com/vi/P0yiId3idnQ/maxresdefault.jpg',
   'https://img.youtube.com/vi/P0yiId3idnQ/maxresdefault.jpg',
   'P0yiId3idnQ', 83, 6.4, 'PG-13'),
   
  ('youtube:movie:austin-powers-1997', 'movie', 'video',
   'Austin Powers: International Man of Mystery (1997)',
   'A swinging 60s spy is thawed to battle his nemesis Dr. Evil. Mike Myers comedy.',
   1997, 5340,
   'https://img.youtube.com/vi/mLaX9a0jkCY/maxresdefault.jpg',
   'https://img.youtube.com/vi/mLaX9a0jkCY/maxresdefault.jpg',
   'mLaX9a0jkCY', 87, 7.0, 'PG-13'),
   
  ('youtube:movie:there-something-mary-1998', 'movie', 'video',
   'There''s Something About Mary (1998)',
   'A man hires a private detective to find his high school crush. Ben Stiller, Cameron Diaz.',
   1998, 7140,
   'https://img.youtube.com/vi/ILS3HX74kZI/maxresdefault.jpg',
   'https://img.youtube.com/vi/ILS3HX74kZI/maxresdefault.jpg',
   'ILS3HX74kZI', 85, 7.1, 'R'),
   
  ('youtube:movie:analyze-this-1999', 'movie', 'video',
   'Analyze This (1999)',
   'A mob boss starts seeing a psychiatrist before a big mafia meeting. De Niro, Billy Crystal.',
   1999, 6180,
   'https://img.youtube.com/vi/FLVBUgcfC_M/maxresdefault.jpg',
   'https://img.youtube.com/vi/FLVBUgcfC_M/maxresdefault.jpg',
   'FLVBUgcfC_M', 79, 6.8, 'R')
   
ON CONFLICT (canonical_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  poster_url = EXCLUDED.poster_url,
  backdrop_url = EXCLUDED.backdrop_url,
  popularity_score = EXCLUDED.popularity_score,
  updated_at = NOW();

-- =====================================================================
-- TOP ACTION MOVIES (15+ titles)
-- =====================================================================

INSERT INTO public.media_nodes (
  canonical_id, media_type, category, title, description, release_year,
  duration_seconds, poster_url, backdrop_url, youtube_id, popularity_score,
  average_rating, content_rating
) VALUES
  ('youtube:movie:die-hard-1988', 'movie', 'video',
   'Die Hard (1988)',
   'A cop battles terrorists in an LA skyscraper on Christmas Eve. Bruce Willis action classic.',
   1988, 7920,
   'https://img.youtube.com/vi/2TQ-pOvI6Xo/maxresdefault.jpg',
   'https://img.youtube.com/vi/2TQ-pOvI6Xo/maxresdefault.jpg',
   '2TQ-pOvI6Xo', 94, 8.2, 'R'),
   
  ('youtube:movie:predator-1987', 'movie', 'video',
   'Predator (1987)',
   'A team of commandos is hunted by an alien in the jungle. Schwarzenegger sci-fi action.',
   1987, 6420,
   'https://img.youtube.com/vi/Y1xqUnOXQXY/maxresdefault.jpg',
   'https://img.youtube.com/vi/Y1xqUnOXQXY/maxresdefault.jpg',
   'Y1xqUnOXQXY', 91, 7.8, 'R'),
   
  ('youtube:movie:robocop-1987', 'movie', 'video',
   'RoboCop (1987)',
   'A murdered cop is resurrected as a cyborg law enforcement officer. Paul Verhoeven classic.',
   1987, 6180,
   'https://img.youtube.com/vi/7B_1-G3KP7E/maxresdefault.jpg',
   'https://img.youtube.com/vi/7B_1-G3KP7E/maxresdefault.jpg',
   '7B_1-G3KP7E', 89, 7.6, 'R'),
   
  ('youtube:movie:total-recall-1990', 'movie', 'video',
   'Total Recall (1990)',
   'A man discovers his memories may be implanted and travels to Mars. Schwarzenegger sci-fi.',
   1990, 6720,
   'https://img.youtube.com/vi/WFMLGEHdIjE/maxresdefault.jpg',
   'https://img.youtube.com/vi/WFMLGEHdIjE/maxresdefault.jpg',
   'WFMLGEHdIjE', 88, 7.5, 'R'),
   
  ('youtube:movie:commando-1985', 'movie', 'video',
   'Commando (1985)',
   'A retired special forces colonel goes on a rampage to rescue his kidnapped daughter.',
   1985, 5400,
   'https://img.youtube.com/vi/fXKt2FhFgUQ/maxresdefault.jpg',
   'https://img.youtube.com/vi/fXKt2FhFgUQ/maxresdefault.jpg',
   'fXKt2FhFgUQ', 86, 6.7, 'R'),
   
  ('youtube:movie:rambo-first-blood-1982', 'movie', 'video',
   'First Blood (1982)',
   'A Vietnam vet is persecuted by a small-town sheriff and fights back. Stallone origin story.',
   1982, 5760,
   'https://img.youtube.com/vi/64wMmlmxEYU/maxresdefault.jpg',
   'https://img.youtube.com/vi/64wMmlmxEYU/maxresdefault.jpg',
   '64wMmlmxEYU', 87, 7.7, 'R'),
   
  ('youtube:movie:under-siege-1992', 'movie', 'video',
   'Under Siege (1992)',
   'A cook on a battleship must stop terrorists. Steven Seagal at his best.',
   1992, 6180,
   'https://img.youtube.com/vi/tGHYZKXmoPI/maxresdefault.jpg',
   'https://img.youtube.com/vi/tGHYZKXmoPI/maxresdefault.jpg',
   'tGHYZKXmoPI', 82, 6.5, 'R'),
   
  ('youtube:movie:passenger-57-1992', 'movie', 'video',
   'Passenger 57 (1992)',
   'An airline security expert battles terrorists mid-flight. Wesley Snipes action.',
   1992, 5040,
   'https://img.youtube.com/vi/EWLL8zHlaAM/maxresdefault.jpg',
   'https://img.youtube.com/vi/EWLL8zHlaAM/maxresdefault.jpg',
   'EWLL8zHlaAM', 78, 6.0, 'R'),
   
  ('youtube:movie:hard-target-1993', 'movie', 'video',
   'Hard Target (1993)',
   'A homeless veteran is hunted for sport in New Orleans. Jean-Claude Van Damme, John Woo.',
   1993, 5820,
   'https://img.youtube.com/vi/q3m9nwWItVg/maxresdefault.jpg',
   'https://img.youtube.com/vi/q3m9nwWItVg/maxresdefault.jpg',
   'q3m9nwWItVg', 80, 6.2, 'R'),
   
  ('youtube:movie:cliffhanger-1993', 'movie', 'video',
   'Cliffhanger (1993)',
   'A mountain rescue ranger battles thieves on a snowy peak. Stallone action thriller.',
   1993, 6720,
   'https://img.youtube.com/vi/ZxHLuzOnVNo/maxresdefault.jpg',
   'https://img.youtube.com/vi/ZxHLuzOnVNo/maxresdefault.jpg',
   'ZxHLuzOnVNo', 83, 6.4, 'R'),
   
  ('youtube:movie:executive-decision-1996', 'movie', 'video',
   'Executive Decision (1996)',
   'A team must board a hijacked plane mid-flight to stop terrorists. Kurt Russell, Steven Seagal.',
   1996, 7920,
   'https://img.youtube.com/vi/jgHnkc2Hn-k/maxresdefault.jpg',
   'https://img.youtube.com/vi/jgHnkc2Hn-k/maxresdefault.jpg',
   'jgHnkc2Hn-k', 81, 6.4, 'R'),
   
  ('youtube:movie:long-kiss-goodnight-1996', 'movie', 'video',
   'The Long Kiss Goodnight (1996)',
   'An amnesiac housewife discovers she was a trained assassin. Geena Davis, Samuel L. Jackson.',
   1996, 7200,
   'https://img.youtube.com/vi/1JOf7Gbn4Is/maxresdefault.jpg',
   'https://img.youtube.com/vi/1JOf7Gbn4Is/maxresdefault.jpg',
   '1JOf7Gbn4Is', 84, 7.0, 'R'),
   
  ('youtube:movie:air-force-one-1997', 'movie', 'video',
   'Air Force One (1997)',
   'The President must retake his plane from terrorists. Harrison Ford action thriller.',
   1997, 7440,
   'https://img.youtube.com/vi/VPD5UBjPBKo/maxresdefault.jpg',
   'https://img.youtube.com/vi/VPD5UBjPBKo/maxresdefault.jpg',
   'VPD5UBjPBKo', 85, 6.5, 'R'),
   
  ('youtube:movie:the-negotiator-1998', 'movie', 'video',
   'The Negotiator (1998)',
   'A hostage negotiator takes hostages to prove his innocence. Samuel L. Jackson, Kevin Spacey.',
   1998, 8280,
   'https://img.youtube.com/vi/7mLLNKXC5Co/maxresdefault.jpg',
   'https://img.youtube.com/vi/7mLLNKXC5Co/maxresdefault.jpg',
   '7mLLNKXC5Co', 86, 7.3, 'R'),
   
  ('youtube:movie:replacement-killers-1998', 'movie', 'video',
   'The Replacement Killers (1998)',
   'A hitman refuses to kill a cop''s son and becomes a target himself. Chow Yun-fat, Mira Sorvino.',
   1998, 5280,
   'https://img.youtube.com/vi/KwOj3CPcuXo/maxresdefault.jpg',
   'https://img.youtube.com/vi/KwOj3CPcuXo/maxresdefault.jpg',
   'KwOj3CPcuXo', 76, 6.0, 'R')
   
ON CONFLICT (canonical_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  poster_url = EXCLUDED.poster_url,
  backdrop_url = EXCLUDED.backdrop_url,
  popularity_score = EXCLUDED.popularity_score,
  updated_at = NOW();

-- =====================================================================
-- TOP SCI-FI MOVIES (15+ titles)
-- =====================================================================

INSERT INTO public.media_nodes (
  canonical_id, media_type, category, title, description, release_year,
  duration_seconds, poster_url, backdrop_url, youtube_id, popularity_score,
  average_rating, content_rating
) VALUES
  ('youtube:movie:alien-1979', 'movie', 'video',
   'Alien (1979)',
   'A commercial spaceship crew encounters a deadly extraterrestrial. Ridley Scott horror classic.',
   1979, 6960,
   'https://img.youtube.com/vi/bEVY_lonKf4/maxresdefault.jpg',
   'https://img.youtube.com/vi/bEVY_lonKf4/maxresdefault.jpg',
   'bEVY_lonKf4', 93, 8.5, 'R'),
   
  ('youtube:movie:aliens-1986', 'movie', 'video',
   'Aliens (1986)',
   'Ripley returns to the alien planet with colonial marines. James Cameron action sequel.',
   1986, 9180,
   'https://img.youtube.com/vi/XHl3EBIpCYE/maxresdefault.jpg',
   'https://img.youtube.com/vi/XHl3EBIpCYE/maxresdefault.jpg',
   'XHl3EBIpCYE', 94, 8.4, 'R'),
   
  ('youtube:movie:blade-runner-1982', 'movie', 'video',
   'Blade Runner (1982)',
   'A cop hunts rogue androids in dystopian Los Angeles. Harrison Ford, Ridley Scott masterpiece.',
   1982, 7020,
   'https://img.youtube.com/vi/eogpIG53Cis/maxresdefault.jpg',
   'https://img.youtube.com/vi/eogpIG53Cis/maxresdefault.jpg',
   'eogpIG53Cis', 92, 8.1, 'R'),
   
  ('youtube:movie:the-thing-1982', 'movie', 'video',
   'The Thing (1982)',
   'An alien lifeform assimilates and imitates Arctic researchers. John Carpenter horror classic.',
   1982, 6540,
   'https://img.youtube.com/vi/5ftmr17M-a4/maxresdefault.jpg',
   'https://img.youtube.com/vi/5ftmr17M-a4/maxresdefault.jpg',
   '5ftmr17M-a4', 90, 8.2, 'R'),
   
  ('youtube:movie:2001-space-odyssey-1968', 'movie', 'video',
   '2001: A Space Odyssey (1968)',
   'Humanity finds a mysterious monolith affecting evolution. Kubrick sci-fi masterpiece.',
   1968, 8880,
   'https://img.youtube.com/vi/oR_e9y-bka0/maxresdefault.jpg',
   'https://img.youtube.com/vi/oR_e9y-bka0/maxresdefault.jpg',
   'oR_e9y-bka0', 91, 8.3, 'G'),
   
  ('youtube:movie:close-encounters-1977', 'movie', 'video',
   'Close Encounters of the Third Kind (1977)',
   'A man becomes obsessed with aliens after a UFO encounter. Spielberg sci-fi classic.',
   1977, 8280,
   'https://img.youtube.com/vi/3sT8wTHUGXY/maxresdefault.jpg',
   'https://img.youtube.com/vi/3sT8wTHUGXY/maxresdefault.jpg',
   '3sT8wTHUGXY', 88, 7.6, 'PG'),
   
  ('youtube:movie:et-1982', 'movie', 'video',
   'E.T. the Extra-Terrestrial (1982)',
   'A boy befriends an alien stranded on Earth. Steven Spielberg family classic.',
   1982, 6900,
   'https://img.youtube.com/vi/qYAETtIIClk/maxresdefault.jpg',
   'https://img.youtube.com/vi/qYAETtIIClk/maxresdefault.jpg',
   'qYAETtIIClk', 92, 7.9, 'PG'),
   
  ('youtube:movie:back-future-1985', 'movie', 'video',
   'Back to the Future (1985)',
   'A teen travels back in time in a DeLorean. Michael J. Fox, Christopher Lloyd classic.',
   1985, 6960,
   'https://img.youtube.com/vi/qvsgGtivCgs/maxresdefault.jpg',
   'https://img.youtube.com/vi/qvsgGtivCgs/maxresdefault.jpg',
   'qvsgGtivCgs', 95, 8.5, 'PG'),
   
  ('youtube:movie:war-of-worlds-1953', 'movie', 'video',
   'The War of the Worlds (1953)',
   'Martians invade Earth with devastating heat rays. Classic H.G. Wells adaptation.',
   1953, 5280,
   'https://img.youtube.com/vi/ZYzOtPKgMag/maxresdefault.jpg',
   'https://img.youtube.com/vi/ZYzOtPKgMag/maxresdefault.jpg',
   'ZYzOtPKgMag', 82, 7.1, 'G'),
   
  ('youtube:movie:forbidden-planet-1956', 'movie', 'video',
   'Forbidden Planet (1956)',
   'A starship crew investigates a planet with a deadly secret. Influential 50s sci-fi.',
   1956, 5880,
   'https://img.youtube.com/vi/PJ2B6fpfWBk/maxresdefault.jpg',
   'https://img.youtube.com/vi/PJ2B6fpfWBk/maxresdefault.jpg',
   'PJ2B6fpfWBk', 80, 7.6, 'G'),
   
  ('youtube:movie:invasion-body-snatchers-1956', 'movie', 'video',
   'Invasion of the Body Snatchers (1956)',
   'Alien pods replace humans with emotionless duplicates. Cold War paranoia classic.',
   1956, 4800,
   'https://img.youtube.com/vi/Gv7N0W95JCc/maxresdefault.jpg',
   'https://img.youtube.com/vi/Gv7N0W95JCc/maxresdefault.jpg',
   'Gv7N0W95JCc', 83, 7.7, 'UNRATED'),
   
  ('youtube:movie:day-earth-stood-still-1951', 'movie', 'video',
   'The Day the Earth Stood Still (1951)',
   'An alien lands in Washington DC with a warning for humanity. Classic sci-fi.',
   1951, 5520,
   'https://img.youtube.com/vi/o1NNlqCjGcQ/maxresdefault.jpg',
   'https://img.youtube.com/vi/o1NNlqCjGcQ/maxresdefault.jpg',
   'o1NNlqCjGcQ', 84, 7.7, 'G'),
   
  ('youtube:movie:logan-run-1976', 'movie', 'video',
   'Logan''s Run (1976)',
   'In a domed city, everyone must die at 30. A Sandman tries to escape. Dystopian classic.',
   1976, 7140,
   'https://img.youtube.com/vi/JG5j_tSYgwY/maxresdefault.jpg',
   'https://img.youtube.com/vi/JG5j_tSYgwY/maxresdefault.jpg',
   'JG5j_tSYgwY', 79, 6.8, 'PG'),
   
  ('youtube:movie:soylent-green-1973', 'movie', 'video',
   'Soylent Green (1973)',
   'A cop investigates a murder in an overpopulated future. Charlton Heston dystopia.',
   1973, 5820,
   'https://img.youtube.com/vi/6zAFA-hamZ0/maxresdefault.jpg',
   'https://img.youtube.com/vi/6zAFA-hamZ0/maxresdefault.jpg',
   '6zAFA-hamZ0', 81, 7.1, 'PG'),
   
  ('youtube:movie:westworld-1973', 'movie', 'video',
   'Westworld (1973)',
   'Robots malfunction at an adult amusement park. Yul Brynner, Michael Crichton.',
   1973, 5280,
   'https://img.youtube.com/vi/JqNRbGF02eA/maxresdefault.jpg',
   'https://img.youtube.com/vi/JqNRbGF02eA/maxresdefault.jpg',
   'JqNRbGF02eA', 82, 7.0, 'PG')
   
ON CONFLICT (canonical_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  poster_url = EXCLUDED.poster_url,
  backdrop_url = EXCLUDED.backdrop_url,
  popularity_score = EXCLUDED.popularity_score,
  updated_at = NOW();

-- =====================================================================
-- ANIMATION / CARTOON MOVIES (15+ titles)
-- =====================================================================

INSERT INTO public.media_nodes (
  canonical_id, media_type, category, title, description, release_year,
  duration_seconds, poster_url, backdrop_url, youtube_id, popularity_score,
  average_rating, content_rating
) VALUES
  ('youtube:movie:heavy-metal-1981', 'movie', 'video',
   'Heavy Metal (1981)',
   'An anthology of fantasy and sci-fi stories tied together by a glowing green orb. Adult animation.',
   1981, 5400,
   'https://img.youtube.com/vi/xzYsAjBhKSk/maxresdefault.jpg',
   'https://img.youtube.com/vi/xzYsAjBhKSk/maxresdefault.jpg',
   'xzYsAjBhKSk', 82, 6.6, 'R'),
   
  ('youtube:movie:akira-1988', 'movie', 'video',
   'Akira (1988)',
   'A biker gang member gains psychic powers in neo-Tokyo. Landmark anime film.',
   1988, 7440,
   'https://img.youtube.com/vi/3WDGV_6BXYM/maxresdefault.jpg',
   'https://img.youtube.com/vi/3WDGV_6BXYM/maxresdefault.jpg',
   '3WDGV_6BXYM', 90, 8.0, 'R'),
   
  ('youtube:movie:ghost-shell-1995', 'movie', 'video',
   'Ghost in the Shell (1995)',
   'A cyborg cop hunts a mysterious hacker. Influential cyberpunk anime.',
   1995, 4980,
   'https://img.youtube.com/vi/SvBVDibOrgs/maxresdefault.jpg',
   'https://img.youtube.com/vi/SvBVDibOrgs/maxresdefault.jpg',
   'SvBVDibOrgs', 89, 8.0, 'TV-MA'),
   
  ('youtube:movie:spirited-away-2001', 'movie', 'video',
   'Spirited Away (2001)',
   'A girl must work in a bathhouse for spirits to save her parents. Miyazaki masterpiece.',
   2001, 7500,
   'https://img.youtube.com/vi/ByXuk9QqQkk/maxresdefault.jpg',
   'https://img.youtube.com/vi/ByXuk9QqQkk/maxresdefault.jpg',
   'ByXuk9QqQkk', 94, 8.6, 'PG'),
   
  ('youtube:movie:princess-mononoke-1997', 'movie', 'video',
   'Princess Mononoke (1997)',
   'A prince becomes embroiled in a war between forest gods and humans. Miyazaki epic.',
   1997, 8040,
   'https://img.youtube.com/vi/4OiMOHRDs14/maxresdefault.jpg',
   'https://img.youtube.com/vi/4OiMOHRDs14/maxresdefault.jpg',
   '4OiMOHRDs14', 92, 8.4, 'PG-13'),
   
  ('youtube:movie:iron-giant-1999', 'movie', 'video',
   'The Iron Giant (1999)',
   'A boy befriends a giant robot from space during the Cold War. Animated classic.',
   1999, 5160,
   'https://img.youtube.com/vi/obLtyj8hfFk/maxresdefault.jpg',
   'https://img.youtube.com/vi/obLtyj8hfFk/maxresdefault.jpg',
   'obLtyj8hfFk', 91, 8.1, 'PG'),
   
  ('youtube:movie:ninja-scroll-1993', 'movie', 'video',
   'Ninja Scroll (1993)',
   'A wandering ninja battles supernatural foes. Violent samurai anime classic.',
   1993, 5640,
   'https://img.youtube.com/vi/9O6_N4mQBos/maxresdefault.jpg',
   'https://img.youtube.com/vi/9O6_N4mQBos/maxresdefault.jpg',
   '9O6_N4mQBos', 85, 7.9, 'R'),
   
  ('youtube:movie:vampire-hunter-d-1985', 'movie', 'video',
   'Vampire Hunter D (1985)',
   'A half-vampire hunts an ancient noble. Gothic horror anime.',
   1985, 4800,
   'https://img.youtube.com/vi/M_aXNL6hTD8/maxresdefault.jpg',
   'https://img.youtube.com/vi/M_aXNL6hTD8/maxresdefault.jpg',
   'M_aXNL6hTD8', 80, 7.3, 'R'),
   
  ('youtube:movie:secret-nimh-1982', 'movie', 'video',
   'The Secret of NIMH (1982)',
   'A mouse seeks help from superintelligent rats to save her family. Don Bluth classic.',
   1982, 4980,
   'https://img.youtube.com/vi/gTYH2GTZPVQ/maxresdefault.jpg',
   'https://img.youtube.com/vi/gTYH2GTZPVQ/maxresdefault.jpg',
   'gTYH2GTZPVQ', 84, 7.6, 'G'),
   
  ('youtube:movie:american-tail-1986', 'movie', 'video',
   'An American Tail (1986)',
   'A Russian mouse immigrates to America and gets separated from his family. Don Bluth.',
   1986, 4800,
   'https://img.youtube.com/vi/hg57WHN9zpU/maxresdefault.jpg',
   'https://img.youtube.com/vi/hg57WHN9zpU/maxresdefault.jpg',
   'hg57WHN9zpU', 83, 7.0, 'G'),
   
  ('youtube:movie:land-before-time-1988', 'movie', 'video',
   'The Land Before Time (1988)',
   'Young dinosaurs journey to the Great Valley. Don Bluth animated classic.',
   1988, 4140,
   'https://img.youtube.com/vi/a9gCaI_LqVk/maxresdefault.jpg',
   'https://img.youtube.com/vi/a9gCaI_LqVk/maxresdefault.jpg',
   'a9gCaI_LqVk', 86, 7.4, 'G'),
   
  ('youtube:movie:all-dogs-heaven-1989', 'movie', 'video',
   'All Dogs Go to Heaven (1989)',
   'A murdered dog returns from heaven to get revenge. Don Bluth dark comedy.',
   1989, 5100,
   'https://img.youtube.com/vi/OHUDkXJHyWg/maxresdefault.jpg',
   'https://img.youtube.com/vi/OHUDkXJHyWg/maxresdefault.jpg',
   'OHUDkXJHyWg', 81, 6.7, 'G'),
   
  ('youtube:movie:watership-down-1978', 'movie', 'video',
   'Watership Down (1978)',
   'Rabbits flee their warren to find a new home. Dark animated adventure.',
   1978, 5520,
   'https://img.youtube.com/vi/xCjCKnW-PaI/maxresdefault.jpg',
   'https://img.youtube.com/vi/xCjCKnW-PaI/maxresdefault.jpg',
   'xCjCKnW-PaI', 82, 7.6, 'PG'),
   
  ('youtube:movie:beavis-butthead-america-1996', 'movie', 'video',
   'Beavis and Butt-Head Do America (1996)',
   'The duo travels across America looking for their stolen TV. MTV comedy.',
   1996, 4800,
   'https://img.youtube.com/vi/Y8dcmLscf3g/maxresdefault.jpg',
   'https://img.youtube.com/vi/Y8dcmLscf3g/maxresdefault.jpg',
   'Y8dcmLscf3g', 79, 6.8, 'PG-13'),
   
  ('youtube:movie:south-park-movie-1999', 'movie', 'video',
   'South Park: Bigger, Longer & Uncut (1999)',
   'The boys start a war between the US and Canada. R-rated animated musical.',
   1999, 4920,
   'https://img.youtube.com/vi/f5mlEMGw9tI/maxresdefault.jpg',
   'https://img.youtube.com/vi/f5mlEMGw9tI/maxresdefault.jpg',
   'f5mlEMGw9tI', 85, 7.7, 'R')
   
ON CONFLICT (canonical_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  poster_url = EXCLUDED.poster_url,
  backdrop_url = EXCLUDED.backdrop_url,
  popularity_score = EXCLUDED.popularity_score,
  updated_at = NOW();

-- =====================================================================
-- BLACK TV SHOWS / FULL SEASONS (15+ series)
-- =====================================================================

INSERT INTO public.media_nodes (
  canonical_id, media_type, category, title, description, release_year,
  duration_seconds, poster_url, backdrop_url, youtube_id, popularity_score,
  average_rating, content_rating, season_number
) VALUES
  ('youtube:tv:fresh-prince-s1', 'tv_season', 'video',
   'The Fresh Prince of Bel-Air - Season 1',
   'Will Smith moves from Philly to live with his rich relatives in Bel-Air. Classic sitcom.',
   1990, 14400,
   'https://img.youtube.com/vi/AVbQo3IOC_A/maxresdefault.jpg',
   'https://img.youtube.com/vi/AVbQo3IOC_A/maxresdefault.jpg',
   'PLRDC-DZ_uWhrOMCryr5YU--MrsZPL9sb3', 94, 7.9, 'TV-PG', 1),
   
  ('youtube:tv:martin-s1', 'tv_season', 'video',
   'Martin - Season 1',
   'Martin Lawrence as a Detroit talk show host. 90s sitcom classic.',
   1992, 12600,
   'https://img.youtube.com/vi/xXnCU-V6KOk/maxresdefault.jpg',
   'https://img.youtube.com/vi/xXnCU-V6KOk/maxresdefault.jpg',
   'PLSqA0GaI-xWLLFXnzVHj2E0v9Gg8_hyv9', 92, 7.7, 'TV-PG', 1),
   
  ('youtube:tv:living-single-s1', 'tv_season', 'video',
   'Living Single - Season 1',
   'Six friends live in a Brooklyn brownstone. Predates Friends. Queen Latifah.',
   1993, 12600,
   'https://img.youtube.com/vi/tHnA94-hTC8/maxresdefault.jpg',
   'https://img.youtube.com/vi/tHnA94-hTC8/maxresdefault.jpg',
   'PLwQN-kLUvZcVIGtGDjQ9Z4D0v7qYM4SKy', 88, 7.6, 'TV-PG', 1),
   
  ('youtube:tv:good-times-s1', 'tv_season', 'video',
   'Good Times - Season 1',
   'A Black family struggles to make ends meet in a Chicago housing project. 70s classic.',
   1974, 10800,
   'https://img.youtube.com/vi/FbOZRMVbfPg/maxresdefault.jpg',
   'https://img.youtube.com/vi/FbOZRMVbfPg/maxresdefault.jpg',
   'PLqDGnqfMB1lxsOzw3UjWOvZQjCPF2e3KW', 85, 7.4, 'TV-PG', 1),
   
  ('youtube:tv:sanford-son-s1', 'tv_season', 'video',
   'Sanford and Son - Season 1',
   'A junk dealer and his son in Watts. Redd Foxx comedy classic.',
   1972, 10800,
   'https://img.youtube.com/vi/T5DnqW3F57E/maxresdefault.jpg',
   'https://img.youtube.com/vi/T5DnqW3F57E/maxresdefault.jpg',
   'PL7C7C30D9DE27F6B7', 90, 8.0, 'TV-PG', 1),
   
  ('youtube:tv:the-jeffersons-s1', 'tv_season', 'video',
   'The Jeffersons - Season 1',
   'George and Louise move on up to the East Side. All in the Family spin-off.',
   1975, 10800,
   'https://img.youtube.com/vi/2Vx7jv0qqGg/maxresdefault.jpg',
   'https://img.youtube.com/vi/2Vx7jv0qqGg/maxresdefault.jpg',
   'PLnbEfHvlWtUwXicBSFKdKb9_Y8LI3vz6j', 87, 7.5, 'TV-PG', 1),
   
  ('youtube:tv:whats-happening-s1', 'tv_season', 'video',
   'What''s Happening!! - Season 1',
   'Three friends navigate life in Los Angeles. Inspired by Cooley High.',
   1976, 10800,
   'https://img.youtube.com/vi/GgdANLkxJTw/maxresdefault.jpg',
   'https://img.youtube.com/vi/GgdANLkxJTw/maxresdefault.jpg',
   'PLRcsmI8tZBqVPXCQFNhHdmNAPJDLpexY6', 81, 7.2, 'TV-PG', 1),
   
  ('youtube:tv:227-s1', 'tv_season', 'video',
   '227 - Season 1',
   'Residents of a Washington D.C. apartment building. Marla Gibbs sitcom.',
   1985, 10800,
   'https://img.youtube.com/vi/X7oQq_I-u8A/maxresdefault.jpg',
   'https://img.youtube.com/vi/X7oQq_I-u8A/maxresdefault.jpg',
   'PLHLIrAA32HsDT-7UPbRWHffLwXvDVJhkz', 79, 7.0, 'TV-PG', 1),
   
  ('youtube:tv:amen-s1', 'tv_season', 'video',
   'Amen - Season 1',
   'A deacon schemes at a Philadelphia church. Sherman Hemsley comedy.',
   1986, 10800,
   'https://img.youtube.com/vi/ZE4dGCYDuaQ/maxresdefault.jpg',
   'https://img.youtube.com/vi/ZE4dGCYDuaQ/maxresdefault.jpg',
   'PLB2B5D96A5E4F7C98', 78, 7.1, 'TV-PG', 1),
   
  ('youtube:tv:a-different-world-s1', 'tv_season', 'video',
   'A Different World - Season 1',
   'Students at a historically Black college. Cosby Show spin-off.',
   1987, 10800,
   'https://img.youtube.com/vi/WEblq_r1Ehk/maxresdefault.jpg',
   'https://img.youtube.com/vi/WEblq_r1Ehk/maxresdefault.jpg',
   'PLq_3Bn5TS_bQSKR94KrTUUu_oaGPIoK7f', 86, 7.7, 'TV-PG', 1),
   
  ('youtube:tv:cosby-show-s1', 'tv_season', 'video',
   'The Cosby Show - Season 1',
   'An upper-middle-class Black family in Brooklyn. Groundbreaking sitcom.',
   1984, 10800,
   'https://img.youtube.com/vi/5MqkZBMN-3s/maxresdefault.jpg',
   'https://img.youtube.com/vi/5MqkZBMN-3s/maxresdefault.jpg',
   'PLnF_2V_J_Vb8PQCU_6V9L9oRCLW_R9YgE', 88, 7.4, 'TV-PG', 1),
   
  ('youtube:tv:family-matters-s1', 'tv_season', 'video',
   'Family Matters - Season 1',
   'A middle-class Chicago family and their nerdy neighbor Steve Urkel.',
   1989, 10800,
   'https://img.youtube.com/vi/A5kp5ihgYQg/maxresdefault.jpg',
   'https://img.youtube.com/vi/A5kp5ihgYQg/maxresdefault.jpg',
   'PLlJ6dY0N1PrY3e2aQdcOxQfCb_1lWbTVZ', 84, 6.9, 'TV-G', 1),
   
  ('youtube:tv:moesha-s1', 'tv_season', 'video',
   'Moesha - Season 1',
   'A teenager navigates life in Los Angeles. Brandy coming-of-age sitcom.',
   1996, 10800,
   'https://img.youtube.com/vi/tMyUt_Hwnzg/maxresdefault.jpg',
   'https://img.youtube.com/vi/tMyUt_Hwnzg/maxresdefault.jpg',
   'PL-CUVxAKCiF8KCvFZ7cHUWPrZm7LUL3xO', 80, 6.8, 'TV-PG', 1),
   
  ('youtube:tv:sister-sister-s1', 'tv_season', 'video',
   'Sister, Sister - Season 1',
   'Twins separated at birth reunite as teenagers. Tia and Tamera Mowry.',
   1994, 10800,
   'https://img.youtube.com/vi/pH6pM1xnxLw/maxresdefault.jpg',
   'https://img.youtube.com/vi/pH6pM1xnxLw/maxresdefault.jpg',
   'PLn4ob_5_ttEYABxixVINf8s-0_fRBxKQH', 82, 7.1, 'TV-G', 1),
   
  ('youtube:tv:in-living-color-s1', 'tv_season', 'video',
   'In Living Color - Season 1',
   'Sketch comedy that launched the Wayans family. Groundbreaking variety show.',
   1990, 10800,
   'https://img.youtube.com/vi/BaF0_UPF3LY/maxresdefault.jpg',
   'https://img.youtube.com/vi/BaF0_UPF3LY/maxresdefault.jpg',
   'PL9qz9xXPvQZX7TYNZHbS8vVTH_kOPOsXn', 89, 8.0, 'TV-14', 1)
   
ON CONFLICT (canonical_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  poster_url = EXCLUDED.poster_url,
  backdrop_url = EXCLUDED.backdrop_url,
  popularity_score = EXCLUDED.popularity_score,
  season_number = EXCLUDED.season_number,
  updated_at = NOW();

-- =====================================================================
-- ANIMATED TV SERIES / KIDS CONTENT (15+ series)
-- =====================================================================

INSERT INTO public.media_nodes (
  canonical_id, media_type, category, title, description, release_year,
  duration_seconds, poster_url, backdrop_url, youtube_id, popularity_score,
  average_rating, content_rating
) VALUES
  ('youtube:tv:spongebob-marathon', 'tv_show', 'video',
   'SpongeBob SquarePants Marathon',
   'Follow SpongeBob and friends in Bikini Bottom. Nickelodeon classic.',
   1999, 18000,
   'https://img.youtube.com/vi/8B8jplhrlso/maxresdefault.jpg',
   'https://img.youtube.com/vi/8B8jplhrlso/maxresdefault.jpg',
   '8B8jplhrlso', 92, 8.2, 'TV-Y7'),
   
  ('youtube:tv:nicktoons-episodes', 'tv_show', 'video',
   'Nicktoons Full Episodes Collection',
   'Classic Nickelodeon animated shows including Rugrats, Hey Arnold, and more.',
   1991, 21600,
   'https://img.youtube.com/vi/PLUQR09yEYrP0RaHE3f9vNQkOx08IT9ZTe/maxresdefault.jpg',
   'https://img.youtube.com/vi/PLUQR09yEYrP0RaHE3f9vNQkOx08IT9ZTe/maxresdefault.jpg',
   'PLUQR09yEYrP0RaHE3f9vNQkOx08IT9ZTe', 88, 8.0, 'TV-Y7'),
   
  ('youtube:tv:catdog-full', 'tv_show', 'video',
   'CatDog Full Episodes',
   'A cat-dog hybrid navigates life in Nearburg. Nickelodeon classic.',
   1998, 14400,
   'https://img.youtube.com/vi/PLfrgt_xI4Xq2Cg78vsEjqEs-aJv1HQmO0/maxresdefault.jpg',
   'https://img.youtube.com/vi/PLfrgt_xI4Xq2Cg78vsEjqEs-aJv1HQmO0/maxresdefault.jpg',
   'PLfrgt_xI4Xq2Cg78vsEjqEs-aJv1HQmO0', 82, 7.2, 'TV-Y7'),
   
  ('youtube:tv:animaniacs-full', 'tv_show', 'video',
   'Animaniacs Full Episodes',
   'The Warner siblings cause chaos at the studio lot. Steven Spielberg classic.',
   1993, 18000,
   'https://img.youtube.com/vi/PLd3-CCCcbQeJSROdd9rf5YV996HwYdEDL/maxresdefault.jpg',
   'https://img.youtube.com/vi/PLd3-CCCcbQeJSROdd9rf5YV996HwYdEDL/maxresdefault.jpg',
   'PLd3-CCCcbQeJSROdd9rf5YV996HwYdEDL', 90, 8.1, 'TV-Y7'),
   
  ('youtube:tv:courage-full', 'tv_show', 'video',
   'Courage the Cowardly Dog Full Episodes',
   'A timid dog protects his owners from supernatural threats in Nowhere.',
   1999, 14400,
   'https://img.youtube.com/vi/PLLIU9nFd9IrGmATWUdDgpsMzTAMgDXrNp/maxresdefault.jpg',
   'https://img.youtube.com/vi/PLLIU9nFd9IrGmATWUdDgpsMzTAMgDXrNp/maxresdefault.jpg',
   'PLLIU9nFd9IrGmATWUdDgpsMzTAMgDXrNp', 89, 8.3, 'TV-Y7'),
   
  ('youtube:tv:ed-edd-eddy', 'tv_show', 'video',
   'Ed, Edd n Eddy',
   'Three friends run scams in their cul-de-sac to buy jawbreakers. Cartoon Network.',
   1999, 14400,
   'https://img.youtube.com/vi/X-HRLChOTOA/maxresdefault.jpg',
   'https://img.youtube.com/vi/X-HRLChOTOA/maxresdefault.jpg',
   'X-HRLChOTOA', 87, 7.8, 'TV-Y7'),
   
  ('youtube:tv:dexters-lab', 'tv_show', 'video',
   'Dexter''s Laboratory',
   'A boy genius runs a secret lab while avoiding his sister Dee Dee. Genndy Tartakovsky.',
   1996, 14400,
   'https://img.youtube.com/vi/3bLNQgRn-Wg/maxresdefault.jpg',
   'https://img.youtube.com/vi/3bLNQgRn-Wg/maxresdefault.jpg',
   '3bLNQgRn-Wg', 88, 7.9, 'TV-Y7'),
   
  ('youtube:tv:powerpuff-girls', 'tv_show', 'video',
   'The Powerpuff Girls',
   'Three super-powered kindergartners protect Townsville. Craig McCracken classic.',
   1998, 14400,
   'https://img.youtube.com/vi/c0KlvkCKpE4/maxresdefault.jpg',
   'https://img.youtube.com/vi/c0KlvkCKpE4/maxresdefault.jpg',
   'c0KlvkCKpE4', 86, 7.5, 'TV-Y7'),
   
  ('youtube:tv:recess-episodes', 'tv_show', 'video',
   'Recess',
   'A group of fourth-graders navigate playground politics. Disney animated series.',
   1997, 14400,
   'https://img.youtube.com/vi/-UtUuT8AJjQ/maxresdefault.jpg',
   'https://img.youtube.com/vi/-UtUuT8AJjQ/maxresdefault.jpg',
   '-UtUuT8AJjQ', 85, 7.7, 'TV-Y7'),
   
  ('youtube:tv:thats-so-raven', 'tv_show', 'video',
   'That''s So Raven',
   'A teen psychic sees visions of the future. Disney Channel classic.',
   2003, 14400,
   'https://img.youtube.com/vi/Tr7FcIvjVc4/maxresdefault.jpg',
   'https://img.youtube.com/vi/Tr7FcIvjVc4/maxresdefault.jpg',
   'Tr7FcIvjVc4', 84, 7.3, 'TV-G'),
   
  ('youtube:movie:casper-christmas', 'movie', 'video',
   'Casper''s Haunted Christmas',
   'Casper must scare someone or be banished to the dark. Animated holiday special.',
   2000, 4500,
   'https://img.youtube.com/vi/hr2rI0qn5EA/maxresdefault.jpg',
   'https://img.youtube.com/vi/hr2rI0qn5EA/maxresdefault.jpg',
   'hr2rI0qn5EA', 75, 5.8, 'G')
   
ON CONFLICT (canonical_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  poster_url = EXCLUDED.poster_url,
  backdrop_url = EXCLUDED.backdrop_url,
  popularity_score = EXCLUDED.popularity_score,
  updated_at = NOW();

-- =====================================================================
-- ADDITIONAL TRENDING / VARIETY CONTENT (10+ titles)
-- =====================================================================

INSERT INTO public.media_nodes (
  canonical_id, media_type, category, title, description, release_year,
  duration_seconds, poster_url, backdrop_url, youtube_id, popularity_score,
  average_rating, content_rating
) VALUES
  ('youtube:movie:django-unchained-style', 'movie', 'video',
   'Django (1966)',
   'A mysterious gunfighter drags a coffin through the Old West. Spaghetti Western classic.',
   1966, 5520,
   'https://img.youtube.com/vi/ZxHLuzOnVNo/maxresdefault.jpg',
   'https://img.youtube.com/vi/ZxHLuzOnVNo/maxresdefault.jpg',
   'ZxHLuzOnVNo', 83, 7.2, 'R'),
   
  ('youtube:movie:first-sunday-full', 'movie', 'video',
   'First Sunday (2008)',
   'Two petty criminals plan to rob a church. Ice Cube, Tracy Morgan comedy.',
   2008, 5760,
   'https://img.youtube.com/vi/3Aky7idipRk/maxresdefault.jpg',
   'https://img.youtube.com/vi/3Aky7idipRk/maxresdefault.jpg',
   '3Aky7idipRk', 77, 5.0, 'PG-13'),
   
  ('youtube:movie:norbit-full', 'movie', 'video',
   'Norbit (2007)',
   'Eddie Murphy plays multiple roles in this comedy about an adopted man and his wife.',
   2007, 6000,
   'https://img.youtube.com/vi/-lbDPdksl-E/maxresdefault.jpg',
   'https://img.youtube.com/vi/-lbDPdksl-E/maxresdefault.jpg',
   '-lbDPdksl-E', 74, 4.2, 'PG-13'),
   
  ('youtube:movie:free-movies-shows', 'tv_show', 'video',
   'Free Movies & Shows Playlist',
   'Curated collection of free full-length movies and TV shows on YouTube.',
   2020, 36000,
   'https://img.youtube.com/vi/PLX9_I-EOJPdHZJDzvjjRjpj86ClhZSsVm/maxresdefault.jpg',
   'https://img.youtube.com/vi/PLX9_I-EOJPdHZJDzvjjRjpj86ClhZSsVm/maxresdefault.jpg',
   'PLX9_I-EOJPdHZJDzvjjRjpj86ClhZSsVm', 80, 7.0, 'TV-14')
   
ON CONFLICT (canonical_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  poster_url = EXCLUDED.poster_url,
  backdrop_url = EXCLUDED.backdrop_url,
  popularity_score = EXCLUDED.popularity_score,
  updated_at = NOW();

-- =====================================================================
-- STEP 3: TAG MEDIA NODES (Create relationships for rail queries)
-- =====================================================================

-- Helper function to get tag ID by slug (if not exists)
DO $$
BEGIN
  -- Black Cinema tags
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'black-cinema'
  AND mn.canonical_id IN (
    'youtube:movie:shaft-1971', 'youtube:movie:superfly-1972', 'youtube:movie:foxy-brown-1974',
    'youtube:movie:coffy-1973', 'youtube:movie:cleopatra-jones-1973', 'youtube:movie:cotton-comes-harlem-1970',
    'youtube:movie:blacula-1972', 'youtube:movie:black-caesar-1973', 'youtube:movie:three-hard-way-1974',
    'youtube:movie:cooley-high-1975', 'youtube:movie:car-wash-1976', 'youtube:movie:sparkle-1976',
    'youtube:movie:which-way-up-1977', 'youtube:movie:a-piece-action-1977', 'youtube:movie:the-wiz-1978',
    'youtube:movie:bustin-loose-1981', 'youtube:movie:coming-america-1988', 'youtube:movie:house-party-1990',
    'youtube:movie:new-jack-city-1991', 'youtube:movie:boyz-n-hood-1991', 'youtube:movie:juice-1992',
    'youtube:movie:menace-ii-society-1993', 'youtube:movie:poetic-justice-1993', 'youtube:movie:friday-1995',
    'youtube:movie:set-it-off-1996', 'youtube:movie:soul-food-1997', 'youtube:movie:love-jones-1997',
    'youtube:movie:belly-1998', 'youtube:movie:the-wood-1999', 'youtube:movie:atl-2006'
  )
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- 90s tags
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'nineties'
  AND (mn.release_year BETWEEN 1990 AND 1999)
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Action tags
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'action'
  AND mn.canonical_id IN (
    'youtube:movie:die-hard-1988', 'youtube:movie:predator-1987', 'youtube:movie:robocop-1987',
    'youtube:movie:total-recall-1990', 'youtube:movie:commando-1985', 'youtube:movie:rambo-first-blood-1982',
    'youtube:movie:under-siege-1992', 'youtube:movie:passenger-57-1992', 'youtube:movie:hard-target-1993',
    'youtube:movie:cliffhanger-1993', 'youtube:movie:executive-decision-1996', 'youtube:movie:long-kiss-goodnight-1996',
    'youtube:movie:air-force-one-1997', 'youtube:movie:the-negotiator-1998', 'youtube:movie:replacement-killers-1998',
    'youtube:movie:terminator2-1991', 'youtube:movie:point-break-1991', 'youtube:movie:demolition-man-1993',
    'youtube:movie:true-lies-1994', 'youtube:movie:speed-1994', 'youtube:movie:bad-boys-1995',
    'youtube:movie:money-train-1995', 'youtube:movie:the-rock-1996', 'youtube:movie:con-air-1997',
    'youtube:movie:face-off-1997', 'youtube:movie:blade-1998', 'youtube:movie:lethal-weapon-4-1998',
    'youtube:movie:rush-hour-1998', 'youtube:movie:the-matrix-1999', 'youtube:movie:three-hard-way-1974'
  )
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Sci-Fi tags
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'sci-fi'
  AND mn.canonical_id IN (
    'youtube:movie:alien-1979', 'youtube:movie:aliens-1986', 'youtube:movie:blade-runner-1982',
    'youtube:movie:the-thing-1982', 'youtube:movie:2001-space-odyssey-1968', 'youtube:movie:close-encounters-1977',
    'youtube:movie:et-1982', 'youtube:movie:back-future-1985', 'youtube:movie:war-of-worlds-1953',
    'youtube:movie:forbidden-planet-1956', 'youtube:movie:invasion-body-snatchers-1956',
    'youtube:movie:day-earth-stood-still-1951', 'youtube:movie:logan-run-1976', 'youtube:movie:soylent-green-1973',
    'youtube:movie:westworld-1973', 'youtube:movie:terminator2-1991', 'youtube:movie:total-recall-1990',
    'youtube:movie:robocop-1987', 'youtube:movie:predator-1987', 'youtube:movie:the-matrix-1999',
    'youtube:movie:demolition-man-1993'
  )
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Animation tags
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'animation'
  AND mn.canonical_id IN (
    'youtube:movie:heavy-metal-1981', 'youtube:movie:akira-1988', 'youtube:movie:ghost-shell-1995',
    'youtube:movie:spirited-away-2001', 'youtube:movie:princess-mononoke-1997', 'youtube:movie:iron-giant-1999',
    'youtube:movie:ninja-scroll-1993', 'youtube:movie:vampire-hunter-d-1985', 'youtube:movie:secret-nimh-1982',
    'youtube:movie:american-tail-1986', 'youtube:movie:land-before-time-1988', 'youtube:movie:all-dogs-heaven-1989',
    'youtube:movie:watership-down-1978', 'youtube:movie:beavis-butthead-america-1996', 'youtube:movie:south-park-movie-1999',
    'youtube:tv:spongebob-marathon', 'youtube:tv:nicktoons-episodes', 'youtube:tv:catdog-full',
    'youtube:tv:animaniacs-full', 'youtube:tv:courage-full', 'youtube:tv:ed-edd-eddy',
    'youtube:tv:dexters-lab', 'youtube:tv:powerpuff-girls', 'youtube:tv:recess-episodes',
    'youtube:movie:casper-christmas', 'youtube:movie:the-wiz-1978'
  )
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Kids/Family tags
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'kids'
  AND mn.canonical_id IN (
    'youtube:tv:spongebob-marathon', 'youtube:tv:nicktoons-episodes', 'youtube:tv:catdog-full',
    'youtube:tv:animaniacs-full', 'youtube:tv:courage-full', 'youtube:tv:ed-edd-eddy',
    'youtube:tv:dexters-lab', 'youtube:tv:powerpuff-girls', 'youtube:tv:recess-episodes',
    'youtube:tv:thats-so-raven', 'youtube:movie:casper-christmas', 'youtube:movie:land-before-time-1988',
    'youtube:movie:american-tail-1986', 'youtube:movie:all-dogs-heaven-1989', 'youtube:movie:secret-nimh-1982',
    'youtube:movie:iron-giant-1999', 'youtube:movie:spirited-away-2001', 'youtube:movie:the-wiz-1978',
    'youtube:movie:et-1982', 'youtube:movie:back-future-1985'
  )
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Trending tags (high popularity)
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'trending'
  AND mn.popularity_score >= 85
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Comedy tags
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'comedy'
  AND mn.canonical_id IN (
    'youtube:movie:friday-1995', 'youtube:movie:house-party-1990', 'youtube:movie:coming-america-1988',
    'youtube:movie:car-wash-1976', 'youtube:movie:which-way-up-1977', 'youtube:movie:a-piece-action-1977',
    'youtube:movie:bustin-loose-1981', 'youtube:movie:american-pie-1999', 'youtube:movie:big-daddy-1999',
    'youtube:movie:austin-powers-1997', 'youtube:movie:there-something-mary-1998', 'youtube:movie:analyze-this-1999',
    'youtube:movie:rush-hour-1998', 'youtube:movie:bad-boys-1995', 'youtube:movie:norbit-full',
    'youtube:movie:first-sunday-full', 'youtube:movie:beavis-butthead-america-1996', 'youtube:movie:south-park-movie-1999',
    'youtube:tv:fresh-prince-s1', 'youtube:tv:martin-s1', 'youtube:tv:living-single-s1',
    'youtube:tv:good-times-s1', 'youtube:tv:sanford-son-s1', 'youtube:tv:the-jeffersons-s1',
    'youtube:tv:whats-happening-s1', 'youtube:tv:227-s1', 'youtube:tv:amen-s1',
    'youtube:tv:family-matters-s1', 'youtube:tv:in-living-color-s1'
  )
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Drama tags
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'drama'
  AND mn.canonical_id IN (
    'youtube:movie:boyz-n-hood-1991', 'youtube:movie:menace-ii-society-1993', 'youtube:movie:juice-1992',
    'youtube:movie:new-jack-city-1991', 'youtube:movie:poetic-justice-1993', 'youtube:movie:set-it-off-1996',
    'youtube:movie:soul-food-1997', 'youtube:movie:love-jones-1997', 'youtube:movie:belly-1998',
    'youtube:movie:the-wood-1999', 'youtube:movie:atl-2006', 'youtube:movie:cooley-high-1975',
    'youtube:movie:sparkle-1976', 'youtube:movie:fight-club-1999', 'youtube:movie:blade-runner-1982',
    'youtube:movie:2001-space-odyssey-1968'
  )
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Thriller tags
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'thriller'
  AND mn.canonical_id IN (
    'youtube:movie:alien-1979', 'youtube:movie:the-thing-1982', 'youtube:movie:the-negotiator-1998',
    'youtube:movie:executive-decision-1996', 'youtube:movie:passenger-57-1992', 'youtube:movie:speed-1994',
    'youtube:movie:face-off-1997', 'youtube:movie:air-force-one-1997', 'youtube:movie:fight-club-1999',
    'youtube:movie:the-matrix-1999', 'youtube:movie:belly-1998', 'youtube:movie:new-jack-city-1991',
    'youtube:movie:set-it-off-1996', 'youtube:movie:menace-ii-society-1993'
  )
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Black TV Shows tag
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'black-cinema'
  AND mn.canonical_id IN (
    'youtube:tv:fresh-prince-s1', 'youtube:tv:martin-s1', 'youtube:tv:living-single-s1',
    'youtube:tv:good-times-s1', 'youtube:tv:sanford-son-s1', 'youtube:tv:the-jeffersons-s1',
    'youtube:tv:whats-happening-s1', 'youtube:tv:227-s1', 'youtube:tv:amen-s1',
    'youtube:tv:a-different-world-s1', 'youtube:tv:cosby-show-s1', 'youtube:tv:family-matters-s1',
    'youtube:tv:moesha-s1', 'youtube:tv:sister-sister-s1', 'youtube:tv:in-living-color-s1',
    'youtube:tv:thats-so-raven'
  )
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Full Season tag
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'full-season'
  AND mn.media_type = 'tv_season'
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Full Movie tag
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'full-movie'
  AND mn.media_type = 'movie'
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- Classic tag (pre-1980)
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'classic'
  AND mn.release_year < 1980
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- 80s tag
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'eighties'
  AND (mn.release_year BETWEEN 1980 AND 1989)
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

  -- 70s tag
  INSERT INTO public.media_node_tags (media_node_id, tag_id, relevance)
  SELECT mn.id, mt.id, 1.0
  FROM public.media_nodes mn
  CROSS JOIN public.media_tags mt
  WHERE mt.slug = 'seventies'
  AND (mn.release_year BETWEEN 1970 AND 1979)
  ON CONFLICT (media_node_id, tag_id) DO NOTHING;

END $$;

-- =====================================================================
-- VERIFICATION QUERIES (Run manually to confirm)
-- =====================================================================

-- Count by category
-- SELECT media_type, category, COUNT(*) FROM media_nodes WHERE canonical_id LIKE 'youtube:%' GROUP BY media_type, category;

-- Count by tag
-- SELECT mt.name, mt.slug, COUNT(mnt.id) as count
-- FROM media_tags mt
-- LEFT JOIN media_node_tags mnt ON mt.id = mnt.tag_id
-- GROUP BY mt.id, mt.name, mt.slug
-- ORDER BY count DESC;

-- =====================================================================
-- ROLLBACK (Execute to remove seeded data)
-- =====================================================================

-- DELETE FROM media_node_tags WHERE media_node_id IN (SELECT id FROM media_nodes WHERE canonical_id LIKE 'youtube:%');
-- DELETE FROM media_nodes WHERE canonical_id LIKE 'youtube:%';
-- DELETE FROM media_tags WHERE slug IN ('black-cinema', 'trending', 'nineties', 'eighties', 'seventies', 'classic', 'full-movie', 'full-season', 'new-release', 'staff-pick', 'hidden-gem', 'cult-classic', 'crowd-favorite', 'feel-good', 'intense', 'thought-provoking', 'nostalgic', 'inspiring', 'blaxploitation', 'urban');
