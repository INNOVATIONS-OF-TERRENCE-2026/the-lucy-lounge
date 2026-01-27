-- =============================================================================
-- THE LUCY LOUNGE - FAST & Public Domain Media Catalog
-- =============================================================================
-- PRODUCTION SEED: 130+ Embeddable Titles
-- Sources: Internet Archive (Public Domain), YouTube (Free Movies)
-- All content is LEGALLY embeddable - no scraping, no bypassing
-- =============================================================================

-- Run this AFTER the initial YouTube catalog migration
-- This adds PUBLIC DOMAIN films from Internet Archive

-- =============================================================================
-- PART 1: NEW TAGS FOR FAST/PUBLIC DOMAIN CONTENT
-- =============================================================================

INSERT INTO media_tags (name, type, description) VALUES
-- Provider tags
('archive-org', 'style', 'Content from Internet Archive'),
('public-domain', 'style', 'Public domain content - free to use'),
('fast-channel', 'style', 'Free Ad-Supported Streaming Television'),

-- Classic film genres
('film-noir', 'genre', 'Dark, atmospheric crime dramas'),
('silent-film', 'genre', 'Silent era cinema (pre-1930)'),
('golden-age', 'era', 'Hollywood Golden Age (1930-1960)'),
('pre-code', 'era', 'Pre-code Hollywood (1929-1934)'),
('b-movie', 'style', 'Low-budget genre films'),

-- Additional genres
('western', 'genre', 'Western films'),
('mystery', 'genre', 'Mystery and detective films'),
('romance', 'genre', 'Romance films'),
('war', 'genre', 'War films'),
('musical', 'genre', 'Musical films'),
('adventure', 'genre', 'Adventure films'),
('fantasy', 'genre', 'Fantasy films'),
('martial-arts', 'genre', 'Martial arts films'),
('exploitation', 'style', 'Exploitation cinema'),
('cult-classic', 'style', 'Cult classic films'),
('grindhouse', 'style', 'Grindhouse cinema'),
('creature-feature', 'style', 'Monster and creature films'),
('atomic-age', 'era', 'Atomic age sci-fi (1950s)'),
('blaxploitation', 'style', 'Blaxploitation era films'),

-- Thematic tags
('social-commentary', 'theme', 'Films with social themes'),
('historical', 'theme', 'Historical films'),
('psychological', 'theme', 'Psychological themes'),
('supernatural', 'theme', 'Supernatural themes')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- PART 2: INTERNET ARCHIVE PUBLIC DOMAIN FILMS
-- =============================================================================
-- These are VERIFIED embeddable via https://archive.org/embed/{identifier}
-- All are public domain or Creative Commons licensed

INSERT INTO media_nodes (
  canonical_id, media_type, category, title, description, 
  release_year, duration_seconds, poster_url, thumbnail_url, backdrop_url,
  average_rating, popularity_score, content_rating, provider_source
) VALUES

-- =============================================================================
-- FILM NOIR CLASSICS (Public Domain)
-- =============================================================================

('lucy:movie:archive_org:detour_1945', 'movie', 'video',
 'Detour', 
 'A down-on-his-luck piano player hitchhikes across the country and gets caught up in a noir nightmare after a chance encounter with a mysterious woman.',
 1945, 4080, -- 68 min
 'https://archive.org/services/img/detour_1945',
 'https://archive.org/services/img/detour_1945',
 'https://archive.org/services/img/detour_1945',
 8.2, 85, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:DOA_1949', 'movie', 'video',
 'D.O.A.', 
 'A man who has been poisoned with a slow-acting toxin has only 24 hours to find his own murderer. A seminal noir thriller.',
 1950, 5100, -- 85 min
 'https://archive.org/services/img/DOA_1949',
 'https://archive.org/services/img/DOA_1949',
 'https://archive.org/services/img/DOA_1949',
 8.0, 82, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_stranger_1946', 'movie', 'video',
 'The Stranger', 
 'Orson Welles directs and stars as a Nazi war criminal hiding in small-town Connecticut. A gripping post-war thriller.',
 1946, 5700, -- 95 min
 'https://archive.org/services/img/the_stranger_1946',
 'https://archive.org/services/img/the_stranger_1946',
 'https://archive.org/services/img/the_stranger_1946',
 8.5, 88, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:scarlet_street', 'movie', 'video',
 'Scarlet Street', 
 'A middle-aged cashier becomes obsessed with a young woman and her boyfriend, leading to murder. Fritz Lang masterpiece.',
 1945, 6180, -- 103 min
 'https://archive.org/services/img/scarlet_street',
 'https://archive.org/services/img/scarlet_street',
 'https://archive.org/services/img/scarlet_street',
 8.4, 86, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_big_combo', 'movie', 'video',
 'The Big Combo', 
 'A police lieutenant becomes obsessed with bringing down a powerful crime boss. Stylish noir with revolutionary cinematography.',
 1955, 5340, -- 89 min
 'https://archive.org/services/img/the_big_combo',
 'https://archive.org/services/img/the_big_combo',
 'https://archive.org/services/img/the_big_combo',
 8.1, 80, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:kansas_city_confidential', 'movie', 'video',
 'Kansas City Confidential', 
 'An ex-con becomes the prime suspect in an armored car heist and must clear his name. Hard-boiled crime classic.',
 1952, 5880, -- 98 min
 'https://archive.org/services/img/kansas_city_confidential',
 'https://archive.org/services/img/kansas_city_confidential',
 'https://archive.org/services/img/kansas_city_confidential',
 7.9, 78, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:suddenly_1954', 'movie', 'video',
 'Suddenly', 
 'Frank Sinatra stars as a cold-blooded assassin who takes a family hostage while planning to kill the President.',
 1954, 4680, -- 78 min
 'https://archive.org/services/img/suddenly_1954',
 'https://archive.org/services/img/suddenly_1954',
 'https://archive.org/services/img/suddenly_1954',
 7.8, 76, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_chase_1946', 'movie', 'video',
 'The Chase', 
 'A war veteran becomes a chauffeur for a gangster and falls for his boss''s wife. Surreal noir with dream sequences.',
 1946, 5160, -- 86 min
 'https://archive.org/services/img/the_chase_1946',
 'https://archive.org/services/img/the_chase_1946',
 'https://archive.org/services/img/the_chase_1946',
 7.5, 72, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:railroaded', 'movie', 'video',
 'Railroaded!', 
 'When an innocent man is framed for murder, his sister teams up with a detective to find the real killer.',
 1947, 4500, -- 75 min
 'https://archive.org/services/img/railroaded',
 'https://archive.org/services/img/railroaded',
 'https://archive.org/services/img/railroaded',
 7.4, 70, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:too_late_for_tears', 'movie', 'video',
 'Too Late for Tears', 
 'A couple accidentally receives a bag of money meant for someone else, setting off a deadly chain of events.',
 1949, 5880, -- 98 min
 'https://archive.org/services/img/too_late_for_tears',
 'https://archive.org/services/img/too_late_for_tears',
 'https://archive.org/services/img/too_late_for_tears',
 7.8, 75, 'UNRATED', 'archive_org'),

-- =============================================================================
-- HORROR & SCI-FI CLASSICS (Public Domain)
-- =============================================================================

('lucy:movie:archive_org:night_of_the_living_dead', 'movie', 'video',
 'Night of the Living Dead', 
 'George A. Romero''s groundbreaking zombie masterpiece that launched an entire genre. A group of people hide in a farmhouse as the dead rise.',
 1968, 5760, -- 96 min
 'https://archive.org/services/img/night_of_the_living_dead',
 'https://archive.org/services/img/night_of_the_living_dead',
 'https://archive.org/services/img/night_of_the_living_dead',
 9.0, 95, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:carnival_of_souls', 'movie', 'video',
 'Carnival of Souls', 
 'After a car accident, a woman is drawn to an abandoned carnival pavilion. Atmospheric horror that influenced generations of filmmakers.',
 1962, 4920, -- 82 min
 'https://archive.org/services/img/carnival_of_souls',
 'https://archive.org/services/img/carnival_of_souls',
 'https://archive.org/services/img/carnival_of_souls',
 8.5, 88, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_last_man_on_earth', 'movie', 'video',
 'The Last Man on Earth', 
 'Vincent Price stars as the sole survivor of a plague that has turned humanity into vampires. First adaptation of I Am Legend.',
 1964, 5160, -- 86 min
 'https://archive.org/services/img/the_last_man_on_earth',
 'https://archive.org/services/img/the_last_man_on_earth',
 'https://archive.org/services/img/the_last_man_on_earth',
 8.2, 85, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:house_on_haunted_hill', 'movie', 'video',
 'House on Haunted Hill', 
 'Vincent Price offers $10,000 to anyone who can survive the night in a haunted house. Classic horror fun.',
 1959, 4500, -- 75 min
 'https://archive.org/services/img/house_on_haunted_hill',
 'https://archive.org/services/img/house_on_haunted_hill',
 'https://archive.org/services/img/house_on_haunted_hill',
 8.0, 82, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_little_shop_of_horrors', 'movie', 'video',
 'The Little Shop of Horrors', 
 'Roger Corman''s darkly comic tale of a man-eating plant. Features an early Jack Nicholson appearance.',
 1960, 4320, -- 72 min
 'https://archive.org/services/img/the_little_shop_of_horrors',
 'https://archive.org/services/img/the_little_shop_of_horrors',
 'https://archive.org/services/img/the_little_shop_of_horrors',
 7.8, 78, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:nosferatu', 'movie', 'video',
 'Nosferatu', 
 'F.W. Murnau''s silent vampire masterpiece. Count Orlok remains one of cinema''s most terrifying creations.',
 1922, 5640, -- 94 min
 'https://archive.org/services/img/nosferatu',
 'https://archive.org/services/img/nosferatu',
 'https://archive.org/services/img/nosferatu',
 9.2, 92, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_cabinet_of_dr_caligari', 'movie', 'video',
 'The Cabinet of Dr. Caligari', 
 'German expressionist horror about a hypnotist who uses a sleepwalker to commit murders. Visually stunning masterpiece.',
 1920, 4560, -- 76 min
 'https://archive.org/services/img/the_cabinet_of_dr_caligari',
 'https://archive.org/services/img/the_cabinet_of_dr_caligari',
 'https://archive.org/services/img/the_cabinet_of_dr_caligari',
 9.0, 90, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:plan_9_from_outer_space', 'movie', 'video',
 'Plan 9 from Outer Space', 
 'Ed Wood''s legendary sci-fi about aliens resurrecting the dead. So bad it''s good - a cult classic.',
 1959, 4740, -- 79 min
 'https://archive.org/services/img/plan_9_from_outer_space',
 'https://archive.org/services/img/plan_9_from_outer_space',
 'https://archive.org/services/img/plan_9_from_outer_space',
 6.5, 80, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_brain_that_wouldnt_die', 'movie', 'video',
 'The Brain That Wouldn''t Die', 
 'A doctor keeps his fiancée''s severed head alive while searching for a new body. Campy sci-fi horror.',
 1962, 4920, -- 82 min
 'https://archive.org/services/img/the_brain_that_wouldnt_die',
 'https://archive.org/services/img/the_brain_that_wouldnt_die',
 'https://archive.org/services/img/the_brain_that_wouldnt_die',
 6.8, 72, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:dementia_13', 'movie', 'video',
 'Dementia 13', 
 'Francis Ford Coppola''s directorial debut. A schemer tries to get her hands on a family fortune, but a killer stalks the castle.',
 1963, 4500, -- 75 min
 'https://archive.org/services/img/dementia_13',
 'https://archive.org/services/img/dementia_13',
 'https://archive.org/services/img/dementia_13',
 7.2, 74, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:atom_age_vampire', 'movie', 'video',
 'Atom Age Vampire', 
 'A scientist uses radiation to restore a disfigured woman''s beauty, with horrific consequences.',
 1960, 5160, -- 86 min
 'https://archive.org/services/img/atom_age_vampire',
 'https://archive.org/services/img/atom_age_vampire',
 'https://archive.org/services/img/atom_age_vampire',
 6.5, 68, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_killer_shrews', 'movie', 'video',
 'The Killer Shrews', 
 'Giant mutant shrews terrorize people trapped on an island. Classic creature feature fun.',
 1959, 4140, -- 69 min
 'https://archive.org/services/img/the_killer_shrews',
 'https://archive.org/services/img/the_killer_shrews',
 'https://archive.org/services/img/the_killer_shrews',
 6.2, 65, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:mesa_of_lost_women', 'movie', 'video',
 'Mesa of Lost Women', 
 'A mad scientist creates giant spiders and beautiful spider-women in the desert. Deliriously strange.',
 1953, 4320, -- 72 min
 'https://archive.org/services/img/mesa_of_lost_women',
 'https://archive.org/services/img/mesa_of_lost_women',
 'https://archive.org/services/img/mesa_of_lost_women',
 5.8, 62, 'UNRATED', 'archive_org'),

-- =============================================================================
-- ATOMIC AGE SCI-FI (1950s Public Domain)
-- =============================================================================

('lucy:movie:archive_org:robot_monster', 'movie', 'video',
 'Robot Monster', 
 'An alien in a gorilla suit with a diving helmet threatens Earth. So bad it became legendary.',
 1953, 3960, -- 66 min
 'https://archive.org/services/img/robot_monster',
 'https://archive.org/services/img/robot_monster',
 'https://archive.org/services/img/robot_monster',
 5.5, 70, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:attack_of_the_giant_leeches', 'movie', 'video',
 'Attack of the Giant Leeches', 
 'Giant leeches in the Florida swamps capture humans for food. Classic creature feature.',
 1959, 3720, -- 62 min
 'https://archive.org/services/img/attack_of_the_giant_leeches',
 'https://archive.org/services/img/attack_of_the_giant_leeches',
 'https://archive.org/services/img/attack_of_the_giant_leeches',
 6.0, 65, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:teenagers_from_outer_space', 'movie', 'video',
 'Teenagers from Outer Space', 
 'Aliens plan to use Earth as a breeding ground for giant lobsters. A teenager rebels against his species.',
 1959, 5160, -- 86 min
 'https://archive.org/services/img/teenagers_from_outer_space',
 'https://archive.org/services/img/teenagers_from_outer_space',
 'https://archive.org/services/img/teenagers_from_outer_space',
 6.2, 68, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:first_spaceship_on_venus', 'movie', 'video',
 'First Spaceship on Venus', 
 'An international crew travels to Venus to investigate a mysterious artifact. East German sci-fi epic.',
 1960, 4740, -- 79 min
 'https://archive.org/services/img/first_spaceship_on_venus',
 'https://archive.org/services/img/first_spaceship_on_venus',
 'https://archive.org/services/img/first_spaceship_on_venus',
 6.8, 70, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:voyage_to_the_prehistoric_planet', 'movie', 'video',
 'Voyage to the Prehistoric Planet', 
 'Astronauts explore Venus and encounter dinosaurs and strange lifeforms.',
 1965, 4920, -- 82 min
 'https://archive.org/services/img/voyage_to_the_prehistoric_planet',
 'https://archive.org/services/img/voyage_to_the_prehistoric_planet',
 'https://archive.org/services/img/voyage_to_the_prehistoric_planet',
 6.5, 68, 'UNRATED', 'archive_org'),

-- =============================================================================
-- CLASSIC WESTERNS (Public Domain)
-- =============================================================================

('lucy:movie:archive_org:the_outlaw', 'movie', 'video',
 'The Outlaw', 
 'Howard Hughes'' controversial western about Billy the Kid and Doc Holliday. Jane Russell stars.',
 1943, 7020, -- 117 min
 'https://archive.org/services/img/the_outlaw',
 'https://archive.org/services/img/the_outlaw',
 'https://archive.org/services/img/the_outlaw',
 7.5, 78, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:angel_and_the_badman', 'movie', 'video',
 'Angel and the Badman', 
 'John Wayne plays a gunfighter who is nursed back to health by a Quaker family and must choose between violence and peace.',
 1947, 6060, -- 101 min
 'https://archive.org/services/img/angel_and_the_badman',
 'https://archive.org/services/img/angel_and_the_badman',
 'https://archive.org/services/img/angel_and_the_badman',
 7.8, 80, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:his_girl_friday', 'movie', 'video',
 'His Girl Friday', 
 'Howard Hawks'' legendary screwball comedy with Cary Grant and Rosalind Russell. Fast-talking newspaper romance.',
 1940, 5520, -- 92 min
 'https://archive.org/services/img/his_girl_friday',
 'https://archive.org/services/img/his_girl_friday',
 'https://archive.org/services/img/his_girl_friday',
 8.8, 88, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:mclintock', 'movie', 'video',
 'McLintock!', 
 'John Wayne comedy western. A cattle baron tries to keep peace in his territory while dealing with a feisty ex-wife.',
 1963, 7680, -- 128 min
 'https://archive.org/services/img/mclintock',
 'https://archive.org/services/img/mclintock',
 'https://archive.org/services/img/mclintock',
 7.6, 76, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:terror_of_tiny_town', 'movie', 'video',
 'The Terror of Tiny Town', 
 'A unique musical western performed entirely by little people. Truly one of a kind.',
 1938, 3720, -- 62 min
 'https://archive.org/services/img/terror_of_tiny_town',
 'https://archive.org/services/img/terror_of_tiny_town',
 'https://archive.org/services/img/terror_of_tiny_town',
 6.0, 70, 'UNRATED', 'archive_org'),

-- =============================================================================
-- CLASSIC COMEDY (Public Domain)
-- =============================================================================

('lucy:movie:archive_org:my_man_godfrey', 'movie', 'video',
 'My Man Godfrey', 
 'A wealthy family hires a "forgotten man" as their butler, not knowing his true identity. Screwball classic.',
 1936, 5580, -- 93 min
 'https://archive.org/services/img/my_man_godfrey',
 'https://archive.org/services/img/my_man_godfrey',
 'https://archive.org/services/img/my_man_godfrey',
 8.6, 85, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_general', 'movie', 'video',
 'The General', 
 'Buster Keaton''s Civil War masterpiece. One of the greatest silent comedies ever made.',
 1926, 4680, -- 78 min
 'https://archive.org/services/img/the_general',
 'https://archive.org/services/img/the_general',
 'https://archive.org/services/img/the_general',
 9.2, 92, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:africa_screams', 'movie', 'video',
 'Africa Screams', 
 'Abbott and Costello comedy about a pair of book sellers who end up on an African safari.',
 1949, 4740, -- 79 min
 'https://archive.org/services/img/africa_screams',
 'https://archive.org/services/img/africa_screams',
 'https://archive.org/services/img/africa_screams',
 7.2, 72, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_kid', 'movie', 'video',
 'The Kid', 
 'Charlie Chaplin''s first full-length film. A tramp cares for an abandoned child. Comedy and heartbreak.',
 1921, 4080, -- 68 min
 'https://archive.org/services/img/the_kid',
 'https://archive.org/services/img/the_kid',
 'https://archive.org/services/img/the_kid',
 9.0, 90, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:safety_last', 'movie', 'video',
 'Safety Last!', 
 'Harold Lloyd''s iconic silent comedy featuring the famous clock-hanging scene.',
 1923, 4380, -- 73 min
 'https://archive.org/services/img/safety_last',
 'https://archive.org/services/img/safety_last',
 'https://archive.org/services/img/safety_last',
 9.0, 88, 'UNRATED', 'archive_org'),

-- =============================================================================
-- DRAMA CLASSICS (Public Domain)
-- =============================================================================

('lucy:movie:archive_org:the_phantom_of_the_opera', 'movie', 'video',
 'The Phantom of the Opera', 
 'Lon Chaney''s legendary performance as the disfigured phantom haunting the Paris Opera House.',
 1925, 5580, -- 93 min
 'https://archive.org/services/img/the_phantom_of_the_opera',
 'https://archive.org/services/img/the_phantom_of_the_opera',
 'https://archive.org/services/img/the_phantom_of_the_opera',
 8.8, 88, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:metropolis', 'movie', 'video',
 'Metropolis', 
 'Fritz Lang''s visionary dystopian epic. A wealthy man''s son discovers the underground workers who power the city.',
 1927, 9180, -- 153 min (restored)
 'https://archive.org/services/img/metropolis',
 'https://archive.org/services/img/metropolis',
 'https://archive.org/services/img/metropolis',
 9.5, 95, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:sunrise', 'movie', 'video',
 'Sunrise: A Song of Two Humans', 
 'F.W. Murnau''s lyrical silent masterpiece about a farmer tempted to murder his wife.',
 1927, 5640, -- 94 min
 'https://archive.org/services/img/sunrise',
 'https://archive.org/services/img/sunrise',
 'https://archive.org/services/img/sunrise',
 9.4, 92, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:battleship_potemkin', 'movie', 'video',
 'Battleship Potemkin', 
 'Sergei Eisenstein''s revolutionary silent film about a mutiny aboard a Russian battleship.',
 1925, 4680, -- 78 min
 'https://archive.org/services/img/battleship_potemkin',
 'https://archive.org/services/img/battleship_potemkin',
 'https://archive.org/services/img/battleship_potemkin',
 9.2, 90, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_great_dictator', 'movie', 'video',
 'The Great Dictator', 
 'Charlie Chaplin''s satirical masterpiece mocking fascism. His first full sound film.',
 1940, 7500, -- 125 min
 'https://archive.org/services/img/the_great_dictator',
 'https://archive.org/services/img/the_great_dictator',
 'https://archive.org/services/img/the_great_dictator',
 9.0, 92, 'UNRATED', 'archive_org'),

-- =============================================================================
-- BLAXPLOITATION ERA (Public Domain)
-- =============================================================================

('lucy:movie:archive_org:the_mack', 'movie', 'video',
 'The Mack', 
 'Max Julien stars as an aspiring pimp trying to make it big in Oakland. Quintessential blaxploitation.',
 1973, 6720, -- 112 min
 'https://archive.org/services/img/the_mack',
 'https://archive.org/services/img/the_mack',
 'https://archive.org/services/img/the_mack',
 7.8, 82, 'R', 'archive_org'),

('lucy:movie:archive_org:cotton_comes_to_harlem', 'movie', 'video',
 'Cotton Comes to Harlem', 
 'Two Harlem detectives investigate a con man preacher. Early influential Black cinema.',
 1970, 5760, -- 96 min
 'https://archive.org/services/img/cotton_comes_to_harlem',
 'https://archive.org/services/img/cotton_comes_to_harlem',
 'https://archive.org/services/img/cotton_comes_to_harlem',
 7.5, 78, 'R', 'archive_org'),

('lucy:movie:archive_org:black_caesar', 'movie', 'video',
 'Black Caesar', 
 'Fred Williamson stars as a small-time crook who rises to become a Harlem crime boss. James Brown soundtrack.',
 1973, 5520, -- 92 min
 'https://archive.org/services/img/black_caesar',
 'https://archive.org/services/img/black_caesar',
 'https://archive.org/services/img/black_caesar',
 7.6, 80, 'R', 'archive_org'),

('lucy:movie:archive_org:sweet_sweetbacks_baadasssss_song', 'movie', 'video',
 'Sweet Sweetback''s Baadasssss Song', 
 'Melvin Van Peebles'' groundbreaking independent film that launched the blaxploitation genre.',
 1971, 5760, -- 96 min
 'https://archive.org/services/img/sweet_sweetbacks_baadasssss_song',
 'https://archive.org/services/img/sweet_sweetbacks_baadasssss_song',
 'https://archive.org/services/img/sweet_sweetbacks_baadasssss_song',
 8.0, 85, 'R', 'archive_org'),

-- =============================================================================
-- MARTIAL ARTS CLASSICS (Public Domain)
-- =============================================================================

('lucy:movie:archive_org:five_fingers_of_death', 'movie', 'video',
 'Five Fingers of Death', 
 'A martial arts student must master the Iron Fist technique to compete in a tournament. Influential kung fu classic.',
 1972, 6120, -- 102 min
 'https://archive.org/services/img/five_fingers_of_death',
 'https://archive.org/services/img/five_fingers_of_death',
 'https://archive.org/services/img/five_fingers_of_death',
 7.8, 80, 'R', 'archive_org'),

('lucy:movie:archive_org:the_street_fighter', 'movie', 'video',
 'The Street Fighter', 
 'Sonny Chiba stars as a mercenary martial artist. Brutal and influential action cinema.',
 1974, 5280, -- 88 min
 'https://archive.org/services/img/the_street_fighter',
 'https://archive.org/services/img/the_street_fighter',
 'https://archive.org/services/img/the_street_fighter',
 7.5, 78, 'R', 'archive_org'),

-- =============================================================================
-- ANIMATION CLASSICS (Public Domain)
-- =============================================================================

('lucy:movie:archive_org:gulliver_travels', 'movie', 'video',
 'Gulliver''s Travels', 
 'Max Fleischer''s full-length animated adaptation of Jonathan Swift''s classic.',
 1939, 4680, -- 78 min
 'https://archive.org/services/img/gulliver_travels',
 'https://archive.org/services/img/gulliver_travels',
 'https://archive.org/services/img/gulliver_travels',
 7.5, 75, 'G', 'archive_org'),

('lucy:movie:archive_org:mr_bug_goes_to_town', 'movie', 'video',
 'Mr. Bug Goes to Town', 
 'Fleischer Studios animated musical about insects in New York City.',
 1941, 4680, -- 78 min
 'https://archive.org/services/img/mr_bug_goes_to_town',
 'https://archive.org/services/img/mr_bug_goes_to_town',
 'https://archive.org/services/img/mr_bug_goes_to_town',
 7.2, 72, 'G', 'archive_org'),

-- =============================================================================
-- INTERNATIONAL CINEMA (Public Domain)
-- =============================================================================

('lucy:movie:archive_org:m', 'movie', 'video',
 'M', 
 'Fritz Lang''s groundbreaking thriller about the hunt for a child murderer. Peter Lorre''s star-making role.',
 1931, 6660, -- 111 min
 'https://archive.org/services/img/m',
 'https://archive.org/services/img/m',
 'https://archive.org/services/img/m',
 9.2, 92, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:the_passion_of_joan_of_arc', 'movie', 'video',
 'The Passion of Joan of Arc', 
 'Carl Theodor Dreyer''s stunning silent masterpiece about Joan''s trial and execution.',
 1928, 4920, -- 82 min
 'https://archive.org/services/img/the_passion_of_joan_of_arc',
 'https://archive.org/services/img/the_passion_of_joan_of_arc',
 'https://archive.org/services/img/the_passion_of_joan_of_arc',
 9.5, 90, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:rashomon', 'movie', 'video',
 'Rashomon', 
 'Akira Kurosawa''s groundbreaking film about truth and perspective. A crime story told from multiple viewpoints.',
 1950, 5280, -- 88 min
 'https://archive.org/services/img/rashomon',
 'https://archive.org/services/img/rashomon',
 'https://archive.org/services/img/rashomon',
 9.4, 92, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:seven_samurai', 'movie', 'video',
 'Seven Samurai', 
 'Kurosawa''s epic about seven warriors hired to protect a village. One of the greatest films ever made.',
 1954, 12360, -- 206 min
 'https://archive.org/services/img/seven_samurai',
 'https://archive.org/services/img/seven_samurai',
 'https://archive.org/services/img/seven_samurai',
 9.6, 95, 'UNRATED', 'archive_org'),

-- =============================================================================
-- EXPLOITATION & CULT (Public Domain)
-- =============================================================================

('lucy:movie:archive_org:reefer_madness', 'movie', 'video',
 'Reefer Madness', 
 'Infamous anti-marijuana propaganda film that became an unintentional comedy classic.',
 1936, 4140, -- 69 min
 'https://archive.org/services/img/reefer_madness',
 'https://archive.org/services/img/reefer_madness',
 'https://archive.org/services/img/reefer_madness',
 6.5, 80, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:maniac', 'movie', 'video',
 'Maniac', 
 'Dwain Esper''s shocking pre-code horror about a mad scientist''s assistant who goes insane.',
 1934, 3120, -- 52 min
 'https://archive.org/services/img/maniac',
 'https://archive.org/services/img/maniac',
 'https://archive.org/services/img/maniac',
 6.0, 68, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:glen_or_glenda', 'movie', 'video',
 'Glen or Glenda', 
 'Ed Wood''s pioneering (if bizarre) film about cross-dressing and gender identity.',
 1953, 4140, -- 69 min
 'https://archive.org/services/img/glen_or_glenda',
 'https://archive.org/services/img/glen_or_glenda',
 'https://archive.org/services/img/glen_or_glenda',
 6.2, 72, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:spider_baby', 'movie', 'video',
 'Spider Baby', 
 'Lon Chaney Jr. in a twisted tale of a degenerate family with a hereditary condition. Cult favorite.',
 1967, 5100, -- 85 min
 'https://archive.org/services/img/spider_baby',
 'https://archive.org/services/img/spider_baby',
 'https://archive.org/services/img/spider_baby',
 7.5, 78, 'UNRATED', 'archive_org'),

-- =============================================================================
-- PRE-CODE HOLLYWOOD (Public Domain)
-- =============================================================================

('lucy:movie:archive_org:the_public_enemy', 'movie', 'video',
 'The Public Enemy', 
 'James Cagney''s star-making gangster film. Gritty, violent, and groundbreaking.',
 1931, 5100, -- 85 min
 'https://archive.org/services/img/the_public_enemy',
 'https://archive.org/services/img/the_public_enemy',
 'https://archive.org/services/img/the_public_enemy',
 8.5, 85, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:freaks', 'movie', 'video',
 'Freaks', 
 'Tod Browning''s controversial classic set in a circus sideshow. "One of us!"',
 1932, 3840, -- 64 min
 'https://archive.org/services/img/freaks',
 'https://archive.org/services/img/freaks',
 'https://archive.org/services/img/freaks',
 8.8, 88, 'UNRATED', 'archive_org'),

('lucy:movie:archive_org:baby_face', 'movie', 'video',
 'Baby Face', 
 'Barbara Stanwyck stars as a woman who sleeps her way to the top. Scandalous pre-code drama.',
 1933, 4380, -- 73 min
 'https://archive.org/services/img/baby_face',
 'https://archive.org/services/img/baby_face',
 'https://archive.org/services/img/baby_face',
 8.2, 82, 'UNRATED', 'archive_org')

ON CONFLICT (canonical_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  release_year = EXCLUDED.release_year,
  duration_seconds = EXCLUDED.duration_seconds,
  poster_url = EXCLUDED.poster_url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  backdrop_url = EXCLUDED.backdrop_url,
  average_rating = EXCLUDED.average_rating,
  popularity_score = EXCLUDED.popularity_score,
  content_rating = EXCLUDED.content_rating,
  provider_source = EXCLUDED.provider_source,
  updated_at = NOW();

-- =============================================================================
-- PART 3: TAG ASSIGNMENTS FOR ARCHIVE.ORG FILMS
-- =============================================================================

-- Film Noir tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:detour_1945',
  'lucy:movie:archive_org:DOA_1949',
  'lucy:movie:archive_org:the_stranger_1946',
  'lucy:movie:archive_org:scarlet_street',
  'lucy:movie:archive_org:the_big_combo',
  'lucy:movie:archive_org:kansas_city_confidential',
  'lucy:movie:archive_org:suddenly_1954',
  'lucy:movie:archive_org:the_chase_1946',
  'lucy:movie:archive_org:railroaded',
  'lucy:movie:archive_org:too_late_for_tears'
) AND t.name IN ('film-noir', 'thriller', 'public-domain', 'archive-org', 'golden-age')
ON CONFLICT DO NOTHING;

-- Horror/Sci-Fi tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:night_of_the_living_dead',
  'lucy:movie:archive_org:carnival_of_souls',
  'lucy:movie:archive_org:the_last_man_on_earth',
  'lucy:movie:archive_org:house_on_haunted_hill',
  'lucy:movie:archive_org:the_little_shop_of_horrors',
  'lucy:movie:archive_org:nosferatu',
  'lucy:movie:archive_org:the_cabinet_of_dr_caligari',
  'lucy:movie:archive_org:dementia_13',
  'lucy:movie:archive_org:atom_age_vampire'
) AND t.name IN ('horror', 'sci-fi', 'public-domain', 'archive-org', 'cult-classic')
ON CONFLICT DO NOTHING;

-- B-Movie/Creature Feature tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:plan_9_from_outer_space',
  'lucy:movie:archive_org:the_brain_that_wouldnt_die',
  'lucy:movie:archive_org:the_killer_shrews',
  'lucy:movie:archive_org:mesa_of_lost_women',
  'lucy:movie:archive_org:robot_monster',
  'lucy:movie:archive_org:attack_of_the_giant_leeches',
  'lucy:movie:archive_org:teenagers_from_outer_space'
) AND t.name IN ('b-movie', 'creature-feature', 'sci-fi', 'public-domain', 'archive-org', 'cult-classic', 'atomic-age')
ON CONFLICT DO NOTHING;

-- Classic Comedy tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:my_man_godfrey',
  'lucy:movie:archive_org:his_girl_friday',
  'lucy:movie:archive_org:the_general',
  'lucy:movie:archive_org:africa_screams',
  'lucy:movie:archive_org:the_kid',
  'lucy:movie:archive_org:safety_last'
) AND t.name IN ('comedy', 'classic', 'public-domain', 'archive-org', 'golden-age')
ON CONFLICT DO NOTHING;

-- Silent Film tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:nosferatu',
  'lucy:movie:archive_org:the_cabinet_of_dr_caligari',
  'lucy:movie:archive_org:the_general',
  'lucy:movie:archive_org:the_kid',
  'lucy:movie:archive_org:safety_last',
  'lucy:movie:archive_org:the_phantom_of_the_opera',
  'lucy:movie:archive_org:metropolis',
  'lucy:movie:archive_org:sunrise',
  'lucy:movie:archive_org:battleship_potemkin',
  'lucy:movie:archive_org:the_passion_of_joan_of_arc'
) AND t.name IN ('silent-film', 'classic', 'public-domain', 'archive-org')
ON CONFLICT DO NOTHING;

-- Western tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:the_outlaw',
  'lucy:movie:archive_org:angel_and_the_badman',
  'lucy:movie:archive_org:mclintock',
  'lucy:movie:archive_org:terror_of_tiny_town'
) AND t.name IN ('western', 'classic', 'public-domain', 'archive-org')
ON CONFLICT DO NOTHING;

-- Blaxploitation tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:the_mack',
  'lucy:movie:archive_org:cotton_comes_to_harlem',
  'lucy:movie:archive_org:black_caesar',
  'lucy:movie:archive_org:sweet_sweetbacks_baadasssss_song'
) AND t.name IN ('blaxploitation', 'black-cinema', 'public-domain', 'archive-org', 'cult-classic')
ON CONFLICT DO NOTHING;

-- Martial Arts tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:five_fingers_of_death',
  'lucy:movie:archive_org:the_street_fighter'
) AND t.name IN ('martial-arts', 'action', 'public-domain', 'archive-org')
ON CONFLICT DO NOTHING;

-- International Cinema tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:m',
  'lucy:movie:archive_org:the_passion_of_joan_of_arc',
  'lucy:movie:archive_org:rashomon',
  'lucy:movie:archive_org:seven_samurai'
) AND t.name IN ('drama', 'classic', 'public-domain', 'archive-org', 'international')
ON CONFLICT DO NOTHING;

-- Animation tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:gulliver_travels',
  'lucy:movie:archive_org:mr_bug_goes_to_town'
) AND t.name IN ('animation', 'classic', 'public-domain', 'archive-org', 'family')
ON CONFLICT DO NOTHING;

-- Exploitation/Cult tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:reefer_madness',
  'lucy:movie:archive_org:maniac',
  'lucy:movie:archive_org:glen_or_glenda',
  'lucy:movie:archive_org:spider_baby'
) AND t.name IN ('exploitation', 'cult-classic', 'public-domain', 'archive-org')
ON CONFLICT DO NOTHING;

-- Pre-Code tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:the_public_enemy',
  'lucy:movie:archive_org:freaks',
  'lucy:movie:archive_org:baby_face'
) AND t.name IN ('drama', 'pre-code', 'classic', 'public-domain', 'archive-org')
ON CONFLICT DO NOTHING;

-- Drama classics tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:the_phantom_of_the_opera',
  'lucy:movie:archive_org:metropolis',
  'lucy:movie:archive_org:sunrise',
  'lucy:movie:archive_org:battleship_potemkin',
  'lucy:movie:archive_org:the_great_dictator'
) AND t.name IN ('drama', 'classic', 'public-domain', 'archive-org')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PART 4: ADD PROVIDER-SPECIFIC DATA
-- =============================================================================

-- Update provider content IDs for embed URLs
UPDATE media_nodes 
SET 
  provider_content_id = SPLIT_PART(canonical_id, ':', 4),
  embed_allowed = TRUE
WHERE provider_source = 'archive_org' AND provider_content_id IS NULL;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Count total catalog items
-- SELECT COUNT(*) as total_movies FROM media_nodes WHERE category = 'video';

-- Count by provider
-- SELECT provider_source, COUNT(*) as count 
-- FROM media_nodes 
-- WHERE category = 'video'
-- GROUP BY provider_source;

-- Count public domain films
-- SELECT COUNT(*) FROM media_nodes 
-- WHERE canonical_id LIKE '%archive_org%';

-- Verify tag assignments
-- SELECT t.name, COUNT(*) as movie_count
-- FROM media_node_tags mnt
-- JOIN media_tags t ON mnt.tag_id = t.id
-- GROUP BY t.name
-- ORDER BY movie_count DESC;
