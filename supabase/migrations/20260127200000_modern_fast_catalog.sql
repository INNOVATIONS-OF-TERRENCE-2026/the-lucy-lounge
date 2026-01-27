-- =============================================================================
-- THE LUCY LOUNGE - MODERN FAST MEDIA CATALOG (2000s-2020s)
-- =============================================================================
-- METADATA ONLY - No video files stored
-- All content references FAST provider deep links
-- Modern era focus: 2000-2025
-- =============================================================================

-- =============================================================================
-- PART 1: MODERN ERA TAGS
-- =============================================================================

INSERT INTO media_tags (name, slug, tag_type) VALUES
-- Modern Era Tags
('modern', 'modern', 'era'),
('2000s', '2000s', 'era'),
('2010s', '2010s', 'era'),
('2020s', '2020s', 'era'),
('streaming-era', 'streaming-era', 'era'),

-- Modern Genre Tags
('crime', 'crime', 'genre'),
('street', 'street', 'genre'),
('heist', 'heist', 'genre'),
('superhero', 'superhero', 'genre'),
('urban', 'urban', 'theme'),
('hood-classic', 'hood-classic', 'style'),
('coming-of-age', 'coming-of-age', 'theme'),
('biographical', 'biographical', 'genre'),
('sports-drama', 'sports-drama', 'genre'),

-- Modern Black Cinema Tags
('modern-black-cinema', 'modern-black-cinema', 'theme'),
('afrofuturism', 'afrofuturism', 'style'),
('black-excellence', 'black-excellence', 'theme'),
('hbcu', 'hbcu', 'theme'),

-- TV Tags
('limited-series', 'limited-series', 'style'),
('binge-worthy', 'binge-worthy', 'style'),
('prestige-tv', 'prestige-tv', 'style'),
('streaming-original', 'streaming-original', 'style'),

-- Provider Tags
('fast-tubi', 'fast-tubi', 'style'),
('fast-pluto', 'fast-pluto', 'style'),
('fast-plex', 'fast-plex', 'style'),
('fast-roku', 'fast-roku', 'style'),
('fast-freevee', 'fast-freevee', 'style')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- PART 2: MODERN BLACK CINEMA (2000s-2020s) - METADATA ONLY
-- =============================================================================

INSERT INTO media_nodes (
  canonical_id, media_type, category, title, description, 
  release_year, duration_seconds, poster_url, thumbnail_url,
  average_rating, popularity_score, content_rating
) VALUES

-- ═══════════════════════════════════════════════════════════════════════════
-- MODERN BLACK CINEMA - DRAMA & BIOGRAPHICAL
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:fast:hidden_figures', 'movie', 'video',
 'Hidden Figures',
 'The incredible true story of Katherine Johnson, Dorothy Vaughan, and Mary Jackson—brilliant African-American women working at NASA during the Space Race.',
 2016, 7620,
 'https://image.tmdb.org/t/p/w500/6cbIDZLfwUTmttXTmNi8Mp3Rnmg.jpg',
 'https://image.tmdb.org/t/p/w780/6cbIDZLfwUTmttXTmNi8Mp3Rnmg.jpg',
 8.4, 92, 'PG'),

('lucy:movie:fast:moonlight', 'movie', 'video',
 'Moonlight',
 'A young African-American man grapples with his identity and sexuality while experiencing the everyday struggles of childhood, adolescence, and adulthood.',
 2016, 6660,
 'https://image.tmdb.org/t/p/w500/4911T5FbJ9eD2Faz5Z8cT3SUhU3.jpg',
 'https://image.tmdb.org/t/p/w780/4911T5FbJ9eD2Faz5Z8cT3SUhU3.jpg',
 8.5, 90, 'R'),

('lucy:movie:fast:selma', 'movie', 'video',
 'Selma',
 'A chronicle of Dr. Martin Luther King Jr.s campaign to secure equal voting rights via an epic march from Selma to Montgomery, Alabama, in 1965.',
 2014, 7680,
 'https://image.tmdb.org/t/p/w500/z2En4bXr5hbF9Ak5hzAKqNJxTz0.jpg',
 'https://image.tmdb.org/t/p/w780/z2En4bXr5hbF9Ak5hzAKqNJxTz0.jpg',
 8.2, 88, 'PG-13'),

('lucy:movie:fast:12_years_a_slave', 'movie', 'video',
 '12 Years a Slave',
 'Based on the true story of Solomon Northup, a free Black man who was kidnapped and sold into slavery in the antebellum United States.',
 2013, 8160,
 'https://image.tmdb.org/t/p/w500/kb3X943WMIJYVg4SOAyK0lwDQ8C.jpg',
 'https://image.tmdb.org/t/p/w780/kb3X943WMIJYVg4SOAyK0lwDQ8C.jpg',
 8.6, 91, 'R'),

('lucy:movie:fast:fences', 'movie', 'video',
 'Fences',
 'A working-class African-American father tries to raise his family in the 1950s, while coming to terms with the events of his life. Denzel Washington directs and stars.',
 2016, 8400,
 'https://image.tmdb.org/t/p/w500/8WgArdLtLwH1pIPLXJJcZVpzmJk.jpg',
 'https://image.tmdb.org/t/p/w780/8WgArdLtLwH1pIPLXJJcZVpzmJk.jpg',
 8.1, 85, 'PG-13'),

('lucy:movie:fast:the_butler', 'movie', 'video',
 'The Butler',
 'A chronicle of the life of Cecil Gaines, who served eight presidents as the White House head butler.',
 2013, 7920,
 'https://image.tmdb.org/t/p/w500/kXUHyEbLDwYCeujJz4KrqZV1L8s.jpg',
 'https://image.tmdb.org/t/p/w780/kXUHyEbLDwYCeujJz4KrqZV1L8s.jpg',
 7.8, 84, 'PG-13'),

('lucy:movie:fast:fruitvale_station', 'movie', 'video',
 'Fruitvale Station',
 'The true story of Oscar Grant III, a 22-year-old Bay Area resident, who crosses paths with friends, enemies, family, and strangers on New Years Eve 2008.',
 2013, 5280,
 'https://image.tmdb.org/t/p/w500/qMIfT2Dj4zOcGDhbw8wJYHoPTu9.jpg',
 'https://image.tmdb.org/t/p/w780/qMIfT2Dj4zOcGDhbw8wJYHoPTu9.jpg',
 8.0, 82, 'R'),

('lucy:movie:fast:one_night_in_miami', 'movie', 'video',
 'One Night in Miami',
 'A fictional account of one incredible night where Muhammad Ali, Malcolm X, Sam Cooke, and Jim Brown gathered to discuss their roles in the civil rights movement.',
 2020, 6660,
 'https://image.tmdb.org/t/p/w500/l5b1viLTG1OjLMTdNUfJz6xhXnJ.jpg',
 'https://image.tmdb.org/t/p/w780/l5b1viLTG1OjLMTdNUfJz6xhXnJ.jpg',
 7.8, 80, 'R'),

('lucy:movie:fast:judas_and_black_messiah', 'movie', 'video',
 'Judas and the Black Messiah',
 'The story of Fred Hampton, Chairman of the Illinois Black Panther Party, and his fateful betrayal by FBI informant William ONeal.',
 2021, 7560,
 'https://image.tmdb.org/t/p/w500/iIgr75GoGwY5DUk41cHPVsVDQF2.jpg',
 'https://image.tmdb.org/t/p/w780/iIgr75GoGwY5DUk41cHPVsVDQF2.jpg',
 8.2, 85, 'R'),

('lucy:movie:fast:ma_raineys_black_bottom', 'movie', 'video',
 'Ma Raineys Black Bottom',
 'Tensions rise when trailblazing blues singer Ma Rainey and her band gather at a recording studio in Chicago in 1927. Chadwick Bosemans final film.',
 2020, 5640,
 'https://image.tmdb.org/t/p/w500/pvtyxijaBrCSbByBqDk6Yoq6Rp5.jpg',
 'https://image.tmdb.org/t/p/w780/pvtyxijaBrCSbByBqDk6Yoq6Rp5.jpg',
 7.9, 83, 'R'),

-- ═══════════════════════════════════════════════════════════════════════════
-- MODERN BLACK CINEMA - ACTION & SUPERHERO
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:fast:black_panther', 'movie', 'video',
 'Black Panther',
 'TChalla returns home to Wakanda to take his place as King. When a powerful enemy suddenly reappears, TChallas mettle as King and Black Panther is tested.',
 2018, 8040,
 'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
 'https://image.tmdb.org/t/p/w780/uxzzxijgPIY7slzFvMotPv8wjKA.jpg',
 8.5, 98, 'PG-13'),

('lucy:movie:fast:black_panther_wakanda_forever', 'movie', 'video',
 'Black Panther: Wakanda Forever',
 'The people of Wakanda fight to protect their nation from intervening world powers in the wake of King TChallas death.',
 2022, 9960,
 'https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg',
 'https://image.tmdb.org/t/p/w780/sv1xJUazXeYqALzczSZ3O6nkH75.jpg',
 7.8, 95, 'PG-13'),

('lucy:movie:fast:blade', 'movie', 'video',
 'Blade',
 'A half-vampire, half-mortal man becomes a protector of the mortal race, while slaying evil vampires. Wesley Snipes iconic action role.',
 1998, 7200,
 'https://image.tmdb.org/t/p/w500/4lZaT3YGsKqJwHJL93xybjD1nqj.jpg',
 'https://image.tmdb.org/t/p/w780/4lZaT3YGsKqJwHJL93xybjD1nqj.jpg',
 7.8, 85, 'R'),

('lucy:movie:fast:blade_2', 'movie', 'video',
 'Blade II',
 'Blade forms an uneasy alliance with the vampire council to combat the Reapers, who are feeding on vampires. Directed by Guillermo del Toro.',
 2002, 7080,
 'https://image.tmdb.org/t/p/w500/1slLp6aSm0Tqm5Vf6pKD3v6Mwc2.jpg',
 'https://image.tmdb.org/t/p/w780/1slLp6aSm0Tqm5Vf6pKD3v6Mwc2.jpg',
 7.5, 82, 'R'),

('lucy:movie:fast:hancock', 'movie', 'video',
 'Hancock',
 'A hard-living superhero who has fallen out of favor with the public enters into a questionable relationship with the wife of the PR agent whos trying to repair his image.',
 2008, 5520,
 'https://image.tmdb.org/t/p/w500/2JY6Ocp1Yz1Jfs0tQFdRJFSuDs.jpg',
 'https://image.tmdb.org/t/p/w780/2JY6Ocp1Yz1Jfs0tQFdRJFSuDs.jpg',
 7.2, 80, 'PG-13'),

-- ═══════════════════════════════════════════════════════════════════════════
-- MODERN CRIME & STREET CLASSICS
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:fast:training_day', 'movie', 'video',
 'Training Day',
 'A rookie cop spends his first day as an LAPD narcotics officer with a rogue detective who isnt what he appears to be. Denzel Washington won the Oscar.',
 2001, 7320,
 'https://image.tmdb.org/t/p/w500/lxFnSWlnEIPaT7BPqSPz37JY8S5.jpg',
 'https://image.tmdb.org/t/p/w780/lxFnSWlnEIPaT7BPqSPz37JY8S5.jpg',
 8.3, 92, 'R'),

('lucy:movie:fast:american_gangster', 'movie', 'video',
 'American Gangster',
 'An outcast New York City cop is charged with bringing down Harlem drug lord Frank Lucas, whose business acumen and family values have allowed him to build an empire.',
 2007, 9480,
 'https://image.tmdb.org/t/p/w500/6s5jvLU0bDuNRjl7dO4HZvAITui.jpg',
 'https://image.tmdb.org/t/p/w780/6s5jvLU0bDuNRjl7dO4HZvAITui.jpg',
 8.1, 88, 'R'),

('lucy:movie:fast:paid_in_full', 'movie', 'video',
 'Paid in Full',
 'Based on the true story of three friends who rise in the drug trade in 1980s Harlem. A gritty crime drama with iconic performances.',
 2002, 6060,
 'https://image.tmdb.org/t/p/w500/wKNQPGKoMR4dKNGAZHwE5rChqq4.jpg',
 'https://image.tmdb.org/t/p/w780/wKNQPGKoMR4dKNGAZHwE5rChqq4.jpg',
 7.8, 85, 'R'),

('lucy:movie:fast:hustle_and_flow', 'movie', 'video',
 'Hustle & Flow',
 'A Memphis pimp decides to try his hand at rap music and attempts to record a demo tape. Terrence Howard delivers a breakout performance.',
 2005, 6960,
 'https://image.tmdb.org/t/p/w500/6qAh3MUxCnV4lbFMlJqpyuqcYqh.jpg',
 'https://image.tmdb.org/t/p/w780/6qAh3MUxCnV4lbFMlJqpyuqcYqh.jpg',
 7.6, 82, 'R'),

('lucy:movie:fast:belly', 'movie', 'video',
 'Belly',
 'Two childhood friends make money together through crime, but begin to grow apart over their contrasting views of the criminal lifestyle. DMX and Nas star.',
 1998, 5760,
 'https://image.tmdb.org/t/p/w500/8VRCDWEepSjjUZJj0kCE5AhVqGQ.jpg',
 'https://image.tmdb.org/t/p/w780/8VRCDWEepSjjUZJj0kCE5AhVqGQ.jpg',
 6.8, 78, 'R'),

('lucy:movie:fast:juice', 'movie', 'video',
 'Juice',
 'Four inner-city teenagers get caught up in the pursuit of power and respect, but discover that the same pursuit is destroying their bond. Tupac stars.',
 1992, 5700,
 'https://image.tmdb.org/t/p/w500/yIMJMSJkBCKehPJbXlIqR2cGnPM.jpg',
 'https://image.tmdb.org/t/p/w780/yIMJMSJkBCKehPJbXlIqR2cGnPM.jpg',
 7.6, 82, 'R'),

('lucy:movie:fast:menace_ii_society', 'movie', 'video',
 'Menace II Society',
 'A young street hustler attempts to escape the rigors and temptations of the ghetto in a quest for a better life. Hughes Brothers directorial debut.',
 1993, 5820,
 'https://image.tmdb.org/t/p/w500/j5IxqqQPwUPLOdP4BAXBS2Ui8Sv.jpg',
 'https://image.tmdb.org/t/p/w780/j5IxqqQPwUPLOdP4BAXBS2Ui8Sv.jpg',
 7.8, 84, 'R'),

('lucy:movie:fast:set_it_off', 'movie', 'video',
 'Set It Off',
 'Desperate circumstances drive four women to plan and execute a daring bank robbery. Queen Latifah, Jada Pinkett Smith, Vivica A. Fox star.',
 1996, 7380,
 'https://image.tmdb.org/t/p/w500/8RtIvKcTdhm8Oj3WjIqS1OMZLkH.jpg',
 'https://image.tmdb.org/t/p/w780/8RtIvKcTdhm8Oj3WjIqS1OMZLkH.jpg',
 7.5, 80, 'R'),

('lucy:movie:fast:dead_presidents', 'movie', 'video',
 'Dead Presidents',
 'A Vietnam veteran returns to his hometown only to find it ravaged by drugs and decay. Desperate, he turns to crime to support his family.',
 1995, 7080,
 'https://image.tmdb.org/t/p/w500/lXmHwmXHFsrp5O6r2KIqPNDJJqO.jpg',
 'https://image.tmdb.org/t/p/w780/lXmHwmXHFsrp5O6r2KIqPNDJJqO.jpg',
 7.4, 78, 'R'),

('lucy:movie:fast:baby_boy', 'movie', 'video',
 'Baby Boy',
 'A 20-year-old South Central LA resident refuses to take on any personal responsibilities. John Singleton directs Tyrese Gibson.',
 2001, 7680,
 'https://image.tmdb.org/t/p/w500/1PoXYqPfm9wEEJhMRH7txCl5nDI.jpg',
 'https://image.tmdb.org/t/p/w780/1PoXYqPfm9wEEJhMRH7txCl5nDI.jpg',
 7.2, 76, 'R'),

('lucy:movie:fast:atl', 'movie', 'video',
 'ATL',
 'Four friends from Atlanta try to navigate the final weeks of high school while dealing with the pressures of life. T.I.s film debut.',
 2006, 6300,
 'https://image.tmdb.org/t/p/w500/lkKWJZjQg5L4ZqpFLXQnJGXBgql.jpg',
 'https://image.tmdb.org/t/p/w780/lkKWJZjQg5L4ZqpFLXQnJGXBgql.jpg',
 7.0, 74, 'PG-13'),

('lucy:movie:fast:snowfall_movie', 'movie', 'video',
 'Snow on tha Bluff',
 'A gripping documentary-style film following a stick-up kid in Atlanta as he robs drug dealers. Raw urban cinema.',
 2011, 4740,
 'https://image.tmdb.org/t/p/w500/8Rt3u3jqJC7j38Ygzv3MKqOgQH2.jpg',
 'https://image.tmdb.org/t/p/w780/8Rt3u3jqJC7j38Ygzv3MKqOgQH2.jpg',
 6.5, 70, 'NR'),

-- ═══════════════════════════════════════════════════════════════════════════
-- MODERN ACTION BLOCKBUSTERS
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:fast:john_wick', 'movie', 'video',
 'John Wick',
 'An ex-hitman comes out of retirement to track down the gangsters that killed his dog and stole his car. Keanu Reeves redefines action cinema.',
 2014, 6060,
 'https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg',
 'https://image.tmdb.org/t/p/w780/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg',
 8.3, 95, 'R'),

('lucy:movie:fast:john_wick_2', 'movie', 'video',
 'John Wick: Chapter 2',
 'After returning to the criminal underworld, John Wick discovers a bounty has been placed on his life.',
 2017, 7320,
 'https://image.tmdb.org/t/p/w500/hXWBc0ioZP3cN4zCu6SN3YHXZVO.jpg',
 'https://image.tmdb.org/t/p/w780/hXWBc0ioZP3cN4zCu6SN3YHXZVO.jpg',
 8.1, 93, 'R'),

('lucy:movie:fast:john_wick_3', 'movie', 'video',
 'John Wick: Chapter 3 - Parabellum',
 'John Wick is on the run with a $14 million bounty on his head after killing a member of the High Table.',
 2019, 7800,
 'https://image.tmdb.org/t/p/w500/ziEuG1essDuWuC5lpWUaw1uXY2O.jpg',
 'https://image.tmdb.org/t/p/w780/ziEuG1essDuWuC5lpWUaw1uXY2O.jpg',
 8.0, 92, 'R'),

('lucy:movie:fast:the_equalizer', 'movie', 'video',
 'The Equalizer',
 'A man believes he has put his mysterious past behind him, but when he meets a young girl under the control of ultra-violent Russian gangsters, he decides to help her.',
 2014, 7920,
 'https://image.tmdb.org/t/p/w500/9u4yW7yPA0BQ0oY1Rjxjpg3b6Xr.jpg',
 'https://image.tmdb.org/t/p/w780/9u4yW7yPA0BQ0oY1Rjxjpg3b6Xr.jpg',
 7.8, 85, 'R'),

('lucy:movie:fast:the_equalizer_2', 'movie', 'video',
 'The Equalizer 2',
 'Robert McCall returns to deliver vigilante justice for the exploited and oppressed, but how far will he go when his own family is threatened?',
 2018, 7260,
 'https://image.tmdb.org/t/p/w500/cQvc9N6JiMVKqurT5kjKnkQVFVS.jpg',
 'https://image.tmdb.org/t/p/w780/cQvc9N6JiMVKqurT5kjKnkQVFVS.jpg',
 7.4, 82, 'R'),

('lucy:movie:fast:man_on_fire', 'movie', 'video',
 'Man on Fire',
 'A former CIA operative is hired to protect the daughter of a wealthy Mexico City businessman. When she is kidnapped, he unleashes his wrath.',
 2004, 8760,
 'https://image.tmdb.org/t/p/w500/81cOW9mIlQJbCkYXKNVaI2rSvJ3.jpg',
 'https://image.tmdb.org/t/p/w780/81cOW9mIlQJbCkYXKNVaI2rSvJ3.jpg',
 8.0, 86, 'R'),

('lucy:movie:fast:the_book_of_eli', 'movie', 'video',
 'The Book of Eli',
 'A post-apocalyptic tale of a man who fights to protect a sacred book that holds the secrets to saving humankind. Denzel Washington stars.',
 2010, 7080,
 'https://image.tmdb.org/t/p/w500/1H1y9F1WwnLJAiF3MRJJpGVSG7p.jpg',
 'https://image.tmdb.org/t/p/w780/1H1y9F1WwnLJAiF3MRJJpGVSG7p.jpg',
 7.5, 80, 'R'),

('lucy:movie:fast:safe_house', 'movie', 'video',
 'Safe House',
 'A young CIA agent is tasked with guarding a dangerous fugitive. When the safe house is attacked, he must escort the prisoner to safety.',
 2012, 6960,
 'https://image.tmdb.org/t/p/w500/xiA3E0y99rWAHIILDa8eA5lY6LW.jpg',
 'https://image.tmdb.org/t/p/w780/xiA3E0y99rWAHIILDa8eA5lY6LW.jpg',
 7.3, 78, 'R'),

-- ═══════════════════════════════════════════════════════════════════════════
-- MODERN SCI-FI & FUTURISTIC
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:fast:the_matrix', 'movie', 'video',
 'The Matrix',
 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
 1999, 8160,
 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
 'https://image.tmdb.org/t/p/w780/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
 9.0, 98, 'R'),

('lucy:movie:fast:the_matrix_reloaded', 'movie', 'video',
 'The Matrix Reloaded',
 'Neo and his allies race against time before the machines discover Zion and destroy it and all its inhabitants.',
 2003, 8280,
 'https://image.tmdb.org/t/p/w500/aA5qHS0FbHpqMOJnccaWnuqdSb4.jpg',
 'https://image.tmdb.org/t/p/w780/aA5qHS0FbHpqMOJnccaWnuqdSb4.jpg',
 7.8, 90, 'R'),

('lucy:movie:fast:inception', 'movie', 'video',
 'Inception',
 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
 2010, 8880,
 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
 'https://image.tmdb.org/t/p/w780/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
 8.8, 96, 'PG-13'),

('lucy:movie:fast:interstellar', 'movie', 'video',
 'Interstellar',
 'A team of explorers travel through a wormhole in space in an attempt to ensure humanitys survival.',
 2014, 10140,
 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
 8.9, 95, 'PG-13'),

('lucy:movie:fast:i_am_legend', 'movie', 'video',
 'I Am Legend',
 'Years after a plague kills most of humanity, the sole survivor in New York City struggles to find a cure. Will Smith delivers an iconic performance.',
 2007, 6060,
 'https://image.tmdb.org/t/p/w500/dL8hG3WOPJsKWg0PQJG2cq2dE3X.jpg',
 'https://image.tmdb.org/t/p/w780/dL8hG3WOPJsKWg0PQJG2cq2dE3X.jpg',
 7.8, 88, 'PG-13'),

('lucy:movie:fast:edge_of_tomorrow', 'movie', 'video',
 'Edge of Tomorrow',
 'A soldier fighting aliens gets caught in a time loop, but becomes more skilled along the way as he re-lives the same day.',
 2014, 6780,
 'https://image.tmdb.org/t/p/w500/xjw5trHV7LzH4VLLaVq9IB7DvCZ.jpg',
 'https://image.tmdb.org/t/p/w780/xjw5trHV7LzH4VLLaVq9IB7DvCZ.jpg',
 8.0, 85, 'PG-13'),

('lucy:movie:fast:district_9', 'movie', 'video',
 'District 9',
 'Violence ensues after an idealistic alien is evicted from his slum to a designated alien township. Neill Blomkamp directorial debut.',
 2009, 6720,
 'https://image.tmdb.org/t/p/w500/qLvkV8nTQrTLVOlqIAEBpLbhDuH.jpg',
 'https://image.tmdb.org/t/p/w780/qLvkV8nTQrTLVOlqIAEBpLbhDuH.jpg',
 8.2, 86, 'R'),

('lucy:movie:fast:mad_max_fury_road', 'movie', 'video',
 'Mad Max: Fury Road',
 'In a post-apocalyptic wasteland, Max teams up with Furiosa to flee from a cult leader pursuing them. Relentless action masterpiece.',
 2015, 7200,
 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
 'https://image.tmdb.org/t/p/w780/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
 8.5, 94, 'R'),

-- ═══════════════════════════════════════════════════════════════════════════
-- MODERN ANIMATION
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:fast:spider_verse', 'movie', 'video',
 'Spider-Man: Into the Spider-Verse',
 'Teen Miles Morales becomes Spider-Man and must team up with Spider-People from other dimensions to stop a threat to all realities.',
 2018, 6960,
 'https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
 'https://image.tmdb.org/t/p/w780/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
 8.8, 96, 'PG'),

('lucy:movie:fast:spider_verse_2', 'movie', 'video',
 'Spider-Man: Across the Spider-Verse',
 'Miles embarks on an epic adventure across the multiverse, joining a team of Spider-People to face a powerful new threat.',
 2023, 8400,
 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
 'https://image.tmdb.org/t/p/w780/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
 8.9, 98, 'PG'),

('lucy:movie:fast:soul', 'movie', 'video',
 'Soul',
 'A musician who has lost his passion for music is transported out of his body and must find his way back with the help of an infant soul.',
 2020, 6060,
 'https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg',
 'https://image.tmdb.org/t/p/w780/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg',
 8.5, 90, 'PG'),

('lucy:movie:fast:the_mitchells_vs_machines', 'movie', 'video',
 'The Mitchells vs. the Machines',
 'A quirky, dysfunctional family road trip to drop Katie off at film school becomes humanities last hope when robots rise up.',
 2021, 6660,
 'https://image.tmdb.org/t/p/w500/mI2Di7HmskQQ34kz0iau6J1vr70.jpg',
 'https://image.tmdb.org/t/p/w780/mI2Di7HmskQQ34kz0iau6J1vr70.jpg',
 8.0, 85, 'PG'),

-- ═══════════════════════════════════════════════════════════════════════════
-- MODERN COMEDY
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:movie:fast:girls_trip', 'movie', 'video',
 'Girls Trip',
 'When four lifelong friends travel to New Orleans for the annual Essence Festival, sisterhoods are rekindled and wild sides are rediscovered.',
 2017, 7320,
 'https://image.tmdb.org/t/p/w500/a6qGzQhHgDwDM4ZIe2uLLlHrMRF.jpg',
 'https://image.tmdb.org/t/p/w780/a6qGzQhHgDwDM4ZIe2uLLlHrMRF.jpg',
 7.5, 85, 'R'),

('lucy:movie:fast:think_like_a_man', 'movie', 'video',
 'Think Like a Man',
 'Four friends conspire to turn the tables on their women when they discover theyre using Steve Harveys book against them.',
 2012, 7320,
 'https://image.tmdb.org/t/p/w500/wEdaAV9HRxBbTj4XAB1e5t2I5TS.jpg',
 'https://image.tmdb.org/t/p/w780/wEdaAV9HRxBbTj4XAB1e5t2I5TS.jpg',
 6.8, 78, 'PG-13'),

('lucy:movie:fast:barbershop', 'movie', 'video',
 'Barbershop',
 'A day in the life of a South Side Chicago barbershop. Ice Cube leads a hilarious ensemble cast.',
 2002, 6420,
 'https://image.tmdb.org/t/p/w500/kOYUZeHMNJ5mGQiIfwQw6fKjQXU.jpg',
 'https://image.tmdb.org/t/p/w780/kOYUZeHMNJ5mGQiIfwQw6fKjQXU.jpg',
 6.9, 76, 'PG-13'),

('lucy:movie:fast:friday', 'movie', 'video',
 'Friday',
 'Two homies, Craig and Smokey, must come up with $200 they owe a local bully or suffer the consequences. Ice Cube and Chris Tucker comedy classic.',
 1995, 5520,
 'https://image.tmdb.org/t/p/w500/xhSbPbvsmSfdQV5PVQ2W6H2tMo0.jpg',
 'https://image.tmdb.org/t/p/w780/xhSbPbvsmSfdQV5PVQ2W6H2tMo0.jpg',
 7.5, 85, 'R'),

('lucy:movie:fast:ride_along', 'movie', 'video',
 'Ride Along',
 'A security guard tries to prove himself to his girlfriends police officer brother by joining him on a 24-hour patrol of Atlanta.',
 2014, 5940,
 'https://image.tmdb.org/t/p/w500/vIsoUVTgXUU51MvDMxr70SoWqb9.jpg',
 'https://image.tmdb.org/t/p/w780/vIsoUVTgXUU51MvDMxr70SoWqb9.jpg',
 6.5, 75, 'PG-13'),

('lucy:movie:fast:get_out', 'movie', 'video',
 'Get Out',
 'A young African-American visits his white girlfriends parents for the weekend, where his simmering uneasiness about their reception explodes into mind-bending events.',
 2017, 6240,
 'https://image.tmdb.org/t/p/w500/qbaS6eGV6CpJmFr1d0s8u7ZrNp.jpg',
 'https://image.tmdb.org/t/p/w780/qbaS6eGV6CpJmFr1d0s8u7ZrNp.jpg',
 8.5, 95, 'R'),

('lucy:movie:fast:us', 'movie', 'video',
 'Us',
 'A family vacation turns to chaos when their doppelgangers appear and begin to terrorize them. Jordan Peele follow-up to Get Out.',
 2019, 6960,
 'https://image.tmdb.org/t/p/w500/ux2dU1jQ2ACIMShzB3yP93Udpzc.jpg',
 'https://image.tmdb.org/t/p/w780/ux2dU1jQ2ACIMShzB3yP93Udpzc.jpg',
 7.8, 88, 'R'),

-- ═══════════════════════════════════════════════════════════════════════════
-- MODERN TV SERIES (BINGE-WORTHY)
-- ═══════════════════════════════════════════════════════════════════════════

('lucy:series:fast:power', 'series', 'video',
 'Power',
 'James Ghost St. Patrick juggles two lives: nightclub owner and drug kingpin. Omari Hardwick stars in this Starz crime drama.',
 2014, NULL,
 'https://image.tmdb.org/t/p/w500/rGvKdMWsKfRiISxlBqgkCbLZB2x.jpg',
 'https://image.tmdb.org/t/p/w780/rGvKdMWsKfRiISxlBqgkCbLZB2x.jpg',
 8.2, 92, 'TV-MA'),

('lucy:series:fast:snowfall', 'series', 'video',
 'Snowfall',
 'A crime drama set in Los Angeles in 1983 centered around the first crack cocaine epidemic and its devastating effects on the culture.',
 2017, NULL,
 'https://image.tmdb.org/t/p/w500/bqRBNBOyJgH7C08dLzDFVK3J7JO.jpg',
 'https://image.tmdb.org/t/p/w780/bqRBNBOyJgH7C08dLzDFVK3J7JO.jpg',
 8.5, 90, 'TV-MA'),

('lucy:series:fast:the_wire', 'series', 'video',
 'The Wire',
 'The Baltimore drug scene, as seen through the eyes of drug dealers and law enforcement. Often cited as the greatest TV series ever made.',
 2002, NULL,
 'https://image.tmdb.org/t/p/w500/4lbclFySvugI51fwsyxBTOm4DqK.jpg',
 'https://image.tmdb.org/t/p/w780/4lbclFySvugI51fwsyxBTOm4DqK.jpg',
 9.3, 98, 'TV-MA'),

('lucy:series:fast:atlanta', 'series', 'video',
 'Atlanta',
 'Two cousins navigate the Atlanta rap scene in order to improve their lives. Donald Glover created and stars.',
 2016, NULL,
 'https://image.tmdb.org/t/p/w500/27RioVpFE8xPPvKnSvEj8JMJksn.jpg',
 'https://image.tmdb.org/t/p/w780/27RioVpFE8xPPvKnSvEj8JMJksn.jpg',
 8.8, 92, 'TV-MA'),

('lucy:series:fast:insecure', 'series', 'video',
 'Insecure',
 'Follow Issa and Molly as they navigate love and life in Los Angeles. Issa Rae created and stars.',
 2016, NULL,
 'https://image.tmdb.org/t/p/w500/8FYPaGNKSKBjxsqvqJhcFBMHEm9.jpg',
 'https://image.tmdb.org/t/p/w780/8FYPaGNKSKBjxsqvqJhcFBMHEm9.jpg',
 8.0, 85, 'TV-MA'),

('lucy:series:fast:queens', 'series', 'video',
 'Queens',
 'Four women reunite for a chance to recapture their fame as the Nasty Bitches—their legendary 90s hip hop group.',
 2021, NULL,
 'https://image.tmdb.org/t/p/w500/mLO3oJEt58sGEuxKkVhPUdqNQf8.jpg',
 'https://image.tmdb.org/t/p/w780/mLO3oJEt58sGEuxKkVhPUdqNQf8.jpg',
 7.2, 75, 'TV-14'),

('lucy:series:fast:bmf', 'series', 'video',
 'BMF (Black Mafia Family)',
 'Two brothers rise from the streets of Southwest Detroit in the late 80s and give birth to one of the most influential crime families in the country.',
 2021, NULL,
 'https://image.tmdb.org/t/p/w500/q2rSAB6SMYbQKxvgVJLYdNp4qYU.jpg',
 'https://image.tmdb.org/t/p/w780/q2rSAB6SMYbQKxvgVJLYdNp4qYU.jpg',
 8.0, 85, 'TV-MA'),

('lucy:series:fast:empire', 'series', 'video',
 'Empire',
 'A hip hop mogul must choose a successor among his three sons who are battling for control of his empire. Terrence Howard stars.',
 2015, NULL,
 'https://image.tmdb.org/t/p/w500/kaPNTTlHRLNFfZMGDgT6HyKSPFr.jpg',
 'https://image.tmdb.org/t/p/w780/kaPNTTlHRLNFfZMGDgT6HyKSPFr.jpg',
 7.8, 82, 'TV-14'),

('lucy:series:fast:wu_tang_saga', 'series', 'video',
 'Wu-Tang: An American Saga',
 'The Wu-Tang Clans formation in early-90s New York. Street life meets hip hop history.',
 2019, NULL,
 'https://image.tmdb.org/t/p/w500/sHMXf5mLvDqHwYzfqnSUZhxk8Y4.jpg',
 'https://image.tmdb.org/t/p/w780/sHMXf5mLvDqHwYzfqnSUZhxk8Y4.jpg',
 8.2, 85, 'TV-MA'),

('lucy:series:fast:breaking_bad', 'series', 'video',
 'Breaking Bad',
 'A high school chemistry teacher diagnosed with terminal lung cancer turns to manufacturing methamphetamine to secure his familys future.',
 2008, NULL,
 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
 'https://image.tmdb.org/t/p/w780/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
 9.5, 99, 'TV-MA')

ON CONFLICT (canonical_id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  release_year = EXCLUDED.release_year,
  duration_seconds = EXCLUDED.duration_seconds,
  poster_url = EXCLUDED.poster_url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  average_rating = EXCLUDED.average_rating,
  popularity_score = EXCLUDED.popularity_score,
  content_rating = EXCLUDED.content_rating,
  updated_at = NOW();

-- =============================================================================
-- PART 3: TAG ASSIGNMENTS FOR MODERN CONTENT
-- =============================================================================

-- Modern Black Cinema Tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:fast:hidden_figures',
  'lucy:movie:fast:moonlight',
  'lucy:movie:fast:selma',
  'lucy:movie:fast:12_years_a_slave',
  'lucy:movie:fast:fences',
  'lucy:movie:fast:the_butler',
  'lucy:movie:fast:fruitvale_station',
  'lucy:movie:fast:one_night_in_miami',
  'lucy:movie:fast:judas_and_black_messiah',
  'lucy:movie:fast:ma_raineys_black_bottom',
  'lucy:movie:fast:black_panther',
  'lucy:movie:fast:black_panther_wakanda_forever',
  'lucy:movie:fast:get_out',
  'lucy:movie:fast:us'
) AND t.name IN ('modern-black-cinema', 'modern', 'drama', 'black-excellence')
ON CONFLICT DO NOTHING;

-- Action & Superhero Tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:fast:black_panther',
  'lucy:movie:fast:black_panther_wakanda_forever',
  'lucy:movie:fast:blade',
  'lucy:movie:fast:blade_2',
  'lucy:movie:fast:hancock',
  'lucy:movie:fast:john_wick',
  'lucy:movie:fast:john_wick_2',
  'lucy:movie:fast:john_wick_3',
  'lucy:movie:fast:the_equalizer',
  'lucy:movie:fast:the_equalizer_2',
  'lucy:movie:fast:man_on_fire',
  'lucy:movie:fast:the_book_of_eli',
  'lucy:movie:fast:safe_house'
) AND t.name IN ('action', 'superhero', 'modern', '2010s', '2000s')
ON CONFLICT DO NOTHING;

-- Crime & Street Classics Tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:fast:training_day',
  'lucy:movie:fast:american_gangster',
  'lucy:movie:fast:paid_in_full',
  'lucy:movie:fast:hustle_and_flow',
  'lucy:movie:fast:belly',
  'lucy:movie:fast:juice',
  'lucy:movie:fast:menace_ii_society',
  'lucy:movie:fast:set_it_off',
  'lucy:movie:fast:dead_presidents',
  'lucy:movie:fast:baby_boy',
  'lucy:movie:fast:atl',
  'lucy:movie:fast:snowfall_movie'
) AND t.name IN ('crime', 'street', 'hood-classic', 'urban', 'modern')
ON CONFLICT DO NOTHING;

-- Sci-Fi & Futuristic Tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:fast:the_matrix',
  'lucy:movie:fast:the_matrix_reloaded',
  'lucy:movie:fast:inception',
  'lucy:movie:fast:interstellar',
  'lucy:movie:fast:i_am_legend',
  'lucy:movie:fast:edge_of_tomorrow',
  'lucy:movie:fast:district_9',
  'lucy:movie:fast:mad_max_fury_road'
) AND t.name IN ('sci-fi', 'modern', 'action', '2010s', '2000s')
ON CONFLICT DO NOTHING;

-- Animation Tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:fast:spider_verse',
  'lucy:movie:fast:spider_verse_2',
  'lucy:movie:fast:soul',
  'lucy:movie:fast:the_mitchells_vs_machines'
) AND t.name IN ('animation', 'modern', '2020s', '2010s', 'family')
ON CONFLICT DO NOTHING;

-- Comedy Tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:fast:girls_trip',
  'lucy:movie:fast:think_like_a_man',
  'lucy:movie:fast:barbershop',
  'lucy:movie:fast:friday',
  'lucy:movie:fast:ride_along'
) AND t.name IN ('comedy', 'modern', 'modern-black-cinema', 'urban')
ON CONFLICT DO NOTHING;

-- TV Series Tags
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:series:fast:power',
  'lucy:series:fast:snowfall',
  'lucy:series:fast:the_wire',
  'lucy:series:fast:atlanta',
  'lucy:series:fast:insecure',
  'lucy:series:fast:queens',
  'lucy:series:fast:bmf',
  'lucy:series:fast:empire',
  'lucy:series:fast:wu_tang_saga',
  'lucy:series:fast:breaking_bad'
) AND t.name IN ('binge-worthy', 'prestige-tv', 'modern', 'crime', 'drama')
ON CONFLICT DO NOTHING;

-- Trending Tag for top content
INSERT INTO media_node_tags (media_node_id, tag_id)
SELECT m.id, t.id FROM media_nodes m, media_tags t
WHERE m.canonical_id IN (
  'lucy:movie:fast:black_panther',
  'lucy:movie:fast:spider_verse_2',
  'lucy:movie:fast:get_out',
  'lucy:movie:fast:john_wick_3',
  'lucy:movie:fast:inception',
  'lucy:series:fast:snowfall',
  'lucy:series:fast:power',
  'lucy:series:fast:the_wire'
) AND t.name = 'trending'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VERIFICATION QUERIES (COMMENTED OUT FOR MIGRATION)
-- =============================================================================

-- SELECT 'Modern catalog count' as metric, COUNT(*) as value FROM media_nodes WHERE canonical_id LIKE 'lucy:%:fast:%';
-- SELECT 'Modern Black Cinema' as metric, COUNT(DISTINCT mnt.media_node_id) as value 
-- FROM media_node_tags mnt JOIN media_tags t ON mnt.tag_id = t.id WHERE t.name = 'modern-black-cinema';
-- SELECT 'TV Series' as metric, COUNT(*) as value FROM media_nodes WHERE media_type = 'series' AND canonical_id LIKE 'lucy:series:fast:%';
