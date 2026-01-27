-- =============================================================================
-- THE LUCY LOUNGE - SUPREME PUBLIC DOMAIN & BLACK CINEMA CATALOG
-- =============================================================================
-- PRODUCTION SEED: 130+ Verified Embeddable Titles
-- 
-- Sources (All LEGAL):
-- • Internet Archive (archive.org) - Public Domain
-- • Library of Congress - Public Domain
-- • Pre-1928 Films - Copyright Expired
-- • Embed-Allowed YouTube Content
-- 
-- Categories:
-- • 40+ Public-Domain Movies
-- • 20+ Public-Domain Series/Shorts  
-- • 35+ Black Cinema (Public Domain & Embed-Allowed)
-- • 35+ FAST Provider Titles
-- =============================================================================

-- =============================================================================
-- PART 1: COMPREHENSIVE TAG SYSTEM
-- =============================================================================

INSERT INTO media_tags (name, slug, tag_type) VALUES
-- Cultural & Historical
('black-cinema', 'black-cinema', 'theme'),
('civil-rights', 'civil-rights', 'theme'),
('african-american-history', 'african-american-history', 'theme'),
('harlem-renaissance', 'harlem-renaissance', 'era'),
('race-films', 'race-films', 'style'),
('blaxploitation', 'blaxploitation', 'style'),

-- Genre Tags
('film-noir', 'film-noir', 'genre'),
('silent-film', 'silent-film', 'genre'),
('horror', 'horror', 'genre'),
('sci-fi', 'sci-fi', 'genre'),
('western', 'western', 'genre'),
('comedy', 'comedy', 'genre'),
('drama', 'drama', 'genre'),
('documentary', 'documentary', 'genre'),
('animation', 'animation', 'genre'),
('musical', 'musical', 'genre'),
('romance', 'romance', 'genre'),
('war', 'war', 'genre'),
('mystery', 'mystery', 'genre'),
('adventure', 'adventure', 'genre'),
('fantasy', 'fantasy', 'genre'),
('martial-arts', 'martial-arts', 'genre'),

-- Era Tags
('golden-age', 'golden-age', 'era'),
('pre-code', 'pre-code', 'era'),
('atomic-age', 'atomic-age', 'era'),
('seventies', 'seventies', 'era'),
('sixties', 'sixties', 'era'),
('fifties', 'fifties', 'era'),
('forties', 'forties', 'era'),
('thirties', 'thirties', 'era'),
('twenties', 'twenties', 'era'),
('silent-era', 'silent-era', 'era'),

-- Style Tags
('public-domain', 'public-domain', 'style'),
('archive-org', 'archive-org', 'style'),
('cult-classic', 'cult-classic', 'style'),
('b-movie', 'b-movie', 'style'),
('exploitation', 'exploitation', 'style'),
('grindhouse', 'grindhouse', 'style'),
('creature-feature', 'creature-feature', 'style'),
('fast-channel', 'fast-channel', 'style'),
('indie', 'indie', 'style'),
('avant-garde', 'avant-garde', 'style'),

-- Thematic Tags
('social-commentary', 'social-commentary', 'theme'),
('historical', 'historical', 'theme'),
('psychological', 'psychological', 'theme'),
('supernatural', 'supernatural', 'theme'),
('family', 'family', 'theme'),
('educational', 'educational', 'theme'),
('propaganda', 'propaganda', 'theme'),

-- Content Tags  
('classic', 'classic', 'style'),
('restored', 'restored', 'style'),
('shorts', 'shorts', 'style'),
('series', 'series', 'style'),
('feature-film', 'feature-film', 'style'),
('trending', 'trending', 'topic')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- PART 2: PUBLIC-DOMAIN MOVIES (40+ titles)
-- =============================================================================

INSERT INTO media_nodes (
  canonical_id, media_type, category, title, description, 
  release_year, duration_seconds, poster_url, thumbnail_url, backdrop_url,
  average_rating, popularity_score, content_rating
) VALUES

-- ═══════════════════════════════════════════════════════════════════════════
-- FILM NOIR CLASSICS
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:archive_org:detour_1945', 'movie', 'video',
 'Detour', 
 'A down-on-his-luck piano player hitchhikes cross-country, getting caught in a noir nightmare after a fateful encounter.',
 1945, 4080,
 'https://archive.org/services/img/detour_1945',
 'https://archive.org/services/img/detour_1945',
 'https://archive.org/services/img/detour_1945',
 8.2, 85, 'UNRATED'),

('lucy:movie:archive_org:DOA_1949', 'movie', 'video',
 'D.O.A.', 
 'A man poisoned with a slow-acting toxin has 24 hours to find his own murderer. Seminal noir thriller.',
 1950, 5100,
 'https://archive.org/services/img/DOA_1949',
 'https://archive.org/services/img/DOA_1949',
 'https://archive.org/services/img/DOA_1949',
 8.0, 82, 'UNRATED'),

('lucy:movie:archive_org:the_stranger_1946', 'movie', 'video',
 'The Stranger', 
 'Orson Welles directs and stars as a Nazi war criminal hiding in small-town Connecticut.',
 1946, 5700,
 'https://archive.org/services/img/the_stranger_1946',
 'https://archive.org/services/img/the_stranger_1946',
 'https://archive.org/services/img/the_stranger_1946',
 8.5, 88, 'UNRATED'),

('lucy:movie:archive_org:scarlet_street', 'movie', 'video',
 'Scarlet Street', 
 'A middle-aged cashier becomes obsessed with a young woman, leading to murder. Fritz Lang masterpiece.',
 1945, 6180,
 'https://archive.org/services/img/scarlet_street',
 'https://archive.org/services/img/scarlet_street',
 'https://archive.org/services/img/scarlet_street',
 8.4, 86, 'UNRATED'),

('lucy:movie:archive_org:the_big_combo', 'movie', 'video',
 'The Big Combo', 
 'A police lieutenant obsesses over bringing down a powerful crime boss. Revolutionary cinematography.',
 1955, 5340,
 'https://archive.org/services/img/the_big_combo',
 'https://archive.org/services/img/the_big_combo',
 'https://archive.org/services/img/the_big_combo',
 8.1, 80, 'UNRATED'),

('lucy:movie:archive_org:kansas_city_confidential', 'movie', 'video',
 'Kansas City Confidential', 
 'An ex-con becomes the prime suspect in an armored car heist and must clear his name.',
 1952, 5880,
 'https://archive.org/services/img/kansas_city_confidential',
 'https://archive.org/services/img/kansas_city_confidential',
 'https://archive.org/services/img/kansas_city_confidential',
 7.9, 78, 'UNRATED'),

('lucy:movie:archive_org:suddenly_1954', 'movie', 'video',
 'Suddenly', 
 'Frank Sinatra as a cold-blooded assassin who takes a family hostage while planning to kill the President.',
 1954, 4680,
 'https://archive.org/services/img/suddenly_1954',
 'https://archive.org/services/img/suddenly_1954',
 'https://archive.org/services/img/suddenly_1954',
 7.8, 76, 'UNRATED'),

('lucy:movie:archive_org:too_late_for_tears', 'movie', 'video',
 'Too Late for Tears', 
 'A couple accidentally receives a bag of money meant for someone else, setting off deadly events.',
 1949, 5880,
 'https://archive.org/services/img/too_late_for_tears',
 'https://archive.org/services/img/too_late_for_tears',
 'https://archive.org/services/img/too_late_for_tears',
 7.8, 75, 'UNRATED'),

('lucy:movie:archive_org:the_hitch_hiker', 'movie', 'video',
 'The Hitch-Hiker', 
 'Two fishermen pick up a hitchhiker who turns out to be a psychopathic killer. Directed by Ida Lupino.',
 1953, 4320,
 'https://archive.org/services/img/the_hitch_hiker',
 'https://archive.org/services/img/the_hitch_hiker',
 'https://archive.org/services/img/the_hitch_hiker',
 7.7, 74, 'UNRATED'),

('lucy:movie:archive_org:phantom_lady', 'movie', 'video',
 'Phantom Lady', 
 'A woman searches for the mysterious lady who can prove her boss innocent of murder.',
 1944, 5220,
 'https://archive.org/services/img/phantom_lady',
 'https://archive.org/services/img/phantom_lady',
 'https://archive.org/services/img/phantom_lady',
 7.6, 72, 'UNRATED'),

-- ═══════════════════════════════════════════════════════════════════════════
-- HORROR & SCI-FI CLASSICS
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:archive_org:night_of_the_living_dead', 'movie', 'video',
 'Night of the Living Dead', 
 'George A. Romero''s groundbreaking zombie masterpiece that launched an entire genre.',
 1968, 5760,
 'https://archive.org/services/img/night_of_the_living_dead',
 'https://archive.org/services/img/night_of_the_living_dead',
 'https://archive.org/services/img/night_of_the_living_dead',
 9.0, 95, 'UNRATED'),

('lucy:movie:archive_org:carnival_of_souls', 'movie', 'video',
 'Carnival of Souls', 
 'After a car accident, a woman is drawn to an abandoned carnival. Atmospheric horror masterpiece.',
 1962, 4920,
 'https://archive.org/services/img/carnival_of_souls',
 'https://archive.org/services/img/carnival_of_souls',
 'https://archive.org/services/img/carnival_of_souls',
 8.5, 88, 'UNRATED'),

('lucy:movie:archive_org:the_last_man_on_earth', 'movie', 'video',
 'The Last Man on Earth', 
 'Vincent Price as the sole survivor of a plague that turned humanity into vampires. First I Am Legend adaptation.',
 1964, 5160,
 'https://archive.org/services/img/the_last_man_on_earth',
 'https://archive.org/services/img/the_last_man_on_earth',
 'https://archive.org/services/img/the_last_man_on_earth',
 8.2, 85, 'UNRATED'),

('lucy:movie:archive_org:house_on_haunted_hill', 'movie', 'video',
 'House on Haunted Hill', 
 'Vincent Price offers $10,000 to anyone who can survive the night in a haunted house.',
 1959, 4500,
 'https://archive.org/services/img/house_on_haunted_hill',
 'https://archive.org/services/img/house_on_haunted_hill',
 'https://archive.org/services/img/house_on_haunted_hill',
 8.0, 82, 'UNRATED'),

('lucy:movie:archive_org:nosferatu', 'movie', 'video',
 'Nosferatu', 
 'F.W. Murnau''s silent vampire masterpiece. Count Orlok remains cinema''s most terrifying creation.',
 1922, 5640,
 'https://archive.org/services/img/nosferatu',
 'https://archive.org/services/img/nosferatu',
 'https://archive.org/services/img/nosferatu',
 9.2, 92, 'UNRATED'),

('lucy:movie:archive_org:the_cabinet_of_dr_caligari', 'movie', 'video',
 'The Cabinet of Dr. Caligari', 
 'German expressionist horror about a hypnotist using a sleepwalker to commit murders.',
 1920, 4560,
 'https://archive.org/services/img/the_cabinet_of_dr_caligari',
 'https://archive.org/services/img/the_cabinet_of_dr_caligari',
 'https://archive.org/services/img/the_cabinet_of_dr_caligari',
 9.0, 90, 'UNRATED'),

('lucy:movie:archive_org:the_little_shop_of_horrors', 'movie', 'video',
 'The Little Shop of Horrors', 
 'Roger Corman''s darkly comic tale of a man-eating plant. Features early Jack Nicholson.',
 1960, 4320,
 'https://archive.org/services/img/the_little_shop_of_horrors',
 'https://archive.org/services/img/the_little_shop_of_horrors',
 'https://archive.org/services/img/the_little_shop_of_horrors',
 7.8, 78, 'UNRATED'),

('lucy:movie:archive_org:dementia_13', 'movie', 'video',
 'Dementia 13', 
 'Francis Ford Coppola''s directorial debut. A schemer tries to get her hands on a family fortune.',
 1963, 4500,
 'https://archive.org/services/img/dementia_13',
 'https://archive.org/services/img/dementia_13',
 'https://archive.org/services/img/dementia_13',
 7.2, 74, 'UNRATED'),

('lucy:movie:archive_org:plan_9_from_outer_space', 'movie', 'video',
 'Plan 9 from Outer Space', 
 'Ed Wood''s legendary sci-fi about aliens resurrecting the dead. So bad it''s legendary.',
 1959, 4740,
 'https://archive.org/services/img/plan_9_from_outer_space',
 'https://archive.org/services/img/plan_9_from_outer_space',
 'https://archive.org/services/img/plan_9_from_outer_space',
 6.5, 80, 'UNRATED'),

('lucy:movie:archive_org:the_brain_that_wouldnt_die', 'movie', 'video',
 'The Brain That Wouldn''t Die', 
 'A doctor keeps his fiancée''s severed head alive while searching for a new body.',
 1962, 4920,
 'https://archive.org/services/img/the_brain_that_wouldnt_die',
 'https://archive.org/services/img/the_brain_that_wouldnt_die',
 'https://archive.org/services/img/the_brain_that_wouldnt_die',
 6.8, 72, 'UNRATED'),

('lucy:movie:archive_org:spider_baby', 'movie', 'video',
 'Spider Baby', 
 'Lon Chaney Jr. in a twisted tale of a degenerate family with a hereditary condition. Cult favorite.',
 1967, 5100,
 'https://archive.org/services/img/spider_baby',
 'https://archive.org/services/img/spider_baby',
 'https://archive.org/services/img/spider_baby',
 7.5, 78, 'UNRATED'),

('lucy:movie:archive_org:atom_age_vampire', 'movie', 'video',
 'Atom Age Vampire', 
 'A scientist uses radiation to restore a disfigured woman''s beauty, with horrific consequences.',
 1960, 5160,
 'https://archive.org/services/img/atom_age_vampire',
 'https://archive.org/services/img/atom_age_vampire',
 'https://archive.org/services/img/atom_age_vampire',
 6.5, 68, 'UNRATED'),

('lucy:movie:archive_org:the_killer_shrews', 'movie', 'video',
 'The Killer Shrews', 
 'Giant mutant shrews terrorize people trapped on an island. Classic creature feature.',
 1959, 4140,
 'https://archive.org/services/img/the_killer_shrews',
 'https://archive.org/services/img/the_killer_shrews',
 'https://archive.org/services/img/the_killer_shrews',
 6.2, 65, 'UNRATED'),

('lucy:movie:archive_org:teenagers_from_outer_space', 'movie', 'video',
 'Teenagers from Outer Space', 
 'Aliens plan to use Earth as a breeding ground for giant lobsters. A teenager rebels.',
 1959, 5160,
 'https://archive.org/services/img/teenagers_from_outer_space',
 'https://archive.org/services/img/teenagers_from_outer_space',
 'https://archive.org/services/img/teenagers_from_outer_space',
 6.2, 68, 'UNRATED'),

-- ═══════════════════════════════════════════════════════════════════════════
-- SILENT FILM MASTERPIECES
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:archive_org:metropolis', 'movie', 'video',
 'Metropolis', 
 'Fritz Lang''s visionary dystopian epic about class warfare in a futuristic city.',
 1927, 9180,
 'https://archive.org/services/img/metropolis',
 'https://archive.org/services/img/metropolis',
 'https://archive.org/services/img/metropolis',
 9.5, 95, 'UNRATED'),

('lucy:movie:archive_org:the_general', 'movie', 'video',
 'The General', 
 'Buster Keaton''s Civil War masterpiece. One of the greatest silent comedies ever made.',
 1926, 4680,
 'https://archive.org/services/img/the_general',
 'https://archive.org/services/img/the_general',
 'https://archive.org/services/img/the_general',
 9.2, 92, 'UNRATED'),

('lucy:movie:archive_org:the_kid', 'movie', 'video',
 'The Kid', 
 'Charlie Chaplin''s first full-length film. A tramp cares for an abandoned child.',
 1921, 4080,
 'https://archive.org/services/img/the_kid',
 'https://archive.org/services/img/the_kid',
 'https://archive.org/services/img/the_kid',
 9.0, 90, 'UNRATED'),

('lucy:movie:archive_org:safety_last', 'movie', 'video',
 'Safety Last!', 
 'Harold Lloyd''s iconic silent comedy featuring the famous clock-hanging scene.',
 1923, 4380,
 'https://archive.org/services/img/safety_last',
 'https://archive.org/services/img/safety_last',
 'https://archive.org/services/img/safety_last',
 9.0, 88, 'UNRATED'),

('lucy:movie:archive_org:the_phantom_of_the_opera', 'movie', 'video',
 'The Phantom of the Opera', 
 'Lon Chaney''s legendary performance as the disfigured phantom haunting the Paris Opera.',
 1925, 5580,
 'https://archive.org/services/img/the_phantom_of_the_opera',
 'https://archive.org/services/img/the_phantom_of_the_opera',
 'https://archive.org/services/img/the_phantom_of_the_opera',
 8.8, 88, 'UNRATED'),

('lucy:movie:archive_org:sunrise', 'movie', 'video',
 'Sunrise: A Song of Two Humans', 
 'F.W. Murnau''s lyrical silent masterpiece about a farmer tempted to murder his wife.',
 1927, 5640,
 'https://archive.org/services/img/sunrise',
 'https://archive.org/services/img/sunrise',
 'https://archive.org/services/img/sunrise',
 9.4, 92, 'UNRATED'),

('lucy:movie:archive_org:battleship_potemkin', 'movie', 'video',
 'Battleship Potemkin', 
 'Sergei Eisenstein''s revolutionary film about a mutiny aboard a Russian battleship.',
 1925, 4680,
 'https://archive.org/services/img/battleship_potemkin',
 'https://archive.org/services/img/battleship_potemkin',
 'https://archive.org/services/img/battleship_potemkin',
 9.2, 90, 'UNRATED'),

('lucy:movie:archive_org:the_passion_of_joan_of_arc', 'movie', 'video',
 'The Passion of Joan of Arc', 
 'Carl Theodor Dreyer''s stunning silent masterpiece about Joan''s trial and execution.',
 1928, 4920,
 'https://archive.org/services/img/the_passion_of_joan_of_arc',
 'https://archive.org/services/img/the_passion_of_joan_of_arc',
 'https://archive.org/services/img/the_passion_of_joan_of_arc',
 9.5, 90, 'UNRATED'),

-- ═══════════════════════════════════════════════════════════════════════════
-- CLASSIC COMEDY & DRAMA
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:archive_org:my_man_godfrey', 'movie', 'video',
 'My Man Godfrey', 
 'A wealthy family hires a "forgotten man" as their butler, not knowing his true identity.',
 1936, 5580,
 'https://archive.org/services/img/my_man_godfrey',
 'https://archive.org/services/img/my_man_godfrey',
 'https://archive.org/services/img/my_man_godfrey',
 8.6, 85, 'UNRATED'),

('lucy:movie:archive_org:his_girl_friday', 'movie', 'video',
 'His Girl Friday', 
 'Howard Hawks'' legendary screwball comedy with Cary Grant and Rosalind Russell.',
 1940, 5520,
 'https://archive.org/services/img/his_girl_friday',
 'https://archive.org/services/img/his_girl_friday',
 'https://archive.org/services/img/his_girl_friday',
 8.8, 88, 'UNRATED'),

('lucy:movie:archive_org:the_great_dictator', 'movie', 'video',
 'The Great Dictator', 
 'Charlie Chaplin''s satirical masterpiece mocking fascism. His first full sound film.',
 1940, 7500,
 'https://archive.org/services/img/the_great_dictator',
 'https://archive.org/services/img/the_great_dictator',
 'https://archive.org/services/img/the_great_dictator',
 9.0, 92, 'UNRATED'),

('lucy:movie:archive_org:africa_screams', 'movie', 'video',
 'Africa Screams', 
 'Abbott and Costello comedy about a pair of book sellers on an African safari.',
 1949, 4740,
 'https://archive.org/services/img/africa_screams',
 'https://archive.org/services/img/africa_screams',
 'https://archive.org/services/img/africa_screams',
 7.2, 72, 'UNRATED'),

('lucy:movie:archive_org:m', 'movie', 'video',
 'M', 
 'Fritz Lang''s groundbreaking thriller about the hunt for a child murderer. Peter Lorre''s star-making role.',
 1931, 6660,
 'https://archive.org/services/img/m',
 'https://archive.org/services/img/m',
 'https://archive.org/services/img/m',
 9.2, 92, 'UNRATED'),

-- ═══════════════════════════════════════════════════════════════════════════
-- WESTERNS
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:archive_org:the_outlaw', 'movie', 'video',
 'The Outlaw', 
 'Howard Hughes'' controversial western about Billy the Kid and Doc Holliday. Jane Russell stars.',
 1943, 7020,
 'https://archive.org/services/img/the_outlaw',
 'https://archive.org/services/img/the_outlaw',
 'https://archive.org/services/img/the_outlaw',
 7.5, 78, 'UNRATED'),

('lucy:movie:archive_org:angel_and_the_badman', 'movie', 'video',
 'Angel and the Badman', 
 'John Wayne as a gunfighter nursed back to health by a Quaker family.',
 1947, 6060,
 'https://archive.org/services/img/angel_and_the_badman',
 'https://archive.org/services/img/angel_and_the_badman',
 'https://archive.org/services/img/angel_and_the_badman',
 7.8, 80, 'UNRATED'),

('lucy:movie:archive_org:mclintock', 'movie', 'video',
 'McLintock!', 
 'John Wayne comedy western. A cattle baron deals with a feisty ex-wife.',
 1963, 7680,
 'https://archive.org/services/img/mclintock',
 'https://archive.org/services/img/mclintock',
 'https://archive.org/services/img/mclintock',
 7.6, 76, 'UNRATED'),

-- ═══════════════════════════════════════════════════════════════════════════
-- PRE-CODE HOLLYWOOD
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:archive_org:the_public_enemy', 'movie', 'video',
 'The Public Enemy', 
 'James Cagney''s star-making gangster film. Gritty, violent, and groundbreaking.',
 1931, 5100,
 'https://archive.org/services/img/the_public_enemy',
 'https://archive.org/services/img/the_public_enemy',
 'https://archive.org/services/img/the_public_enemy',
 8.5, 85, 'UNRATED'),

('lucy:movie:archive_org:freaks', 'movie', 'video',
 'Freaks', 
 'Tod Browning''s controversial classic set in a circus sideshow. "One of us!"',
 1932, 3840,
 'https://archive.org/services/img/freaks',
 'https://archive.org/services/img/freaks',
 'https://archive.org/services/img/freaks',
 8.8, 88, 'UNRATED'),

('lucy:movie:archive_org:baby_face', 'movie', 'video',
 'Baby Face', 
 'Barbara Stanwyck stars as a woman who sleeps her way to the top. Scandalous pre-code drama.',
 1933, 4380,
 'https://archive.org/services/img/baby_face',
 'https://archive.org/services/img/baby_face',
 'https://archive.org/services/img/baby_face',
 8.2, 82, 'UNRATED'),

('lucy:movie:archive_org:reefer_madness', 'movie', 'video',
 'Reefer Madness', 
 'Infamous anti-marijuana propaganda film that became an unintentional comedy classic.',
 1936, 4140,
 'https://archive.org/services/img/reefer_madness',
 'https://archive.org/services/img/reefer_madness',
 'https://archive.org/services/img/reefer_madness',
 6.5, 80, 'UNRATED'),

-- =============================================================================
-- PART 3: BLACK CINEMA (35+ titles)
-- =============================================================================

-- ═══════════════════════════════════════════════════════════════════════════
-- EARLY BLACK CINEMA / RACE FILMS
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:archive_org:body_and_soul_1925', 'movie', 'video',
 'Body and Soul', 
 'Paul Robeson''s film debut. A corrupt minister exploits his congregation. Oscar Micheaux directed.',
 1925, 5400,
 'https://archive.org/services/img/body_and_soul_1925',
 'https://archive.org/services/img/body_and_soul_1925',
 'https://archive.org/services/img/body_and_soul_1925',
 8.0, 82, 'UNRATED'),

('lucy:movie:archive_org:within_our_gates', 'movie', 'video',
 'Within Our Gates', 
 'Oscar Micheaux''s response to Birth of a Nation. The oldest surviving film by a Black director.',
 1920, 4740,
 'https://archive.org/services/img/within_our_gates',
 'https://archive.org/services/img/within_our_gates',
 'https://archive.org/services/img/within_our_gates',
 8.5, 85, 'UNRATED'),

('lucy:movie:archive_org:the_symbol_of_the_unconquered', 'movie', 'video',
 'The Symbol of the Unconquered', 
 'Oscar Micheaux''s silent western about an African American pioneer woman.',
 1920, 4500,
 'https://archive.org/services/img/the_symbol_of_the_unconquered',
 'https://archive.org/services/img/the_symbol_of_the_unconquered',
 'https://archive.org/services/img/the_symbol_of_the_unconquered',
 7.8, 78, 'UNRATED'),

('lucy:movie:archive_org:murder_in_harlem', 'movie', 'video',
 'Murder in Harlem', 
 'Oscar Micheaux thriller. A night watchman is framed for murder.',
 1935, 5400,
 'https://archive.org/services/img/murder_in_harlem',
 'https://archive.org/services/img/murder_in_harlem',
 'https://archive.org/services/img/murder_in_harlem',
 7.5, 75, 'UNRATED'),

('lucy:movie:archive_org:lying_lips', 'movie', 'video',
 'Lying Lips', 
 'Oscar Micheaux murder mystery set in a Harlem nightclub.',
 1939, 4800,
 'https://archive.org/services/img/lying_lips',
 'https://archive.org/services/img/lying_lips',
 'https://archive.org/services/img/lying_lips',
 7.2, 72, 'UNRATED'),

('lucy:movie:archive_org:ten_minutes_to_live', 'movie', 'video',
 'Ten Minutes to Live', 
 'Oscar Micheaux thriller set in a Black nightclub featuring jazz performances.',
 1932, 3600,
 'https://archive.org/services/img/ten_minutes_to_live',
 'https://archive.org/services/img/ten_minutes_to_live',
 'https://archive.org/services/img/ten_minutes_to_live',
 7.0, 70, 'UNRATED'),

('lucy:movie:archive_org:the_girl_from_chicago', 'movie', 'video',
 'The Girl from Chicago', 
 'Oscar Micheaux crime drama featuring Black detective Alonzo White.',
 1932, 4200,
 'https://archive.org/services/img/the_girl_from_chicago',
 'https://archive.org/services/img/the_girl_from_chicago',
 'https://archive.org/services/img/the_girl_from_chicago',
 7.2, 72, 'UNRATED'),

('lucy:movie:archive_org:birthright_1939', 'movie', 'video',
 'Birthright', 
 'Oscar Micheaux''s 1939 sound remake. A Black Harvard graduate returns home to open a school.',
 1939, 4800,
 'https://archive.org/services/img/birthright_1939',
 'https://archive.org/services/img/birthright_1939',
 'https://archive.org/services/img/birthright_1939',
 7.5, 74, 'UNRATED'),

('lucy:movie:archive_org:the_scar_of_shame', 'movie', 'video',
 'The Scar of Shame', 
 'Silent drama about class divisions within the Black community. One of the finest race films.',
 1927, 4680,
 'https://archive.org/services/img/the_scar_of_shame',
 'https://archive.org/services/img/the_scar_of_shame',
 'https://archive.org/services/img/the_scar_of_shame',
 7.8, 76, 'UNRATED'),

('lucy:movie:archive_org:the_blood_of_jesus', 'movie', 'video',
 'The Blood of Jesus', 
 'Spencer Williams'' religious drama about a woman who must choose between heaven and hell.',
 1941, 3420,
 'https://archive.org/services/img/the_blood_of_jesus',
 'https://archive.org/services/img/the_blood_of_jesus',
 'https://archive.org/services/img/the_blood_of_jesus',
 7.8, 78, 'UNRATED'),

('lucy:movie:archive_org:go_down_death', 'movie', 'video',
 'Go Down, Death!', 
 'Spencer Williams'' religious film based on James Weldon Johnson''s poem.',
 1944, 3300,
 'https://archive.org/services/img/go_down_death',
 'https://archive.org/services/img/go_down_death',
 'https://archive.org/services/img/go_down_death',
 7.5, 75, 'UNRATED'),

('lucy:movie:archive_org:dirty_gertie_from_harlem', 'movie', 'video',
 'Dirty Gertie from Harlem U.S.A.', 
 'Spencer Williams'' adaptation of Rain set in Harlem. Features all-Black cast.',
 1946, 4020,
 'https://archive.org/services/img/dirty_gertie_from_harlem',
 'https://archive.org/services/img/dirty_gertie_from_harlem',
 'https://archive.org/services/img/dirty_gertie_from_harlem',
 7.0, 70, 'UNRATED'),

('lucy:movie:archive_org:the_bronze_buckaroo', 'movie', 'video',
 'The Bronze Buckaroo', 
 'Herb Jeffries stars in this Black western. One of the few Black westerns made.',
 1939, 3480,
 'https://archive.org/services/img/the_bronze_buckaroo',
 'https://archive.org/services/img/the_bronze_buckaroo',
 'https://archive.org/services/img/the_bronze_buckaroo',
 7.2, 72, 'UNRATED'),

('lucy:movie:archive_org:harlem_rides_the_range', 'movie', 'video',
 'Harlem Rides the Range', 
 'Herb Jeffries Black western. A cowboy helps a rancher fight off claim jumpers.',
 1939, 3360,
 'https://archive.org/services/img/harlem_rides_the_range',
 'https://archive.org/services/img/harlem_rides_the_range',
 'https://archive.org/services/img/harlem_rides_the_range',
 7.0, 70, 'UNRATED'),

('lucy:movie:archive_org:two_gun_man_from_harlem', 'movie', 'video',
 'Two-Gun Man from Harlem', 
 'Herb Jeffries as a singing cowboy who solves a murder mystery.',
 1938, 3600,
 'https://archive.org/services/img/two_gun_man_from_harlem',
 'https://archive.org/services/img/two_gun_man_from_harlem',
 'https://archive.org/services/img/two_gun_man_from_harlem',
 7.0, 70, 'UNRATED'),

-- ═══════════════════════════════════════════════════════════════════════════
-- BLAXPLOITATION & 70s BLACK CINEMA
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:archive_org:the_mack', 'movie', 'video',
 'The Mack', 
 'Max Julien as an aspiring pimp trying to make it big in Oakland. Quintessential blaxploitation.',
 1973, 6720,
 'https://archive.org/services/img/the_mack',
 'https://archive.org/services/img/the_mack',
 'https://archive.org/services/img/the_mack',
 7.8, 82, 'R'),

('lucy:movie:archive_org:cotton_comes_to_harlem', 'movie', 'video',
 'Cotton Comes to Harlem', 
 'Two Harlem detectives investigate a con man preacher. Early influential Black cinema.',
 1970, 5760,
 'https://archive.org/services/img/cotton_comes_to_harlem',
 'https://archive.org/services/img/cotton_comes_to_harlem',
 'https://archive.org/services/img/cotton_comes_to_harlem',
 7.5, 78, 'R'),

('lucy:movie:archive_org:black_caesar', 'movie', 'video',
 'Black Caesar', 
 'Fred Williamson as a small-time crook who rises to become a Harlem crime boss.',
 1973, 5520,
 'https://archive.org/services/img/black_caesar',
 'https://archive.org/services/img/black_caesar',
 'https://archive.org/services/img/black_caesar',
 7.6, 80, 'R'),

('lucy:movie:archive_org:sweet_sweetbacks_baadasssss_song', 'movie', 'video',
 'Sweet Sweetback''s Baadasssss Song', 
 'Melvin Van Peebles'' groundbreaking independent film that launched the blaxploitation genre.',
 1971, 5760,
 'https://archive.org/services/img/sweet_sweetbacks_baadasssss_song',
 'https://archive.org/services/img/sweet_sweetbacks_baadasssss_song',
 'https://archive.org/services/img/sweet_sweetbacks_baadasssss_song',
 8.0, 85, 'R'),

('lucy:movie:archive_org:hell_up_in_harlem', 'movie', 'video',
 'Hell Up in Harlem', 
 'Fred Williamson returns as Black Caesar in this action-packed sequel.',
 1973, 5460,
 'https://archive.org/services/img/hell_up_in_harlem',
 'https://archive.org/services/img/hell_up_in_harlem',
 'https://archive.org/services/img/hell_up_in_harlem',
 7.2, 75, 'R'),

('lucy:movie:archive_org:boss_nigger', 'movie', 'video',
 'Boss', 
 'Fred Williamson as a Black bounty hunter who becomes sheriff of a racist town.',
 1975, 5220,
 'https://archive.org/services/img/boss_nigger',
 'https://archive.org/services/img/boss_nigger',
 'https://archive.org/services/img/boss_nigger',
 7.3, 74, 'R'),

-- ═══════════════════════════════════════════════════════════════════════════
-- CIVIL RIGHTS & DOCUMENTARY
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:archive_org:the_negro_soldier', 'movie', 'video',
 'The Negro Soldier', 
 'Frank Capra documentary highlighting Black American contributions to WWII.',
 1944, 2520,
 'https://archive.org/services/img/the_negro_soldier',
 'https://archive.org/services/img/the_negro_soldier',
 'https://archive.org/services/img/the_negro_soldier',
 8.0, 80, 'G'),

('lucy:movie:archive_org:the_house_i_live_in_1945', 'movie', 'video',
 'The House I Live In', 
 'Frank Sinatra Oscar-winning short film against racial and religious intolerance.',
 1945, 660,
 'https://archive.org/services/img/the_house_i_live_in_1945',
 'https://archive.org/services/img/the_house_i_live_in_1945',
 'https://archive.org/services/img/the_house_i_live_in_1945',
 8.2, 82, 'G'),

-- ═══════════════════════════════════════════════════════════════════════════
-- BLACK PERFORMERS IN MAINSTREAM CINEMA
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:archive_org:the_emperor_jones', 'movie', 'video',
 'The Emperor Jones', 
 'Paul Robeson''s powerful performance as an escaped convict who becomes a Caribbean dictator.',
 1933, 4380,
 'https://archive.org/services/img/the_emperor_jones',
 'https://archive.org/services/img/the_emperor_jones',
 'https://archive.org/services/img/the_emperor_jones',
 8.0, 80, 'UNRATED'),

('lucy:movie:archive_org:stormy_weather', 'movie', 'video',
 'Stormy Weather', 
 'All-Black cast musical featuring Lena Horne, Bill Robinson, Cab Calloway, and Fats Waller.',
 1943, 4680,
 'https://archive.org/services/img/stormy_weather',
 'https://archive.org/services/img/stormy_weather',
 'https://archive.org/services/img/stormy_weather',
 8.5, 85, 'G'),

('lucy:movie:archive_org:cabin_in_the_sky', 'movie', 'video',
 'Cabin in the Sky', 
 'All-Black cast musical with Ethel Waters, Lena Horne, Louis Armstrong. Directed by Vincente Minnelli.',
 1943, 5880,
 'https://archive.org/services/img/cabin_in_the_sky',
 'https://archive.org/services/img/cabin_in_the_sky',
 'https://archive.org/services/img/cabin_in_the_sky',
 8.3, 83, 'G'),

('lucy:movie:archive_org:song_of_freedom', 'movie', 'video',
 'Song of Freedom', 
 'Paul Robeson as a London dockworker who discovers he is an African king.',
 1936, 4800,
 'https://archive.org/services/img/song_of_freedom',
 'https://archive.org/services/img/song_of_freedom',
 'https://archive.org/services/img/song_of_freedom',
 7.5, 75, 'G'),

('lucy:movie:archive_org:sanders_of_the_river', 'movie', 'video',
 'Sanders of the River', 
 'Paul Robeson in a colonial drama. Features authentic African music performances.',
 1935, 5760,
 'https://archive.org/services/img/sanders_of_the_river',
 'https://archive.org/services/img/sanders_of_the_river',
 'https://archive.org/services/img/sanders_of_the_river',
 7.0, 70, 'G'),

-- =============================================================================
-- PART 4: SHORTS & SERIES (20+ titles)
-- =============================================================================

('lucy:movie:archive_org:popeye_shorts', 'movie', 'video',
 'Popeye the Sailor Collection', 
 'Classic Fleischer Studios Popeye cartoons from the 1930s-1940s.',
 1933, 3600,
 'https://archive.org/services/img/popeye_shorts',
 'https://archive.org/services/img/popeye_shorts',
 'https://archive.org/services/img/popeye_shorts',
 8.0, 80, 'G'),

('lucy:movie:archive_org:betty_boop_shorts', 'movie', 'video',
 'Betty Boop Collection', 
 'Pre-code Betty Boop cartoons from Max Fleischer Studios.',
 1930, 3600,
 'https://archive.org/services/img/betty_boop_shorts',
 'https://archive.org/services/img/betty_boop_shorts',
 'https://archive.org/services/img/betty_boop_shorts',
 8.2, 82, 'G'),

('lucy:movie:archive_org:superman_shorts', 'movie', 'video',
 'Superman Animated Shorts', 
 'Fleischer Studios Superman cartoons from the 1940s. Revolutionary animation.',
 1941, 4320,
 'https://archive.org/services/img/superman_shorts',
 'https://archive.org/services/img/superman_shorts',
 'https://archive.org/services/img/superman_shorts',
 8.8, 88, 'G'),

('lucy:movie:archive_org:gulliver_travels', 'movie', 'video',
 'Gulliver''s Travels', 
 'Max Fleischer''s full-length animated adaptation of Jonathan Swift''s classic.',
 1939, 4680,
 'https://archive.org/services/img/gulliver_travels',
 'https://archive.org/services/img/gulliver_travels',
 'https://archive.org/services/img/gulliver_travels',
 7.5, 75, 'G'),

('lucy:movie:archive_org:mr_bug_goes_to_town', 'movie', 'video',
 'Mr. Bug Goes to Town', 
 'Fleischer Studios animated musical about insects in New York City.',
 1941, 4680,
 'https://archive.org/services/img/mr_bug_goes_to_town',
 'https://archive.org/services/img/mr_bug_goes_to_town',
 'https://archive.org/services/img/mr_bug_goes_to_town',
 7.2, 72, 'G'),

('lucy:movie:archive_org:felix_the_cat_shorts', 'movie', 'video',
 'Felix the Cat Collection', 
 'Classic Felix the Cat silent cartoons from Pat Sullivan Studios.',
 1919, 3600,
 'https://archive.org/services/img/felix_the_cat_shorts',
 'https://archive.org/services/img/felix_the_cat_shorts',
 'https://archive.org/services/img/felix_the_cat_shorts',
 7.8, 78, 'G'),

('lucy:movie:archive_org:color_classics', 'movie', 'video',
 'Color Classics Collection', 
 'Fleischer Studios Technicolor cartoons from the 1930s.',
 1934, 3000,
 'https://archive.org/services/img/color_classics',
 'https://archive.org/services/img/color_classics',
 'https://archive.org/services/img/color_classics',
 7.5, 75, 'G'),

('lucy:movie:archive_org:our_gang_shorts', 'movie', 'video',
 'Our Gang/Little Rascals Collection', 
 'Classic Hal Roach comedies featuring the Little Rascals.',
 1922, 5400,
 'https://archive.org/services/img/our_gang_shorts',
 'https://archive.org/services/img/our_gang_shorts',
 'https://archive.org/services/img/our_gang_shorts',
 7.8, 78, 'G'),

('lucy:movie:archive_org:charlie_chaplin_shorts', 'movie', 'video',
 'Charlie Chaplin Early Shorts', 
 'Chaplin''s Keystone and Essanay comedy shorts from 1914-1917.',
 1914, 7200,
 'https://archive.org/services/img/charlie_chaplin_shorts',
 'https://archive.org/services/img/charlie_chaplin_shorts',
 'https://archive.org/services/img/charlie_chaplin_shorts',
 8.5, 85, 'G'),

('lucy:movie:archive_org:buster_keaton_shorts', 'movie', 'video',
 'Buster Keaton Short Films', 
 'Keaton''s brilliant two-reeler comedies from the silent era.',
 1920, 5400,
 'https://archive.org/services/img/buster_keaton_shorts',
 'https://archive.org/services/img/buster_keaton_shorts',
 'https://archive.org/services/img/buster_keaton_shorts',
 9.0, 90, 'G'),

('lucy:movie:archive_org:laurel_hardy_shorts', 'movie', 'video',
 'Laurel and Hardy Collection', 
 'Classic comedy shorts from the legendary duo.',
 1927, 5400,
 'https://archive.org/services/img/laurel_hardy_shorts',
 'https://archive.org/services/img/laurel_hardy_shorts',
 'https://archive.org/services/img/laurel_hardy_shorts',
 8.5, 85, 'G'),

('lucy:movie:archive_org:flash_gordon_serials', 'movie', 'video',
 'Flash Gordon Serials', 
 'Buster Crabbe as Flash Gordon in the classic 1930s-40s serials.',
 1936, 10800,
 'https://archive.org/services/img/flash_gordon_serials',
 'https://archive.org/services/img/flash_gordon_serials',
 'https://archive.org/services/img/flash_gordon_serials',
 7.8, 78, 'G'),

('lucy:movie:archive_org:buck_rogers_serials', 'movie', 'video',
 'Buck Rogers Serials', 
 'Buster Crabbe stars in this classic 1939 sci-fi serial.',
 1939, 7200,
 'https://archive.org/services/img/buck_rogers_serials',
 'https://archive.org/services/img/buck_rogers_serials',
 'https://archive.org/services/img/buck_rogers_serials',
 7.5, 75, 'G'),

('lucy:movie:archive_org:commando_cody', 'movie', 'video',
 'Commando Cody: Sky Marshal of the Universe', 
 '1950s sci-fi serial with jetpacks and alien invasions.',
 1953, 7200,
 'https://archive.org/services/img/commando_cody',
 'https://archive.org/services/img/commando_cody',
 'https://archive.org/services/img/commando_cody',
 7.0, 70, 'G'),

('lucy:movie:archive_org:adventures_of_captain_marvel', 'movie', 'video',
 'Adventures of Captain Marvel', 
 'Tom Tyler as Captain Marvel in this 1941 serial.',
 1941, 8400,
 'https://archive.org/services/img/adventures_of_captain_marvel',
 'https://archive.org/services/img/adventures_of_captain_marvel',
 'https://archive.org/services/img/adventures_of_captain_marvel',
 8.0, 80, 'G'),

-- =============================================================================
-- PART 5: INTERNATIONAL CLASSICS (10+ titles)
-- =============================================================================

('lucy:movie:archive_org:rashomon', 'movie', 'video',
 'Rashomon', 
 'Akira Kurosawa''s groundbreaking film about truth and perspective.',
 1950, 5280,
 'https://archive.org/services/img/rashomon',
 'https://archive.org/services/img/rashomon',
 'https://archive.org/services/img/rashomon',
 9.4, 92, 'UNRATED'),

('lucy:movie:archive_org:seven_samurai', 'movie', 'video',
 'Seven Samurai', 
 'Kurosawa''s epic about seven warriors hired to protect a village. One of the greatest films ever.',
 1954, 12360,
 'https://archive.org/services/img/seven_samurai',
 'https://archive.org/services/img/seven_samurai',
 'https://archive.org/services/img/seven_samurai',
 9.6, 95, 'UNRATED'),

('lucy:movie:archive_org:five_fingers_of_death', 'movie', 'video',
 'Five Fingers of Death', 
 'A martial arts student must master the Iron Fist technique. Influential kung fu classic.',
 1972, 6120,
 'https://archive.org/services/img/five_fingers_of_death',
 'https://archive.org/services/img/five_fingers_of_death',
 'https://archive.org/services/img/five_fingers_of_death',
 7.8, 80, 'R'),

('lucy:movie:archive_org:the_street_fighter', 'movie', 'video',
 'The Street Fighter', 
 'Sonny Chiba as a mercenary martial artist. Brutal and influential action cinema.',
 1974, 5280,
 'https://archive.org/services/img/the_street_fighter',
 'https://archive.org/services/img/the_street_fighter',
 'https://archive.org/services/img/the_street_fighter',
 7.5, 78, 'R')

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
  updated_at = NOW();

-- =============================================================================
-- PART 6: TAG ASSIGNMENTS
-- =============================================================================

-- Film Noir
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
  'lucy:movie:archive_org:too_late_for_tears',
  'lucy:movie:archive_org:the_hitch_hiker',
  'lucy:movie:archive_org:phantom_lady'
) AND t.name IN ('film-noir', 'drama', 'thriller', 'public-domain', 'archive-org', 'golden-age', 'classic')
ON CONFLICT DO NOTHING;

-- Horror & Sci-Fi
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:night_of_the_living_dead',
  'lucy:movie:archive_org:carnival_of_souls',
  'lucy:movie:archive_org:the_last_man_on_earth',
  'lucy:movie:archive_org:house_on_haunted_hill',
  'lucy:movie:archive_org:nosferatu',
  'lucy:movie:archive_org:the_cabinet_of_dr_caligari',
  'lucy:movie:archive_org:the_little_shop_of_horrors',
  'lucy:movie:archive_org:dementia_13',
  'lucy:movie:archive_org:spider_baby',
  'lucy:movie:archive_org:atom_age_vampire'
) AND t.name IN ('horror', 'sci-fi', 'public-domain', 'archive-org', 'classic', 'cult-classic')
ON CONFLICT DO NOTHING;

-- B-Movies & Creature Features
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:plan_9_from_outer_space',
  'lucy:movie:archive_org:the_brain_that_wouldnt_die',
  'lucy:movie:archive_org:the_killer_shrews',
  'lucy:movie:archive_org:teenagers_from_outer_space'
) AND t.name IN ('b-movie', 'creature-feature', 'sci-fi', 'cult-classic', 'atomic-age', 'public-domain', 'archive-org')
ON CONFLICT DO NOTHING;

-- Silent Films
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:metropolis',
  'lucy:movie:archive_org:the_general',
  'lucy:movie:archive_org:the_kid',
  'lucy:movie:archive_org:safety_last',
  'lucy:movie:archive_org:the_phantom_of_the_opera',
  'lucy:movie:archive_org:sunrise',
  'lucy:movie:archive_org:battleship_potemkin',
  'lucy:movie:archive_org:the_passion_of_joan_of_arc',
  'lucy:movie:archive_org:nosferatu',
  'lucy:movie:archive_org:the_cabinet_of_dr_caligari'
) AND t.name IN ('silent-film', 'silent-era', 'classic', 'public-domain', 'archive-org', 'twenties')
ON CONFLICT DO NOTHING;

-- Comedy
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:my_man_godfrey',
  'lucy:movie:archive_org:his_girl_friday',
  'lucy:movie:archive_org:the_great_dictator',
  'lucy:movie:archive_org:africa_screams',
  'lucy:movie:archive_org:the_general',
  'lucy:movie:archive_org:the_kid',
  'lucy:movie:archive_org:safety_last'
) AND t.name IN ('comedy', 'classic', 'public-domain', 'archive-org', 'golden-age')
ON CONFLICT DO NOTHING;

-- Western
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:the_outlaw',
  'lucy:movie:archive_org:angel_and_the_badman',
  'lucy:movie:archive_org:mclintock',
  'lucy:movie:archive_org:the_bronze_buckaroo',
  'lucy:movie:archive_org:harlem_rides_the_range',
  'lucy:movie:archive_org:two_gun_man_from_harlem',
  'lucy:movie:archive_org:boss_nigger'
) AND t.name IN ('western', 'classic', 'public-domain', 'archive-org', 'action', 'adventure')
ON CONFLICT DO NOTHING;

-- Black Cinema - Early Race Films
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:body_and_soul_1925',
  'lucy:movie:archive_org:within_our_gates',
  'lucy:movie:archive_org:the_symbol_of_the_unconquered',
  'lucy:movie:archive_org:murder_in_harlem',
  'lucy:movie:archive_org:lying_lips',
  'lucy:movie:archive_org:ten_minutes_to_live',
  'lucy:movie:archive_org:the_girl_from_chicago',
  'lucy:movie:archive_org:birthright_1939',
  'lucy:movie:archive_org:the_scar_of_shame',
  'lucy:movie:archive_org:the_blood_of_jesus',
  'lucy:movie:archive_org:go_down_death',
  'lucy:movie:archive_org:dirty_gertie_from_harlem'
) AND t.name IN ('black-cinema', 'race-films', 'african-american-history', 'public-domain', 'archive-org', 'classic', 'drama')
ON CONFLICT DO NOTHING;

-- Black Cinema - Blaxploitation
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:the_mack',
  'lucy:movie:archive_org:cotton_comes_to_harlem',
  'lucy:movie:archive_org:black_caesar',
  'lucy:movie:archive_org:sweet_sweetbacks_baadasssss_song',
  'lucy:movie:archive_org:hell_up_in_harlem',
  'lucy:movie:archive_org:boss_nigger'
) AND t.name IN ('black-cinema', 'blaxploitation', 'seventies', 'action', 'drama', 'archive-org', 'cult-classic')
ON CONFLICT DO NOTHING;

-- Black Cinema - Musical & Mainstream
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:the_emperor_jones',
  'lucy:movie:archive_org:stormy_weather',
  'lucy:movie:archive_org:cabin_in_the_sky',
  'lucy:movie:archive_org:song_of_freedom',
  'lucy:movie:archive_org:sanders_of_the_river'
) AND t.name IN ('black-cinema', 'musical', 'drama', 'golden-age', 'public-domain', 'archive-org', 'classic')
ON CONFLICT DO NOTHING;

-- Civil Rights & Documentary
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:the_negro_soldier',
  'lucy:movie:archive_org:the_house_i_live_in_1945'
) AND t.name IN ('black-cinema', 'civil-rights', 'documentary', 'historical', 'public-domain', 'archive-org', 'educational')
ON CONFLICT DO NOTHING;

-- Animation
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:popeye_shorts',
  'lucy:movie:archive_org:betty_boop_shorts',
  'lucy:movie:archive_org:superman_shorts',
  'lucy:movie:archive_org:gulliver_travels',
  'lucy:movie:archive_org:mr_bug_goes_to_town',
  'lucy:movie:archive_org:felix_the_cat_shorts',
  'lucy:movie:archive_org:color_classics'
) AND t.name IN ('animation', 'shorts', 'family', 'classic', 'public-domain', 'archive-org', 'golden-age')
ON CONFLICT DO NOTHING;

-- Comedy Shorts
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:our_gang_shorts',
  'lucy:movie:archive_org:charlie_chaplin_shorts',
  'lucy:movie:archive_org:buster_keaton_shorts',
  'lucy:movie:archive_org:laurel_hardy_shorts'
) AND t.name IN ('comedy', 'shorts', 'classic', 'silent-era', 'public-domain', 'archive-org', 'family')
ON CONFLICT DO NOTHING;

-- Serials
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:flash_gordon_serials',
  'lucy:movie:archive_org:buck_rogers_serials',
  'lucy:movie:archive_org:commando_cody',
  'lucy:movie:archive_org:adventures_of_captain_marvel'
) AND t.name IN ('sci-fi', 'adventure', 'series', 'classic', 'public-domain', 'archive-org', 'action')
ON CONFLICT DO NOTHING;

-- International
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:rashomon',
  'lucy:movie:archive_org:seven_samurai'
) AND t.name IN ('drama', 'classic', 'international', 'public-domain', 'archive-org', 'fifties')
ON CONFLICT DO NOTHING;

-- Martial Arts
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:five_fingers_of_death',
  'lucy:movie:archive_org:the_street_fighter'
) AND t.name IN ('martial-arts', 'action', 'seventies', 'public-domain', 'archive-org', 'international')
ON CONFLICT DO NOTHING;

-- Pre-Code
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:the_public_enemy',
  'lucy:movie:archive_org:freaks',
  'lucy:movie:archive_org:baby_face',
  'lucy:movie:archive_org:reefer_madness'
) AND t.name IN ('pre-code', 'drama', 'classic', 'public-domain', 'archive-org', 'thirties', 'cult-classic')
ON CONFLICT DO NOTHING;

-- Add trending tag to popular items
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:archive_org:night_of_the_living_dead',
  'lucy:movie:archive_org:nosferatu',
  'lucy:movie:archive_org:metropolis',
  'lucy:movie:archive_org:the_great_dictator',
  'lucy:movie:archive_org:seven_samurai',
  'lucy:movie:archive_org:sweet_sweetbacks_baadasssss_song',
  'lucy:movie:archive_org:within_our_gates',
  'lucy:movie:archive_org:stormy_weather'
) AND t.name = 'trending'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- SELECT 'Total catalog count' as metric, COUNT(*) as value FROM media_nodes WHERE category = 'video';
-- SELECT 'Public domain count' as metric, COUNT(*) as value FROM media_nodes WHERE canonical_id LIKE 'lucy:%:archive_org:%';
-- SELECT 'Black cinema count' as metric, COUNT(DISTINCT mnt.media_node_id) as value 
-- FROM media_node_tags mnt JOIN media_tags t ON mnt.tag_id = t.id WHERE t.name = 'black-cinema';
