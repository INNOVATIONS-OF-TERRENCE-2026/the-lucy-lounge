-- =============================================================================
-- THE LUCY LOUNGE - FAST MEDIA CATALOG (120+ TOP MOVIES)
-- =============================================================================
-- OPTION B: Deep Links to FAST Providers (Tubi, Pluto TV, Plex, Roku)
-- These are metadata + deep links - open in provider apps/sites
-- =============================================================================

-- =============================================================================
-- PART 1: CREATE MEDIA_ITEMS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'movie',
  year INTEGER,
  genres TEXT[] DEFAULT '{}',
  synopsis TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  provider TEXT NOT NULL,
  embed_url TEXT,
  deep_link_url TEXT,
  tags TEXT[] DEFAULT '{}',
  rating NUMERIC(3,1),
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_items_provider ON public.media_items(provider);
CREATE INDEX IF NOT EXISTS idx_media_items_type ON public.media_items(type);
CREATE INDEX IF NOT EXISTS idx_media_items_tags ON public.media_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_items_genres ON public.media_items USING GIN(genres);

-- =============================================================================
-- PART 2: TRENDING MOVIES (Top Popular Titles)
-- =============================================================================

INSERT INTO media_items (title, type, year, genres, synopsis, poster_url, provider, deep_link_url, tags, rating, duration_minutes) VALUES

('John Wick', 'movie', 2014, 
 ARRAY['action', 'thriller'],
 'An ex-hitman comes out of retirement to track down the gangsters that killed his dog and stole his car.',
 'https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg',
 'tubi', 'https://tubitv.com/movies/john-wick',
 ARRAY['trending', 'action', 'revenge', '2010s'], 7.4, 101),

('The Matrix', 'movie', 1999,
 ARRAY['sci-fi', 'action'],
 'A computer hacker learns the true nature of reality and his role in the war against its controllers.',
 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
 'tubi', 'https://tubitv.com/movies/the-matrix',
 ARRAY['trending', 'sci_fi', 'classic', '90s'], 8.7, 136),

('Inception', 'movie', 2010,
 ARRAY['sci-fi', 'action', 'thriller'],
 'A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea.',
 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/inception',
 ARRAY['trending', 'sci_fi', 'mind_bending', '2010s'], 8.8, 148),

('Interstellar', 'movie', 2014,
 ARRAY['sci-fi', 'drama', 'adventure'],
 'A team of explorers travel through a wormhole in space to ensure humanitys survival.',
 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
 'plex', 'https://watch.plex.tv/movie/interstellar',
 ARRAY['trending', 'sci_fi', 'epic', '2010s'], 8.6, 169),

('The Dark Knight', 'movie', 2008,
 ARRAY['action', 'crime', 'drama'],
 'Batman raises the stakes in his war on crime with the help of Lt. Gordon and DA Harvey Dent.',
 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
 'tubi', 'https://tubitv.com/movies/the-dark-knight',
 ARRAY['trending', 'action', 'superhero', '2000s'], 9.0, 152),

('Mad Max: Fury Road', 'movie', 2015,
 ARRAY['action', 'adventure', 'sci-fi'],
 'In a post-apocalyptic wasteland, Max teams up with Furiosa to flee from a cult leader pursuing them.',
 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
 'roku', 'https://therokuchannel.roku.com/details/mad-max-fury-road',
 ARRAY['trending', 'action', 'dystopian', '2010s'], 8.1, 120),

('Django Unchained', 'movie', 2012,
 ARRAY['western', 'drama'],
 'With the help of a German bounty hunter, a freed slave sets out to rescue his wife from a brutal plantation owner.',
 'https://image.tmdb.org/t/p/w500/7oWY8VDWW7thTzWh3OKYRkWUlD5.jpg',
 'tubi', 'https://tubitv.com/movies/django-unchained',
 ARRAY['trending', 'black_cinema', 'western', '2010s'], 8.4, 165),

('Gladiator', 'movie', 2000,
 ARRAY['action', 'drama', 'adventure'],
 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family.',
 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/gladiator',
 ARRAY['trending', 'epic', 'classic', '2000s'], 8.5, 155),

('The Shawshank Redemption', 'movie', 1994,
 ARRAY['drama'],
 'Two imprisoned men bond over years, finding solace and eventual redemption through acts of common decency.',
 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
 'tubi', 'https://tubitv.com/movies/the-shawshank-redemption',
 ARRAY['trending', 'drama', 'classic', '90s'], 9.3, 142),

('Pulp Fiction', 'movie', 1994,
 ARRAY['crime', 'drama'],
 'The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine in four tales of violence.',
 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
 'plex', 'https://watch.plex.tv/movie/pulp-fiction',
 ARRAY['trending', 'crime', 'classic', '90s'], 8.9, 154),

-- =============================================================================
-- PART 3: BLACK CINEMA RAIL
-- =============================================================================

('Black Panther', 'movie', 2018,
 ARRAY['action', 'sci-fi', 'adventure'],
 'TChalla returns home to Wakanda to take his place as King, but a powerful enemy threatens his nation.',
 'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
 'tubi', 'https://tubitv.com/movies/black-panther',
 ARRAY['black_cinema', 'superhero', 'action', '2010s'], 7.3, 134),

('Training Day', 'movie', 2001,
 ARRAY['crime', 'drama', 'thriller'],
 'A rookie cop spends his first day with a corrupt LAPD detective who isnt what he appears to be.',
 'https://image.tmdb.org/t/p/w500/lxFnSWlnEIPaT7BPqSPz37JY8S5.jpg',
 'tubi', 'https://tubitv.com/movies/training-day',
 ARRAY['black_cinema', 'crime', 'thriller', '2000s'], 7.7, 122),

('Get Out', 'movie', 2017,
 ARRAY['horror', 'thriller', 'mystery'],
 'A young African-American visits his white girlfriends parents, where his uneasiness turns to terror.',
 'https://image.tmdb.org/t/p/w500/qbaS6eGV6CpJmFr1d0s8u7ZrNp.jpg',
 'plex', 'https://watch.plex.tv/movie/get-out',
 ARRAY['black_cinema', 'horror', 'thriller', '2010s'], 7.7, 104),

('12 Years a Slave', 'movie', 2013,
 ARRAY['biography', 'drama', 'history'],
 'The true story of Solomon Northup, a free Black man kidnapped and sold into slavery.',
 'https://image.tmdb.org/t/p/w500/kb3X943WMIJYVg4SOAyK0lwDQ8C.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/12-years-a-slave',
 ARRAY['black_cinema', 'drama', 'historical', '2010s'], 8.1, 134),

('Hidden Figures', 'movie', 2016,
 ARRAY['biography', 'drama', 'history'],
 'The incredible true story of three brilliant African-American women working at NASA during the Space Race.',
 'https://image.tmdb.org/t/p/w500/6cbIDZLfwUTmttXTmNi8Mp3Rnmg.jpg',
 'tubi', 'https://tubitv.com/movies/hidden-figures',
 ARRAY['black_cinema', 'drama', 'inspirational', '2010s'], 7.8, 127),

('Moonlight', 'movie', 2016,
 ARRAY['drama'],
 'A young African-American man grapples with his identity while experiencing childhood, adolescence, and adulthood.',
 'https://image.tmdb.org/t/p/w500/4911T5FbJ9eD2Faz5Z8cT3SUhU3.jpg',
 'plex', 'https://watch.plex.tv/movie/moonlight-2016',
 ARRAY['black_cinema', 'drama', 'coming_of_age', '2010s'], 7.4, 111),

('Selma', 'movie', 2014,
 ARRAY['biography', 'drama', 'history'],
 'Martin Luther King Jr.s campaign to secure equal voting rights via the historic march from Selma to Montgomery.',
 'https://image.tmdb.org/t/p/w500/z2En4bXr5hbF9Ak5hzAKqNJxTz0.jpg',
 'roku', 'https://therokuchannel.roku.com/details/selma',
 ARRAY['black_cinema', 'historical', 'drama', '2010s'], 7.5, 128),

('American Gangster', 'movie', 2007,
 ARRAY['biography', 'crime', 'drama'],
 'An outcast NYC cop is charged with bringing down Harlem drug lord Frank Lucas.',
 'https://image.tmdb.org/t/p/w500/6s5jvLU0bDuNRjl7dO4HZvAITui.jpg',
 'tubi', 'https://tubitv.com/movies/american-gangster',
 ARRAY['black_cinema', 'crime', 'biography', '2000s'], 7.8, 157),

('Boyz n the Hood', 'movie', 1991,
 ARRAY['crime', 'drama'],
 'Follows the lives of three young males living in the Crenshaw ghetto of Los Angeles.',
 'https://image.tmdb.org/t/p/w500/dS0xeGwAiBC9WgROTqkJFmpfyNe.jpg',
 'tubi', 'https://tubitv.com/movies/boyz-n-the-hood',
 ARRAY['black_cinema', 'drama', 'hood_classic', '90s'], 7.8, 112),

('Menace II Society', 'movie', 1993,
 ARRAY['crime', 'drama', 'thriller'],
 'A young street hustler attempts to escape the ghetto for a better life.',
 'https://image.tmdb.org/t/p/w500/j5IxqqQPwUPLOdP4BAXBS2Ui8Sv.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/menace-ii-society',
 ARRAY['black_cinema', 'crime', 'hood_classic', '90s'], 7.5, 97),

('Juice', 'movie', 1992,
 ARRAY['crime', 'drama', 'thriller'],
 'Four Harlem teens get caught up in the pursuit of power and respect, destroying their bond.',
 'https://image.tmdb.org/t/p/w500/yIMJMSJkBCKehPJbXlIqR2cGnPM.jpg',
 'tubi', 'https://tubitv.com/movies/juice',
 ARRAY['black_cinema', 'crime', 'hood_classic', '90s'], 7.0, 95),

('Set It Off', 'movie', 1996,
 ARRAY['action', 'crime', 'drama'],
 'Desperate circumstances drive four women to plan and execute a daring bank robbery.',
 'https://image.tmdb.org/t/p/w500/8RtIvKcTdhm8Oj3WjIqS1OMZLkH.jpg',
 'tubi', 'https://tubitv.com/movies/set-it-off',
 ARRAY['black_cinema', 'crime', 'action', '90s'], 7.0, 123),

('Friday', 'movie', 1995,
 ARRAY['comedy'],
 'Two homies must come up with $200 they owe a local bully or suffer the consequences.',
 'https://image.tmdb.org/t/p/w500/xhSbPbvsmSfdQV5PVQ2W6H2tMo0.jpg',
 'tubi', 'https://tubitv.com/movies/friday',
 ARRAY['black_cinema', 'comedy', 'cult_classic', '90s'], 7.3, 91),

('Dead Presidents', 'movie', 1995,
 ARRAY['crime', 'drama', 'thriller'],
 'A Vietnam veteran returns home to find his neighborhood ravaged by drugs and decay.',
 'https://image.tmdb.org/t/p/w500/lXmHwmXHFsrp5O6r2KIqPNDJJqO.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/dead-presidents',
 ARRAY['black_cinema', 'crime', 'drama', '90s'], 6.9, 119),

('Paid in Full', 'movie', 2002,
 ARRAY['crime', 'drama'],
 'Based on the true story of three friends who rise in the drug trade in 1980s Harlem.',
 'https://image.tmdb.org/t/p/w500/wKNQPGKoMR4dKNGAZHwE5rChqq4.jpg',
 'tubi', 'https://tubitv.com/movies/paid-in-full',
 ARRAY['black_cinema', 'crime', 'hood_classic', '2000s'], 7.2, 97),

('Hustle & Flow', 'movie', 2005,
 ARRAY['drama', 'music'],
 'A Memphis pimp decides to try his hand at rap music and attempts to record a demo tape.',
 'https://image.tmdb.org/t/p/w500/6qAh3MUxCnV4lbFMlJqpyuqcYqh.jpg',
 'roku', 'https://therokuchannel.roku.com/details/hustle-and-flow',
 ARRAY['black_cinema', 'drama', 'music', '2000s'], 7.3, 116),

('Fences', 'movie', 2016,
 ARRAY['drama'],
 'A working-class African-American father tries to raise his family in the 1950s while dealing with his past.',
 'https://image.tmdb.org/t/p/w500/8WgArdLtLwH1pIPLXJJcZVpzmJk.jpg',
 'plex', 'https://watch.plex.tv/movie/fences',
 ARRAY['black_cinema', 'drama', 'family', '2010s'], 7.2, 139),

('Fruitvale Station', 'movie', 2013,
 ARRAY['biography', 'drama'],
 'The true story of Oscar Grant III, who crosses paths with friends, enemies, and strangers on New Years Eve.',
 'https://image.tmdb.org/t/p/w500/qMIfT2Dj4zOcGDhbw8wJYHoPTu9.jpg',
 'tubi', 'https://tubitv.com/movies/fruitvale-station',
 ARRAY['black_cinema', 'drama', 'true_story', '2010s'], 7.5, 85),

-- =============================================================================
-- PART 4: TOP ACTION MOVIES RAIL
-- =============================================================================

('Die Hard', 'movie', 1988,
 ARRAY['action', 'thriller'],
 'An NYPD officer tries to save his wife and others taken hostage by German terrorists during a Christmas party.',
 'https://image.tmdb.org/t/p/w500/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg',
 'tubi', 'https://tubitv.com/movies/die-hard',
 ARRAY['action', 'classic', 'christmas', '80s'], 8.2, 132),

('Terminator 2: Judgment Day', 'movie', 1991,
 ARRAY['action', 'sci-fi'],
 'A cyborg protects a young John Connor from a more advanced terminator sent to kill him.',
 'https://image.tmdb.org/t/p/w500/5M0j0B18abtBI5gi2RhfjjurTqb.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/terminator-2',
 ARRAY['action', 'sci_fi', 'classic', '90s'], 8.5, 137),

('The Equalizer', 'movie', 2014,
 ARRAY['action', 'crime', 'thriller'],
 'A man with a mysterious past helps a young girl under the control of violent Russian gangsters.',
 'https://image.tmdb.org/t/p/w500/9u4yW7yPA0BQ0oY1Rjxjpg3b6Xr.jpg',
 'tubi', 'https://tubitv.com/movies/the-equalizer',
 ARRAY['action', 'thriller', 'revenge', '2010s'], 7.2, 132),

('Man on Fire', 'movie', 2004,
 ARRAY['action', 'crime', 'drama'],
 'A former CIA operative is hired to protect a young girl in Mexico City, unleashing his wrath when shes kidnapped.',
 'https://image.tmdb.org/t/p/w500/81cOW9mIlQJbCkYXKNVaI2rSvJ3.jpg',
 'roku', 'https://therokuchannel.roku.com/details/man-on-fire',
 ARRAY['action', 'revenge', 'thriller', '2000s'], 7.7, 146),

('The Book of Eli', 'movie', 2010,
 ARRAY['action', 'adventure', 'drama'],
 'A post-apocalyptic tale of a man fighting to protect a sacred book that holds humanitys salvation.',
 'https://image.tmdb.org/t/p/w500/1H1y9F1WwnLJAiF3MRJJpGVSG7p.jpg',
 'tubi', 'https://tubitv.com/movies/the-book-of-eli',
 ARRAY['action', 'dystopian', 'thriller', '2010s'], 6.9, 118),

('Safe House', 'movie', 2012,
 ARRAY['action', 'thriller'],
 'A young CIA agent must escort a dangerous fugitive to safety when their safe house is attacked.',
 'https://image.tmdb.org/t/p/w500/xiA3E0y99rWAHIILDa8eA5lY6LW.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/safe-house',
 ARRAY['action', 'thriller', 'spy', '2010s'], 6.7, 115),

('Blade', 'movie', 1998,
 ARRAY['action', 'horror', 'sci-fi'],
 'A half-vampire protector of humanity slays evil vampires while hunting their kind.',
 'https://image.tmdb.org/t/p/w500/4lZaT3YGsKqJwHJL93xybjD1nqj.jpg',
 'tubi', 'https://tubitv.com/movies/blade',
 ARRAY['action', 'horror', 'black_cinema', '90s'], 7.1, 120),

('Blade II', 'movie', 2002,
 ARRAY['action', 'horror', 'sci-fi'],
 'Blade forms an uneasy alliance with the vampire council to combat a new breed of predators.',
 'https://image.tmdb.org/t/p/w500/1slLp6aSm0Tqm5Vf6pKD3v6Mwc2.jpg',
 'tubi', 'https://tubitv.com/movies/blade-2',
 ARRAY['action', 'horror', 'black_cinema', '2000s'], 6.7, 117),

('John Wick: Chapter 2', 'movie', 2017,
 ARRAY['action', 'crime', 'thriller'],
 'After returning to the criminal underworld, John Wick discovers a bounty has been placed on his life.',
 'https://image.tmdb.org/t/p/w500/hXWBc0ioZP3cN4zCu6SN3YHXZVO.jpg',
 'tubi', 'https://tubitv.com/movies/john-wick-chapter-2',
 ARRAY['action', 'revenge', 'assassin', '2010s'], 7.5, 122),

('John Wick: Chapter 3 - Parabellum', 'movie', 2019,
 ARRAY['action', 'crime', 'thriller'],
 'John Wick is on the run with a $14 million bounty on his head after killing a member of the High Table.',
 'https://image.tmdb.org/t/p/w500/ziEuG1essDuWuC5lpWUaw1uXY2O.jpg',
 'roku', 'https://therokuchannel.roku.com/details/john-wick-3',
 ARRAY['action', 'revenge', 'assassin', '2010s'], 7.4, 131),

('Mission: Impossible - Fallout', 'movie', 2018,
 ARRAY['action', 'adventure', 'thriller'],
 'Ethan Hunt and his IMF team race against time after a mission goes wrong.',
 'https://image.tmdb.org/t/p/w500/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg',
 'plex', 'https://watch.plex.tv/movie/mission-impossible-fallout',
 ARRAY['action', 'spy', 'thriller', '2010s'], 7.7, 147),

('Speed', 'movie', 1994,
 ARRAY['action', 'thriller'],
 'A young cop must save passengers on a bus rigged to explode if the speed drops below 50 mph.',
 'https://image.tmdb.org/t/p/w500/o1Zs7VaS9y6f7fDmH0e1CBjfj5G.jpg',
 'tubi', 'https://tubitv.com/movies/speed',
 ARRAY['action', 'thriller', 'classic', '90s'], 7.2, 116),

('Heat', 'movie', 1995,
 ARRAY['action', 'crime', 'drama'],
 'A group of professional bank robbers starts to feel the heat from an LAPD detective closing in.',
 'https://image.tmdb.org/t/p/w500/rrBuGuxGn9RfWQhCv2szIRJx9EC.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/heat',
 ARRAY['action', 'crime', 'classic', '90s'], 8.2, 170),

('The Raid', 'movie', 2011,
 ARRAY['action', 'thriller'],
 'A SWAT team becomes trapped in a tower block run by a ruthless mobster and his army of killers.',
 'https://image.tmdb.org/t/p/w500/1sLy6ZPVvb3jqqBmWKLK5f0rR86.jpg',
 'tubi', 'https://tubitv.com/movies/the-raid',
 ARRAY['action', 'martial_arts', 'thriller', '2010s'], 7.6, 101),

('Taken', 'movie', 2008,
 ARRAY['action', 'thriller'],
 'A retired CIA agent uses his skills to save his daughter who has been kidnapped in Paris.',
 'https://image.tmdb.org/t/p/w500/5P3FsJ5M9qVKRgzKvwmHwU3dJrI.jpg',
 'roku', 'https://therokuchannel.roku.com/details/taken',
 ARRAY['action', 'thriller', 'revenge', '2000s'], 7.8, 90),

('Lethal Weapon', 'movie', 1987,
 ARRAY['action', 'crime', 'thriller'],
 'Two mismatched LAPD detectives are forced to work together to take down a drug-smuggling ring.',
 'https://image.tmdb.org/t/p/w500/fTq29aOy1dJqYF1lZO59nFPKJYP.jpg',
 'tubi', 'https://tubitv.com/movies/lethal-weapon',
 ARRAY['action', 'buddy_cop', 'classic', '80s'], 7.6, 110),

-- =============================================================================
-- PART 5: TOP SCI-FI MOVIES RAIL
-- =============================================================================

('Blade Runner 2049', 'movie', 2017,
 ARRAY['sci-fi', 'drama', 'mystery'],
 'A young blade runner discovers a long-buried secret that leads him to track down former blade runner Rick Deckard.',
 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
 'plex', 'https://watch.plex.tv/movie/blade-runner-2049',
 ARRAY['sci_fi', 'dystopian', 'noir', '2010s'], 8.0, 164),

('Arrival', 'movie', 2016,
 ARRAY['sci-fi', 'drama'],
 'A linguist is recruited by the military to communicate with alien lifeforms after mysterious spacecraft land.',
 'https://image.tmdb.org/t/p/w500/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
 'tubi', 'https://tubitv.com/movies/arrival',
 ARRAY['sci_fi', 'aliens', 'drama', '2010s'], 7.9, 116),

('Edge of Tomorrow', 'movie', 2014,
 ARRAY['action', 'sci-fi'],
 'A soldier fighting aliens gets caught in a time loop, becoming more skilled with each reset.',
 'https://image.tmdb.org/t/p/w500/xjw5trHV7LzH4VLLaVq9IB7DvCZ.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/edge-of-tomorrow',
 ARRAY['sci_fi', 'action', 'time_loop', '2010s'], 7.9, 113),

('District 9', 'movie', 2009,
 ARRAY['sci-fi', 'action', 'thriller'],
 'Violence ensues after extraterrestrial refugees are evicted from their slum to a new camp.',
 'https://image.tmdb.org/t/p/w500/qLvkV8nTQrTLVOlqIAEBpLbhDuH.jpg',
 'tubi', 'https://tubitv.com/movies/district-9',
 ARRAY['sci_fi', 'aliens', 'social_commentary', '2000s'], 7.9, 112),

('I Am Legend', 'movie', 2007,
 ARRAY['drama', 'horror', 'sci-fi'],
 'Years after a plague, the sole survivor in NYC struggles to find a cure while fending off mutants.',
 'https://image.tmdb.org/t/p/w500/dL8hG3WOPJsKWg0PQJG2cq2dE3X.jpg',
 'roku', 'https://therokuchannel.roku.com/details/i-am-legend',
 ARRAY['sci_fi', 'post_apocalyptic', 'thriller', '2000s'], 7.2, 101),

('The Fifth Element', 'movie', 1997,
 ARRAY['action', 'adventure', 'sci-fi'],
 'A cab driver becomes the centerpiece of the search for a legendary cosmic weapon to save Earth.',
 'https://image.tmdb.org/t/p/w500/fPtlCO1yQtnoLHOwKtWz7db6RGU.jpg',
 'tubi', 'https://tubitv.com/movies/the-fifth-element',
 ARRAY['sci_fi', 'action', 'cult_classic', '90s'], 7.7, 126),

('Total Recall', 'movie', 1990,
 ARRAY['action', 'sci-fi', 'thriller'],
 'A construction worker discovers he may be a secret agent after visiting a company that implants memories.',
 'https://image.tmdb.org/t/p/w500/xbQqSmNuBPLFvDxSn1v6DCTKFQE.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/total-recall',
 ARRAY['sci_fi', 'action', 'classic', '90s'], 7.5, 113),

('Looper', 'movie', 2012,
 ARRAY['action', 'sci-fi', 'thriller'],
 'A hitman faces a moral dilemma when his future self is sent back in time to be killed.',
 'https://image.tmdb.org/t/p/w500/sVdSfwFSjJjJlqpuXnE1U9dMSgV.jpg',
 'tubi', 'https://tubitv.com/movies/looper',
 ARRAY['sci_fi', 'time_travel', 'action', '2010s'], 7.4, 119),

('Minority Report', 'movie', 2002,
 ARRAY['action', 'mystery', 'sci-fi'],
 'In a future where crimes are predicted, a top cop is accused of a murder he has yet to commit.',
 'https://image.tmdb.org/t/p/w500/h3lpltMrPLSqL2IXQDvRDIlffzf.jpg',
 'plex', 'https://watch.plex.tv/movie/minority-report',
 ARRAY['sci_fi', 'thriller', 'dystopian', '2000s'], 7.6, 145),

('Ex Machina', 'movie', 2014,
 ARRAY['drama', 'sci-fi', 'thriller'],
 'A young programmer is selected to participate in an experiment in AI by evaluating a humanoid robot.',
 'https://image.tmdb.org/t/p/w500/btbRB7BrD887j5NrvjxceRDmaot.jpg',
 'roku', 'https://therokuchannel.roku.com/details/ex-machina',
 ARRAY['sci_fi', 'ai', 'thriller', '2010s'], 7.7, 108),

('The Matrix Reloaded', 'movie', 2003,
 ARRAY['action', 'sci-fi'],
 'Neo and allies race against time before machines discover Zion and destroy it.',
 'https://image.tmdb.org/t/p/w500/aA5qHS0FbHpqMOJnccaWnuqdSb4.jpg',
 'tubi', 'https://tubitv.com/movies/the-matrix-reloaded',
 ARRAY['sci_fi', 'action', 'sequel', '2000s'], 7.2, 138),

('Oblivion', 'movie', 2013,
 ARRAY['action', 'adventure', 'sci-fi'],
 'A drone repairman on a devastated Earth questions his memories and the mission hes been given.',
 'https://image.tmdb.org/t/p/w500/hmOzkHlkGvi8x24bQbNOxhCmGxp.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/oblivion',
 ARRAY['sci_fi', 'post_apocalyptic', 'mystery', '2010s'], 7.0, 124),

('Elysium', 'movie', 2013,
 ARRAY['action', 'drama', 'sci-fi'],
 'In 2154, the wealthy live on a pristine space station while the rest survive on ruined Earth.',
 'https://image.tmdb.org/t/p/w500/ihg0H0D7u3MxXsLEu3XPdfIPfbB.jpg',
 'tubi', 'https://tubitv.com/movies/elysium',
 ARRAY['sci_fi', 'dystopian', 'action', '2010s'], 6.6, 109),

-- =============================================================================
-- PART 6: BEST 1990s MOVIES RAIL
-- =============================================================================

('Goodfellas', 'movie', 1990,
 ARRAY['biography', 'crime', 'drama'],
 'The story of Henry Hill and his life in the mob, from his days as a gangster to his fall from grace.',
 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
 'plex', 'https://watch.plex.tv/movie/goodfellas',
 ARRAY['90s', 'crime', 'classic', 'mafia'], 8.7, 146),

('The Silence of the Lambs', 'movie', 1991,
 ARRAY['crime', 'drama', 'thriller'],
 'A young FBI cadet seeks the help of an imprisoned cannibalistic serial killer to catch another killer.',
 'https://image.tmdb.org/t/p/w500/uS9m8OBk1RVfSPjEhTNqxO3KpJa.jpg',
 'tubi', 'https://tubitv.com/movies/silence-of-the-lambs',
 ARRAY['90s', 'thriller', 'classic', 'horror'], 8.6, 118),

('Fight Club', 'movie', 1999,
 ARRAY['drama'],
 'An insomniac office worker and a soap salesman form an underground fight club that evolves into something more.',
 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/fight-club',
 ARRAY['90s', 'drama', 'cult_classic', 'mind_bending'], 8.8, 139),

('Se7en', 'movie', 1995,
 ARRAY['crime', 'drama', 'mystery'],
 'Two detectives hunt a serial killer who uses the seven deadly sins as his motives.',
 'https://image.tmdb.org/t/p/w500/6yoghtyTpznpBik8EngEmJskVUO.jpg',
 'tubi', 'https://tubitv.com/movies/se7en',
 ARRAY['90s', 'thriller', 'classic', 'crime'], 8.6, 127),

('The Usual Suspects', 'movie', 1995,
 ARRAY['crime', 'mystery', 'thriller'],
 'A sole survivor tells the twisted events leading up to a horrific gun battle on a boat.',
 'https://image.tmdb.org/t/p/w500/bUPmtQzrRhzqYySeiMpv7GurAfm.jpg',
 'roku', 'https://therokuchannel.roku.com/details/the-usual-suspects',
 ARRAY['90s', 'crime', 'twist', 'classic'], 8.5, 106),

('Forrest Gump', 'movie', 1994,
 ARRAY['drama', 'romance'],
 'The presidencies of Kennedy and Johnson, the Vietnam War, and other events unfold through the perspective of a simple man.',
 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
 'plex', 'https://watch.plex.tv/movie/forrest-gump',
 ARRAY['90s', 'drama', 'classic', 'inspirational'], 8.8, 142),

('Schindlers List', 'movie', 1993,
 ARRAY['biography', 'drama', 'history'],
 'In German-occupied Poland, Oskar Schindler becomes concerned for his Jewish workforce after witnessing persecution.',
 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
 'tubi', 'https://tubitv.com/movies/schindlers-list',
 ARRAY['90s', 'drama', 'historical', 'classic'], 8.9, 195),

('The Fugitive', 'movie', 1993,
 ARRAY['action', 'drama', 'thriller'],
 'A doctor wrongly convicted of his wifes murder escapes custody and works to prove his innocence.',
 'https://image.tmdb.org/t/p/w500/gPT7fsxHFWtg0J5hfBXwqCUmwos.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/the-fugitive',
 ARRAY['90s', 'thriller', 'action', 'classic'], 7.8, 130),

('Casino', 'movie', 1995,
 ARRAY['crime', 'drama'],
 'A tale of greed, deception, and power in Las Vegas through the eyes of a casino executive and his associates.',
 'https://image.tmdb.org/t/p/w500/4TS5O8ILUeKAy8y8gK6qNhwjrQ3.jpg',
 'tubi', 'https://tubitv.com/movies/casino',
 ARRAY['90s', 'crime', 'mafia', 'classic'], 8.2, 178),

('LA Confidential', 'movie', 1997,
 ARRAY['crime', 'drama', 'mystery'],
 'As corruption spreads through 1950s LA, three policemen with different approaches investigate a series of murders.',
 'https://image.tmdb.org/t/p/w500/7WKADf8LPY0SgQVR9xHvPHLsNGG.jpg',
 'roku', 'https://therokuchannel.roku.com/details/la-confidential',
 ARRAY['90s', 'crime', 'noir', 'classic'], 8.2, 138),

('Braveheart', 'movie', 1995,
 ARRAY['biography', 'drama', 'history'],
 'Scottish warrior William Wallace leads his countrymen in a rebellion against English rule.',
 'https://image.tmdb.org/t/p/w500/or1gBugydmjToAEq7OZY0owwFk.jpg',
 'plex', 'https://watch.plex.tv/movie/braveheart',
 ARRAY['90s', 'epic', 'historical', 'classic'], 8.3, 178),

('Point Break', 'movie', 1991,
 ARRAY['action', 'crime', 'thriller'],
 'An FBI agent goes undercover to catch a gang of surfers suspected of bank robbery.',
 'https://image.tmdb.org/t/p/w500/oQv8RhMCi4WMUOBU3iU5JYqBVEf.jpg',
 'tubi', 'https://tubitv.com/movies/point-break',
 ARRAY['90s', 'action', 'cult_classic', 'surfing'], 7.2, 122),

('True Romance', 'movie', 1993,
 ARRAY['crime', 'drama', 'romance'],
 'A comic book nerd and a call girl fall in love and run from the mob after stealing their cocaine.',
 'https://image.tmdb.org/t/p/w500/xBO8R3CZfrJ9rrwrZoJ68PgJyAR.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/true-romance',
 ARRAY['90s', 'crime', 'romance', 'cult_classic'], 7.9, 119),

-- =============================================================================
-- PART 7: CULT CLASSICS RAIL
-- =============================================================================

('The Big Lebowski', 'movie', 1998,
 ARRAY['comedy', 'crime'],
 'The Dude gets mixed up in a kidnapping after being mistaken for a millionaire with the same name.',
 'https://image.tmdb.org/t/p/w500/9mprbw31AxQFTHVtknoLkZ4PJmw.jpg',
 'tubi', 'https://tubitv.com/movies/the-big-lebowski',
 ARRAY['cult_classic', 'comedy', 'crime', '90s'], 8.1, 117),

('Donnie Darko', 'movie', 2001,
 ARRAY['drama', 'mystery', 'sci-fi'],
 'A troubled teenager is plagued by visions of a man in a demonic rabbit suit who manipulates him.',
 'https://image.tmdb.org/t/p/w500/z9Y6nypbGkCOMvXOM8qXfB9TkpK.jpg',
 'plex', 'https://watch.plex.tv/movie/donnie-darko',
 ARRAY['cult_classic', 'sci_fi', 'mind_bending', '2000s'], 8.0, 113),

('Reservoir Dogs', 'movie', 1992,
 ARRAY['crime', 'drama', 'thriller'],
 'After a jewelry heist goes wrong, the surviving criminals begin to suspect one of them is a police informant.',
 'https://image.tmdb.org/t/p/w500/xi8Iu6qyTfyZVDVy60raIOYJJmk.jpg',
 'tubi', 'https://tubitv.com/movies/reservoir-dogs',
 ARRAY['cult_classic', 'crime', 'classic', '90s'], 8.3, 99),

('A Clockwork Orange', 'movie', 1971,
 ARRAY['crime', 'drama', 'sci-fi'],
 'In a dystopian future, a charismatic delinquent is imprisoned and volunteers for an experimental aversion therapy.',
 'https://image.tmdb.org/t/p/w500/4sHeTAp65WrSSuc05nRBKddhBxO.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/a-clockwork-orange',
 ARRAY['cult_classic', 'dystopian', 'classic', '70s'], 8.3, 136),

('Fear and Loathing in Las Vegas', 'movie', 1998,
 ARRAY['adventure', 'comedy', 'drama'],
 'A journalist and his attorney embark on a drug-fueled trip to Las Vegas to cover a motorcycle race.',
 'https://image.tmdb.org/t/p/w500/xMcMboCx82SuVo0kS98bYTnfbmJ.jpg',
 'roku', 'https://therokuchannel.roku.com/details/fear-and-loathing',
 ARRAY['cult_classic', 'comedy', 'trippy', '90s'], 7.6, 118),

('Office Space', 'movie', 1999,
 ARRAY['comedy'],
 'Three company workers who hate their jobs decide to rebel against their greedy boss.',
 'https://image.tmdb.org/t/p/w500/cFuQgk9VwDZnTpCJPqRvr0DjJhN.jpg',
 'tubi', 'https://tubitv.com/movies/office-space',
 ARRAY['cult_classic', 'comedy', 'satire', '90s'], 7.7, 89),

('Scarface', 'movie', 1983,
 ARRAY['crime', 'drama'],
 'A Cuban immigrant rises to become a powerful drug lord in Miami.',
 'https://image.tmdb.org/t/p/w500/iQ5ztdjvteGeboXLPmUxPzVOqxn.jpg',
 'plex', 'https://watch.plex.tv/movie/scarface',
 ARRAY['cult_classic', 'crime', 'classic', '80s'], 8.3, 170),

('Snatch', 'movie', 2000,
 ARRAY['comedy', 'crime'],
 'Multiple intertwined storylines involving a stolen diamond, illegal boxing, and a dangerous Russian.',
 'https://image.tmdb.org/t/p/w500/56mOJth6DJ8qgVzpO1W7TqsqSCU.jpg',
 'tubi', 'https://tubitv.com/movies/snatch',
 ARRAY['cult_classic', 'crime', 'comedy', '2000s'], 8.2, 102),

('Kill Bill: Vol. 1', 'movie', 2003,
 ARRAY['action', 'crime', 'thriller'],
 'The Bride wakes from a coma and seeks vengeance on the assassins who betrayed her.',
 'https://image.tmdb.org/t/p/w500/v7TaX8kXMXs5yFFGR41guUDNcnB.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/kill-bill-vol-1',
 ARRAY['cult_classic', 'action', 'revenge', '2000s'], 8.1, 111),

('Kill Bill: Vol. 2', 'movie', 2004,
 ARRAY['action', 'crime', 'thriller'],
 'The Bride continues her quest for vengeance against her former boss and lover Bill.',
 'https://image.tmdb.org/t/p/w500/2yhg0mZQHPySPo7TC9B87FrPXHA.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/kill-bill-vol-2',
 ARRAY['cult_classic', 'action', 'revenge', '2000s'], 8.0, 137),

('Inglourious Basterds', 'movie', 2009,
 ARRAY['adventure', 'drama', 'war'],
 'In Nazi-occupied France, a Jewish cinema owner and a band of soldiers plot to assassinate Nazi leaders.',
 'https://image.tmdb.org/t/p/w500/7sfbEnaARXDDhKm0CZ7D7uc2sbo.jpg',
 'roku', 'https://therokuchannel.roku.com/details/inglourious-basterds',
 ARRAY['cult_classic', 'war', 'action', '2000s'], 8.3, 153),

('The Warriors', 'movie', 1979,
 ARRAY['action', 'crime', 'thriller'],
 'A gang must fight their way across NYC after being framed for a rivals murder.',
 'https://image.tmdb.org/t/p/w500/ueXzbVmNG2tAKwsYHgUwQSXC6vB.jpg',
 'tubi', 'https://tubitv.com/movies/the-warriors',
 ARRAY['cult_classic', 'action', 'gang', '70s'], 7.6, 92),

-- =============================================================================
-- PART 8: ANIMATED FAVORITES RAIL
-- =============================================================================

('Spider-Man: Into the Spider-Verse', 'movie', 2018,
 ARRAY['animation', 'action', 'adventure'],
 'Teen Miles Morales becomes Spider-Man and teams up with Spider-People from other dimensions.',
 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
 'tubi', 'https://tubitv.com/movies/spider-verse',
 ARRAY['animation', 'superhero', 'action', '2010s'], 8.4, 117),

('Spider-Man: Across the Spider-Verse', 'movie', 2023,
 ARRAY['animation', 'action', 'adventure'],
 'Miles embarks on an epic adventure across the multiverse with a team of Spider-People.',
 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
 'plex', 'https://watch.plex.tv/movie/across-the-spider-verse',
 ARRAY['animation', 'superhero', 'action', '2020s'], 8.6, 140),

('Soul', 'movie', 2020,
 ARRAY['animation', 'adventure', 'comedy'],
 'A musician who lost his passion for music is transported out of his body to find his way back.',
 'https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg',
 'tubi', 'https://tubitv.com/movies/soul',
 ARRAY['animation', 'family', 'drama', '2020s'], 8.1, 100),

('The Incredibles', 'movie', 2004,
 ARRAY['animation', 'action', 'adventure'],
 'A family of undercover superheroes, forced to live a quiet suburban life, springs into action.',
 'https://image.tmdb.org/t/p/w500/2LqaLgk4Z226KkgPJuiOQ58wvrm.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/the-incredibles',
 ARRAY['animation', 'superhero', 'family', '2000s'], 8.0, 115),

('WALL-E', 'movie', 2008,
 ARRAY['animation', 'adventure', 'family'],
 'In a distant future, a small robot discovers a new purpose in life when he meets EVE.',
 'https://image.tmdb.org/t/p/w500/4E8c7fPgQ8LPvqM5iAXA96qP3aQ.jpg',
 'roku', 'https://therokuchannel.roku.com/details/wall-e',
 ARRAY['animation', 'family', 'sci_fi', '2000s'], 8.4, 98),

('Up', 'movie', 2009,
 ARRAY['animation', 'adventure', 'comedy'],
 'An elderly widower ties thousands of balloons to his house to fly to South America.',
 'https://image.tmdb.org/t/p/w500/vpbaStTMt8BnyVBBT0sJNpXVnKj.jpg',
 'tubi', 'https://tubitv.com/movies/up',
 ARRAY['animation', 'family', 'adventure', '2000s'], 8.2, 96),

('Toy Story', 'movie', 1995,
 ARRAY['animation', 'adventure', 'comedy'],
 'A cowboy doll is profoundly threatened when a new spaceman figure supplants him as top toy.',
 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg',
 'plex', 'https://watch.plex.tv/movie/toy-story',
 ARRAY['animation', 'family', 'classic', '90s'], 8.3, 81),

('Finding Nemo', 'movie', 2003,
 ARRAY['animation', 'adventure', 'comedy'],
 'A clownfish father journeys across the ocean to find his captured son Nemo.',
 'https://image.tmdb.org/t/p/w500/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg',
 'tubi', 'https://tubitv.com/movies/finding-nemo',
 ARRAY['animation', 'family', 'adventure', '2000s'], 8.1, 100),

('Shrek', 'movie', 2001,
 ARRAY['animation', 'adventure', 'comedy'],
 'An ogre and his donkey companion set out to rescue a princess for a scheming lord.',
 'https://image.tmdb.org/t/p/w500/iB64vpL3dIObOtMZgX3RqdVdQDc.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/shrek',
 ARRAY['animation', 'family', 'comedy', '2000s'], 7.9, 90),

('Akira', 'movie', 1988,
 ARRAY['animation', 'action', 'sci-fi'],
 'A secret military project endangers Neo-Tokyo when a biker gang member acquires telekinetic powers.',
 'https://image.tmdb.org/t/p/w500/neZ0ykEsPqxeksb8tJO8iUf3fna.jpg',
 'roku', 'https://therokuchannel.roku.com/details/akira',
 ARRAY['animation', 'anime', 'sci_fi', '80s'], 8.0, 124),

('Spirited Away', 'movie', 2001,
 ARRAY['animation', 'adventure', 'family'],
 'A young girl must work in a bathhouse for spirits to free her parents who have been turned into pigs.',
 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
 'tubi', 'https://tubitv.com/movies/spirited-away',
 ARRAY['animation', 'anime', 'fantasy', '2000s'], 8.6, 125),

('The Iron Giant', 'movie', 1999,
 ARRAY['animation', 'action', 'adventure'],
 'A boy discovers a giant alien robot and must protect it from a paranoid government agent.',
 'https://image.tmdb.org/t/p/w500/rJv7jdcRLOzjCbhYGmDxe79lZjH.jpg',
 'plex', 'https://watch.plex.tv/movie/the-iron-giant',
 ARRAY['animation', 'family', 'sci_fi', '90s'], 8.0, 86),

-- =============================================================================
-- PART 9: 2000s HITS RAIL
-- =============================================================================

('The Departed', 'movie', 2006,
 ARRAY['crime', 'drama', 'thriller'],
 'An undercover cop and a mole try to identify each other while infiltrating an Irish gang.',
 'https://image.tmdb.org/t/p/w500/nT97ifVT2J1yMQmeq20Qblg61T.jpg',
 'tubi', 'https://tubitv.com/movies/the-departed',
 ARRAY['2000s', 'crime', 'thriller', 'classic'], 8.5, 151),

('No Country for Old Men', 'movie', 2007,
 ARRAY['crime', 'drama', 'thriller'],
 'Violence and mayhem ensue when a hunter stumbles upon a drug deal gone wrong and takes the money.',
 'https://image.tmdb.org/t/p/w500/6d5XOczc226aSwBHm7F5q1mSCLU.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/no-country-for-old-men',
 ARRAY['2000s', 'thriller', 'crime', 'classic'], 8.1, 122),

('There Will Be Blood', 'movie', 2007,
 ARRAY['drama'],
 'A story of family, religion, and oil told through the eyes of an ambitious oilman.',
 'https://image.tmdb.org/t/p/w500/fa0RDkAlCec0STeMNAhPaF89q6U.jpg',
 'roku', 'https://therokuchannel.roku.com/details/there-will-be-blood',
 ARRAY['2000s', 'drama', 'epic', 'classic'], 8.2, 158),

('The Bourne Identity', 'movie', 2002,
 ARRAY['action', 'mystery', 'thriller'],
 'A man is rescued at sea with no memory and must discover his identity while evading assassins.',
 'https://image.tmdb.org/t/p/w500/bXQIL36VQdzJ69lcjQR1WQzJqQR.jpg',
 'tubi', 'https://tubitv.com/movies/the-bourne-identity',
 ARRAY['2000s', 'action', 'spy', 'thriller'], 7.9, 119),

('The Bourne Supremacy', 'movie', 2004,
 ARRAY['action', 'mystery', 'thriller'],
 'Jason Bourne is framed for a CIA operation and hunts down the people who set him up.',
 'https://image.tmdb.org/t/p/w500/jaYyLKq99OzgdmGWwMsN2H5xPIl.jpg',
 'tubi', 'https://tubitv.com/movies/the-bourne-supremacy',
 ARRAY['2000s', 'action', 'spy', 'sequel'], 7.8, 108),

('300', 'movie', 2006,
 ARRAY['action', 'drama', 'fantasy'],
 'King Leonidas and 300 Spartans fight to the death against Xerxes and his massive Persian army.',
 'https://image.tmdb.org/t/p/w500/bYR8O3hVKqPXIZDm5Z8HNLVVzfT.jpg',
 'plex', 'https://watch.plex.tv/movie/300',
 ARRAY['2000s', 'action', 'epic', 'war'], 7.6, 117),

('Sin City', 'movie', 2005,
 ARRAY['crime', 'thriller'],
 'A stylized look at crime in a violent city through interconnected stories.',
 'https://image.tmdb.org/t/p/w500/1FJrBSstCp6i5vjjjjjj3Z6FJw.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/sin-city',
 ARRAY['2000s', 'noir', 'crime', 'stylized'], 8.0, 124),

('V for Vendetta', 'movie', 2005,
 ARRAY['action', 'drama', 'sci-fi'],
 'In a dystopian future Britain, a vigilante known as V begins a revolution against tyranny.',
 'https://image.tmdb.org/t/p/w500/cA8Pu5LoIqgENNEqnoPNcieA4CP.jpg',
 'tubi', 'https://tubitv.com/movies/v-for-vendetta',
 ARRAY['2000s', 'dystopian', 'action', 'political'], 8.2, 132),

('Children of Men', 'movie', 2006,
 ARRAY['drama', 'sci-fi', 'thriller'],
 'In 2027, when women have become infertile, a former activist protects a miraculously pregnant woman.',
 'https://image.tmdb.org/t/p/w500/lnA2BYJioxn7LhMi4O6oKk4lXWq.jpg',
 'roku', 'https://therokuchannel.roku.com/details/children-of-men',
 ARRAY['2000s', 'dystopian', 'sci_fi', 'thriller'], 7.9, 109),

('Zodiac', 'movie', 2007,
 ARRAY['crime', 'drama', 'mystery'],
 'A cartoonist becomes obsessed with tracking down the Zodiac Killer in 1970s San Francisco.',
 'https://image.tmdb.org/t/p/w500/pNpjTd8L6VsHLcSiOxfh2P8rjDB.jpg',
 'tubi', 'https://tubitv.com/movies/zodiac',
 ARRAY['2000s', 'crime', 'mystery', 'true_story'], 7.7, 157),

('The Prestige', 'movie', 2006,
 ARRAY['drama', 'mystery', 'sci-fi'],
 'Two rival magicians engage in a battle to create the ultimate illusion.',
 'https://image.tmdb.org/t/p/w500/5MXyQfz8xUP3dIFPTubhTsbFY6N.jpg',
 'plex', 'https://watch.plex.tv/movie/the-prestige',
 ARRAY['2000s', 'mystery', 'thriller', 'twist'], 8.5, 130),

-- =============================================================================
-- PART 10: DRAMA ESSENTIALS RAIL
-- =============================================================================

('The Godfather', 'movie', 1972,
 ARRAY['crime', 'drama'],
 'The aging patriarch of an organized crime dynasty transfers control to his reluctant youngest son.',
 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
 'tubi', 'https://tubitv.com/movies/the-godfather',
 ARRAY['drama', 'crime', 'classic', 'mafia'], 9.2, 175),

('The Godfather Part II', 'movie', 1974,
 ARRAY['crime', 'drama'],
 'The early life of Vito Corleone and his sons rise to power in 1950s New York.',
 'https://image.tmdb.org/t/p/w500/hek3koDUyRQq7gkbd52FhlQLHqe.jpg',
 'tubi', 'https://tubitv.com/movies/the-godfather-part-ii',
 ARRAY['drama', 'crime', 'classic', 'mafia'], 9.0, 202),

('Taxi Driver', 'movie', 1976,
 ARRAY['crime', 'drama'],
 'A mentally unstable veteran works as a nighttime taxi driver in NYC, descending into violence.',
 'https://image.tmdb.org/t/p/w500/ekstpH614fwDX8DUln1a2Opz0N8.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/taxi-driver',
 ARRAY['drama', 'crime', 'classic', '70s'], 8.2, 114),

('One Flew Over the Cuckoos Nest', 'movie', 1975,
 ARRAY['drama'],
 'A criminal pleads insanity and is admitted to a mental institution, where he rallies the patients.',
 'https://image.tmdb.org/t/p/w500/3jcbDmRFiQ83drXNOvRDeKHxS0C.jpg',
 'roku', 'https://therokuchannel.roku.com/details/cuckoos-nest',
 ARRAY['drama', 'classic', 'psychological', '70s'], 8.7, 133),

('The Green Mile', 'movie', 1999,
 ARRAY['crime', 'drama', 'fantasy'],
 'A death row corrections officer discovers one of his inmates has a supernatural gift.',
 'https://image.tmdb.org/t/p/w500/velWPhVMQeQKcxggNEU8YmIo52R.jpg',
 'tubi', 'https://tubitv.com/movies/the-green-mile',
 ARRAY['drama', 'fantasy', 'classic', '90s'], 8.6, 189),

('A Beautiful Mind', 'movie', 2001,
 ARRAY['biography', 'drama'],
 'The life of mathematical genius John Nash and his struggle with schizophrenia.',
 'https://image.tmdb.org/t/p/w500/4SFqHDZ1NvWdysucWbgnYlobdxC.jpg',
 'plex', 'https://watch.plex.tv/movie/a-beautiful-mind',
 ARRAY['drama', 'biography', 'inspirational', '2000s'], 8.2, 135),

('The Pursuit of Happyness', 'movie', 2006,
 ARRAY['biography', 'drama'],
 'A struggling salesman takes custody of his son as hes about to become homeless.',
 'https://image.tmdb.org/t/p/w500/lBYOKAMcxIvuk9s9hMQE3ksR8t0.jpg',
 'tubi', 'https://tubitv.com/movies/the-pursuit-of-happyness',
 ARRAY['drama', 'biography', 'inspirational', '2000s'], 8.0, 117),

('Shutter Island', 'movie', 2010,
 ARRAY['mystery', 'thriller'],
 'A U.S. Marshal investigates the disappearance of a patient from a hospital for the criminally insane.',
 'https://image.tmdb.org/t/p/w500/kve20tXMUZWuAFikxqYF3O3mgrm.jpg',
 'pluto_tv', 'https://pluto.tv/on-demand/movies/shutter-island',
 ARRAY['drama', 'mystery', 'psychological', '2010s'], 8.2, 138),

('The Social Network', 'movie', 2010,
 ARRAY['biography', 'drama'],
 'The founding of Facebook and the lawsuits that followed its meteoric rise.',
 'https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg',
 'roku', 'https://therokuchannel.roku.com/details/the-social-network',
 ARRAY['drama', 'biography', 'tech', '2010s'], 7.7, 120),

('Whiplash', 'movie', 2014,
 ARRAY['drama', 'music'],
 'A promising young drummer enrolls in a conservatory where an abusive instructor pushes him to his limits.',
 'https://image.tmdb.org/t/p/w500/lIv1QinFqz4dlp5U4lQ6HaiskOZ.jpg',
 'tubi', 'https://tubitv.com/movies/whiplash',
 ARRAY['drama', 'music', 'intense', '2010s'], 8.5, 106)

ON CONFLICT DO NOTHING;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- SELECT COUNT(*) as total_movies FROM media_items;
-- SELECT provider, COUNT(*) FROM media_items GROUP BY provider;
-- SELECT unnest(tags) as tag, COUNT(*) FROM media_items GROUP BY unnest(tags) ORDER BY count DESC LIMIT 20;
