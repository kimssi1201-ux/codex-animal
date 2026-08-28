// English editorial overlay for the curated Jeju Travel News articles.
//
// This file does NOT duplicate the Korean article dataset. Each entry below
// is a natural English rewrite of the matching entry in
// jeju-travel-news/assets/editorial.js / editorial-expansion.js, written to
// keep the same practical, on-the-ground advice (parking, timing, weather,
// safety) rather than a literal translation. `curateArticlesEn()` merges
// this overlay onto the shared Korean base article (slug, image, date,
// map coordinates) from jeju-travel-news/assets/articles.js, exactly the
// way `curateArticles()` does on the Korean site.

export const siteOriginEn = "https://www.moneyarchive.kr/en";

export const editorialProfileEn = {
  author: "Jeju Travel News Editorial Team",
  publisher: "Jeju Travel News",
  reviewedAt: "2026-08-10",
  reviewMethod:
    "Adapted from the Korean edition, which was cross-checked against public data from the Korea Tourism Organization and Jeju Tourism Organization, mapped routes, and on-the-ground weather and site variability."
};

const ktoSourceEn = {
  name: "Korea Tourism Organization",
  url: "https://korean.visitkorea.or.kr/"
};

const visitJejuSourceEn = {
  name: "Jeju Tourism Organization (Visit Jeju)",
  url: "https://www.visitjeju.net/kr"
};

const weatherSourceEn = {
  name: "Korea Meteorological Administration",
  url: "https://www.weather.go.kr/w/index.do"
};

const hallasanSourceEn = {
  name: "Hallasan National Park",
  url: "https://www.jeju.go.kr/hallasan/index.htm"
};

const commonSourcesEn = [ktoSourceEn, visitJejuSourceEn];
const outdoorSourcesEn = [ktoSourceEn, visitJejuSourceEn, weatherSourceEn];

// Slugs that currently have a real English translation. Every build script
// (Korean and English) and every hreflang tag keys off this list, so a
// slug only ever shows up cross-linked once it actually has content here.
export const translatedSlugs = [
  "seongsan-sunrise-course",
  "hyeopjae-half-day",
  "hamdeok-cafe-street",
  "udo-day-trip",
  "hallasan-beginner-trail",
  "jeju-stay-location-guide",
  "family-friendly-jeju",
  "rainy-day-indoor-jeju",
  "aewol-coastal-drive",
  "seogwipo-olle-market-food",
  "sangumburi-autumn-course",
  "east-jeju-2days",
  "seopjikoji-coastal-walk-guide",
  "bijarim-forest-walk-guide"
  // Remaining slugs (yongmeori-coast-visit-check, jeongbang-waterfall-guide,
  // woljeongri-beach-cafe-walk, osulloc-west-jeju-course,
  // dongmun-market-evening-food-route,
  // samyang-beach-black-sand-walk-20260725, saryeoni-forest-road-check,
  // cheonjiyeon-night-walk-course, gimnyeong-beach-light-guide,
  // jeju-stone-park-rainy-day-course, soesokkak-hahyo-walk-guide,
  // geum-oreum-sunset-walk-guide, saebyeol-oreum-silvergrass-guide,
  // camellia-hill-season-guide, aqua-planet-jeju-family-guide,
  // lee-jung-seop-street-walk-guide, suwolbong-geotrail-guide,
  // songaksan-dulle-gil-guide) are tracked in
  // docs/en-site-continuation.md for a follow-up batch.
];

export const editorialOverridesEn = {
  "seongsan-sunrise-course": {
    title: "Seongsan Sunrise Peak Itinerary",
    category: "Places to Visit",
    region: "Eastern Jeju · Seongsan",
    address: "Seongsan-ri, Seongsan-eup, Seogwipo-si, Jeju",
    parking:
      "Use the Seongsan Ilchulbong public parking lot. It can fill up fast in the run-up to sunrise.",
    fee: "Some trail sections require a ticket; free and paid sections are marked on-site.",
    operatingHours:
      "Sunrise viewing is open from early morning, but ticketed hours and trail access change seasonally — check the latest notice before you go.",
    course: [
      "Seongsan Ilchulbong Peak",
      "Gwangchigi Beach",
      "Breakfast near Seongsan Port",
      "Seopjikoji walk"
    ],
    nearbySpots: ["Gwangchigi Beach", "Seopjikoji", "Seongsan Port", "Udo ferry terminal"],
    summary:
      "A relaxed eastern half-day loop built around sunrise at Seongsan Ilchulbong, then breakfast near Seongsan Port and a walk along Gwangchigi Beach.",
    editorialSections: [
      {
        title: "Work backward from sunrise, not forward",
        paragraphs: [
          "Knowing what time the sun comes up isn't enough on its own. Count backward from that time: how long to drive from your hotel to the parking lot, how long to walk from the lot to the entrance, and how long the ticket line and trail itself take. Only then do you know when you actually need to leave — with enough slack to find a good viewing spot and just wait.",
          "Pre-dawn wind is stronger than daytime wind, and parts of the trail are still dark. Bring a light jacket and something with a flashlight function. If rain or strong wind is forecast, it's safer to have a backup plan ready — watching the silhouette of Ilchulbong from somewhere easy to reach, like Gwangchigi Beach, instead of pushing for the summit."
        ]
      },
      {
        title: "Building the half-day route",
        paragraphs: [
          "The simplest order is Seongsan Ilchulbong, breakfast near Seongsan Port, then Gwangchigi Beach. If you're adding Udo Island the same day, keep your time at Ilchulbong short and confirm the ferry schedule and ID requirements first.",
          "If photos are the priority, don't rush off right after sunrise — the light keeps changing for another 20–30 minutes and it's worth staying for. Traveling with family, don't try to do the full summit hike and a long beach walk in the same morning; pick one as the main event and leave generous time for a café or a proper meal."
        ]
      },
      {
        title: "Parking and checking conditions on the day",
        paragraphs: [
          "The public parking lot at Seongsan Ilchulbong fills quickly around sunrise. Rather than waiting for a spot right at the entrance, park where you're directed and build the extra walk into your schedule — it costs less time than circling for a closer spot.",
          "Which sections of the trail are open, and ticket-office hours, shift with the season and site conditions. Check the official tourism notices and the weather forecast before you set out, and defer to on-site closure announcements if it's windy or raining."
        ]
      },
      {
        title: "Who this route suits",
        paragraphs: [
          "This works well if you're staying somewhere in eastern Jeju and can start early, or if it's your first visit and you want one of Jeju's signature views in a single outing. If sleeping in matters, or you're coming from a hotel in the west, the drive alone will eat into the morning — better to schedule this for a different day."
        ]
      }
    ],
    sources: outdoorSourcesEn
  },

  "hyeopjae-half-day": {
    title: "Hyeopjae Beach Half-Day Route",
    category: "Beaches",
    region: "Western Jeju · Hallim",
    address: "Hyeopjae-ri, Hallim-eup, Jeju-si, Jeju",
    parking:
      "Use the public lots around the beach. In peak season, it's often faster to park toward Geumneung and walk than to wait for a spot right at Hyeopjae.",
    fee: "The beach itself is free. Showers and other facilities may charge a small fee on-site.",
    operatingHours:
      "The beach is open for walking year-round. Swimming season and lifeguard hours are seasonal — check before you go.",
    course: [
      "Hyeopjae Beach",
      "Geumneung Beach",
      "Around Hallim Park",
      "Cafe with a Biyangdo view"
    ],
    nearbySpots: ["Geumneung Beach", "Hallim Park", "Cafe with a Biyangdo view", "Hallim Port"],
    summary:
      "A western half-day built around Hyeopjae Beach's turquoise water — a walk, a meal, and a café — planned around the tide, light and parking rather than a fixed schedule.",
    editorialSections: [
      {
        title: "At Hyeopjae, timing matters more than you'd think",
        paragraphs: [
          "The width of the sand and the color of the water at Hyeopjae change a lot depending on the tide and the direction of the light. If you're here to swim, check whether the beach is officially open for the season and whether lifeguards are on duty; if you're here to walk and take photos, avoid the harsh midday sun and aim for morning or late afternoon instead.",
          "Even on a clear day when you can see Biyangdo Island sharply, a strong wind can drop the felt temperature fast. Don't plan on spending the whole visit on the sand — have a nearby indoor restaurant or café as a backup so a sudden weather shift doesn't derail the day."
        ]
      },
      {
        title: "A simple half-day order",
        paragraphs: [
          "The easiest sequence is a walk at Hyeopjae, lunch in the Hallim area, then a café or Hallim Park. If you want to walk all the way to Geumneung Beach, bring water and a hat — it's further than it looks in the heat.",
          "Traveling with kids, decide how long you'll spend on the sand before you arrive, and know where the rinse-off area and restrooms are. In peak season even lunch can involve a wait, so it's better to stay loose within the Hallim area than to try to squeeze in more stops."
        ]
      },
      {
        title: "Parking and water safety",
        paragraphs: [
          "The public lots get crowded on weekends and in peak season. Rather than circling for a spot right at the beach entrance, use the marked parking areas nearby and check whether your walking route crosses any roads.",
          "Which zones are safe for swimming, wave height, and rip current warnings are governed by on-site announcements and lifeguard instructions — treat those as final. Equipment rental and shower facilities may or may not be running depending on the season, so it's worth confirming on the day."
        ]
      },
      {
        title: "Good add-ons nearby",
        paragraphs: [
          "If you're spending the day in the west, add just one more stop — Geumneung Beach, Hallim Park, or Jeoji Oreum. Trying to fit in Aewol or Sanbangsan the same day stretches the drive time and shortens how long you actually spend at Hyeopjae."
        ]
      }
    ],
    sources: outdoorSourcesEn
  },

  "hamdeok-cafe-street": {
    title: "Hamdeok Beach Café Walk",
    category: "Cafes",
    region: "Northeastern Jeju · Jocheon",
    address: "Hamdeok-ri, Jocheon-eup, Jeju-si, Jeju",
    parking:
      "Use the public lot at the beach or the nearby overflow lots. Weekend afternoons get crowded.",
    fee: "Free to walk the beach. Cafés and other facilities charge separately.",
    operatingHours: "The beach is open for walking at any time. Café hours vary by shop.",
    course: ["Hamdeok Beach", "Seou-bong trail", "Beachfront café", "Jocheon harbor"],
    nearbySpots: ["Seou-bong", "Jocheon Port", "Samyang Beach", "Bukchon Dolharubang Park"],
    summary:
      "A northeastern half-day pairing a walk at Hamdeok Beach with one good café, planned so you park once instead of chasing parking spots back and forth.",
    editorialSections: [
      {
        title: "Settle the beach walk before you pick a café",
        paragraphs: [
          "The beach and the cafés at Hamdeok are close together, but on a weekend, driving that short distance can take longer than walking it. Park once, then do the Seou-bong trail, the beach, and a meal on foot, and save picking a café for last.",
          "If you choose a café purely for ocean-view seating, expect a wait. Decide first whether the point of the stop is walking or resting — that tells you whether you actually need a view table or whether indoor seating on a windy day works just as well."
        ]
      },
      {
        title: "How to spend your time",
        paragraphs: [
          "On a clear day, a morning beach walk followed by an early lunch and café works well. If it's raining or windy, cut the Seou-bong walk short and pair an indoor spot in Jocheon with your café stop instead.",
          "Rather than café-hopping, rest properly at one place and move on to Bukchon or Gimnyeong — it keeps the day simpler. With kids, build in time to clean up after sand play before you get back in the car."
        ]
      },
      {
        title: "Avoiding the parking crunch",
        paragraphs: [
          "The area around Hamdeok Beach gets busy around lunchtime and again near sunset. Don't just look for parking right at your destination — check where the public lots are and whether it's walkable from your hotel.",
          "Parking along the road shoulder blocks sightlines for pedestrians and often ends up costing you more time, not less. If you use a café's private lot, check the terms and how long you're allowed to stay."
        ]
      },
      {
        title: "Combining it with nearby routes",
        paragraphs: [
          "Head east and you're in Gimnyeong and Woljeongri; head west and you're in Jocheon and central Jeju-si. If Seongsan is also on the day's plan, keep the café stop at Hamdeok short and build the day around either the beach or the meal, not both."
        ]
      }
    ],
    sources: outdoorSourcesEn
  },

  "udo-day-trip": {
    title: "Udo Island Day Trip",
    category: "Places to Visit",
    region: "Eastern Jeju · Udo Island",
    address: "Udo-myeon, Jeju-si, Jeju (Udo Island)",
    parking:
      "Park near Seongsan Port and take the ferry rather than driving further — check current rules on-site if you're considering bringing a vehicle across.",
    fee: "Ferry fare is separate from any admission or activity fees on the island — confirm current prices on-site.",
    operatingHours:
      "Ferry schedules shift with the weather and season. Confirm sailings are actually running before you head to the port.",
    course: [
      "Seongsan Port",
      "Udo ferry",
      "Seobinbaeksa Beach",
      "Geommeolle Beach",
      "Udo-bong Peak"
    ],
    nearbySpots: ["Seobinbaeksa Beach", "Geommeolle Beach", "Udo-bong Peak", "Seongsan Ilchulbong"],
    summary:
      "The full sequence for an Udo day trip — getting to Seongsan Port, choosing how to get around the island, hitting the key stops, and not missing the last ferry back.",
    editorialSections: [
      {
        title: "Before you even think about ferry times",
        paragraphs: [
          "An Udo day trip needs to account for arriving at Seongsan Port, parking, checking in, and buying your ticket — not just the departure time. Show up right at sailing time and, on a weekend or in peak season, you can genuinely miss the boat. Build in slack.",
          "Sailings can be delayed or cancelled in bad weather. Even if you get in fine in the morning, save a photo of the last return sailing time, and get in the habit of checking how much time you have left every time you move to a new spot on the island."
        ]
      },
      {
        title: "Choosing how to get around the island",
        paragraphs: [
          "The tour loop bus takes the effort out of driving, but factor in waiting at stops and crowding. E-bikes and rental scooters are heavily weather-dependent, and you'll need to check eligibility and insurance terms on-site.",
          "On a first visit, pick two or three stops with genuinely different characters — Geommeolle Beach, Seobinbaeksa, Hagosudong — rather than trying to hit every beach. Rushing through all of them tends to leave you racing the clock for both lunch and the ferry."
        ]
      },
      {
        title: "Budgeting your day",
        paragraphs: [
          "A steady rhythm is: morning ferry in, one stop before lunch, two stops after. If you're pairing this with Seongsan Ilchulbong the same day, decide what time you need to leave Udo first, then fit the rest of the day around that.",
          "In summer, build in indoor breaks to get out of direct sun; in winter, plan around places that offer shelter from the wind. Distances on the island look short, but boarding, disembarking and waiting add up faster than you'd expect."
        ]
      },
      {
        title: "Before you go",
        paragraphs: [
          "Check the ferry operator's current requirements for ID, whether vehicles can be brought across, and pet policies. Restaurant and rental-shop hours also shift by season, so it's worth having a backup rather than planning your whole day around one specific place."
        ]
      }
    ],
    sources: outdoorSourcesEn
  },

  "hallasan-beginner-trail": {
    title: "Hallasan for First-Time Hikers",
    category: "Oreum Trails",
    region: "Hallasan National Park area",
    address: "Hallasan National Park, Jeju",
    parking:
      "Use the parking lot at your chosen trailhead. Arrive early during peak season and snow season.",
    fee: "Most of the trail itself is free, but check official notices for parking, advance reservations, or closures.",
    operatingHours:
      "Entry times differ by trail. Check closures and cut-off times before you set out.",
    course: [
      "Eorimok or Yeongsil trailhead",
      "Trail information center",
      "Short out-and-back stretch",
      "Meal nearby"
    ],
    nearbySpots: ["Hallasan National Park", "Eorimok Trail", "Yeongsil Trail", "1100 Altitude rest area"],
    summary:
      "How a first-time hiker should actually choose a Hallasan trail — based on fitness, transport, reservations, and how much time you'll need coming back down, not the summit alone.",
    editorialSections: [
      {
        title: "Pick the trail before you think about the summit",
        paragraphs: [
          "Not every route on Hallasan has the same difficulty or takes the same time. If you don't have much summit-hiking experience, choose your trail based on your normal walking stamina, your knees, and the pace of whoever you're hiking with — not the elevation you're aiming for.",
          "Longer routes like Seongpanak and Gwaneumsa require checking entry-control times and reservation policies. If you just want a short walk, look at the accessible sections of Eorimok or Yeongsil instead — but check weather-related closures and parking there too."
        ]
      },
      {
        title: "Plan your turnaround time, not just your start time",
        paragraphs: [
          "Don't just pick a departure time — decide, before you leave, exactly what time you'll turn back regardless of how far you've gotten. First-timers often feel their knees and focus fade more on the way down than on the way up, so give yourself more time for the descent than feels necessary.",
          "Factor photo stops, rest breaks and restroom queues into your time estimate. If your group moves at different speeds, pace to the slowest hiker, and don't stretch the gaps between people just to reach the top faster."
        ]
      },
      {
        title: "Gear and weather",
        paragraphs: [
          "Clear skies in Jeju-si don't guarantee the same conditions higher up — wind, fog and temperature can all be different on the mountain. Bring non-slip shoes, a wind- and water-resistant jacket, water, a quick snack, and a portable battery.",
          "In winter, check equipment requirements and road closures in advance. If you're under-equipped, or there's a strong-wind or heavy-rain advisory, don't fall back on an oreum or forest trail instead — consider switching to an indoor plan altogether."
        ]
      },
      {
        title: "Getting there and parking",
        paragraphs: [
          "Parking and public transit access differ by trailhead. Even with a rental car, plan for the lot to be full, and if your descent point is different from where you started, check bus or taxi options ahead of time."
        ]
      }
    ],
    sources: [hallasanSourceEn, weatherSourceEn, visitJejuSourceEn]
  },

  "jeju-stay-location-guide": {
    title: "How to Choose Where to Stay in Jeju",
    category: "Stays",
    region: "Across Jeju",
    address: "Jeju-si, Seogwipo-si, Seongsan, Aewol and Hallim areas",
    parking:
      "If you're renting a car, confirm your stay has parking and check the cut-off time for late check-in.",
    fee: "Room rates shift with the season. This article doesn't link to any booking offers.",
    operatingHours: "Confirm check-in/check-out times and front-desk hours before you arrive.",
    course: [
      "Jeju-si on arrival day",
      "Eastern nature route",
      "Downtown Seogwipo",
      "Western coast route"
    ],
    nearbySpots: [
      "Jeju-si lodging area",
      "Seogwipo lodging area",
      "Seongsan lodging area",
      "Aewol/Hallim lodging area"
    ],
    summary:
      "A practical comparison of where to base yourself in Jeju — Jeju-si, Seogwipo, the east, and the west — built around your actual itinerary and evening convenience, not airport distance.",
    editorialSections: [
      {
        title: "Base yourself where you'll actually spend the most time",
        paragraphs: [
          "If you compare hotels on price alone, you can end up driving long distances every single day. Instead, sort your itinerary by region — east, west, Seogwipo, Jeju-si — and prioritize wherever you're spending the most days.",
          "For a short trip, like 2 nights 3 days, it's usually more efficient to stay in one place the whole time. For 4+ nights with a lot of east-west movement, consider splitting into two bases with one change partway through."
        ]
      },
      {
        title: "Trade-offs by area",
        paragraphs: [
          "Jeju-si is convenient for the airport and restaurants but adds travel time to the island's headline natural sights. Aewol is good for the west and café-hopping but can hit traffic on its popular stretch; Seongsan is well-placed for sunrise and Udo but sits further from the airport.",
          "Seogwipo pairs well with the southern waterfalls and Jungmun, with plenty of dinner options nearby. Whichever you pick, if you're visiting both the east and west coasts, you're going to have at least one long drive — don't expect a single base to cover the whole island equally well."
        ]
      },
      {
        title: "What to actually check on a booking page",
        paragraphs: [
          "Before the room photos, check parking capacity, whether there's an elevator, the check-in cut-off, luggage storage, and the cancellation policy. Coastal stays come with wind noise and nearby shops that close early — worth weighing against the ocean view itself.",
          "Without a rental car, check the actual walking route and slope to the nearest bus stop on a map. Some outlying areas are hard to get a taxi to as well, so plan your late-evening transport in advance."
        ]
      },
      {
        title: "Route, not rankings",
        paragraphs: [
          "This article doesn't rank specific properties. Prices and ratings shift by travel date, so the safer approach is to pick your area first, then compare similarly-priced rooms and cancellation terms within it."
        ]
      }
    ],
    sources: commonSourcesEn
  },

  "family-friendly-jeju": {
    title: "Jeju Destinations That Work Well With Family",
    category: "Places to Visit",
    region: "Across Jeju",
    address: "Major sights across Jeju-si and Seogwipo-si",
    parking:
      "With a stroller or luggage in tow, check the walking distance from the parking lot to your actual destination.",
    fee: "Admission fees vary by site — check family rates and free-admission age cutoffs on-site.",
    operatingHours:
      "Indoor sights may have a weekly closed day; outdoor plans depend on weather and safety notices.",
    course: [
      "Morning forest trail",
      "Lunch at a market",
      "Afternoon beach",
      "Backup indoor option"
    ],
    nearbySpots: [
      "Jeolmul Natural Recreation Forest",
      "Hamdeok Beach",
      "Dongmun Market",
      "Jeju Museum of Art"
    ],
    summary:
      "Choosing Jeju destinations for a family trip by restrooms, slope and an indoor backup — how easy each place is to actually move around, not just how well-known it is.",
    editorialSections: [
      {
        title: "Look at ease of movement before the highlight reel",
        paragraphs: [
          "For a family trip, what matters is the distance and slope between the entrance and the actual viewpoint. A place that looks close on a map can still wear out kids and grandparents fast if there's a long staircase after parking, or no shade.",
          "Rather than packing in several headline sights in one day, split it into one outdoor stop in the morning, lunch, and one indoor stop in the afternoon. Build meal waits and bathroom breaks into your schedule and you'll run into fewer surprise delays."
        ]
      },
      {
        title: "Have a plan for both kinds of weather",
        paragraphs: [
          "On clear days, gentle beaches and walking trails work well; on rainy days, look for places with a predictable visit length, like an aquarium or museum. Having one outdoor and one indoor option ready in the same area means you can switch without a long drive.",
          "On windy days, skip coastal walks and oreum climbs and pick somewhere easy to get in and out of the car. Stroller-accessible routes and nursing/rest areas are worth checking through official listings rather than assuming."
        ]
      },
      {
        title: "Plan around your accommodation",
        paragraphs: [
          "If a kid's nap or a grandparent's rest is part of the plan, keep day-one activities within about 40 minutes of your stay one-way. Crossing from east to west in a single day tends to mean more time in the car than at any actual destination.",
          "Whether breakfast and dinner are available near your stay matters too. Rather than betting everything on one famous restaurant near a sight, have a backup meal option that doesn't involve a wait."
        ]
      },
      {
        title: "Before you book anything",
        paragraphs: [
          "For shows and hands-on experiences, check age/height limits, session times, and cancellation terms. For paid sights, compare more than the online ticket price — factor in on-site amenities and parking fees too."
        ]
      }
    ],
    sources: commonSourcesEn
  },

  "rainy-day-indoor-jeju": {
    title: "Rainy-Day Indoor Jeju",
    category: "Seasonal Routes",
    region: "Across Jeju",
    address: "Indoor attractions across Jeju-si, Aewol and Seogwipo",
    parking:
      "Use each site's own parking lot. Confirm whether indoor or covered parking is available if it's raining hard.",
    fee: "Admission fees vary by site — check which exhibits are free and which require a ticket.",
    operatingHours: "Museums and exhibits usually have a closed day, so check before your visit.",
    course: [
      "Jeju Museum of Art",
      "Dongmun Market",
      "Indoor café",
      "Arte Museum or another exhibition space"
    ],
    nearbySpots: ["Jeju Museum of Art", "Dongmun Market", "Arte Museum", "Indoor exhibits in Seogwipo"],
    summary:
      "A ground rule for a rainy or windy day in Jeju: stay within one area, and link a museum, a market and a café without much driving in between.",
    editorialSections: [
      {
        title: "On a rainy day, shrink your radius first",
        paragraphs: [
          "Rain and wind can vary a lot between regions of Jeju even on the same day. Trying to dodge the rain by driving from the east coast to the west just adds driving fatigue — instead, pick two indoor spots close to your accommodation.",
          "Rather than visiting one museum and then driving far for a café, keep your exhibits, meals and market stop within a 20–30 minute radius. If there's strong wind on top of the rain, cut coastal drives and oreum plans from the day entirely."
        ]
      },
      {
        title: "How to choose an indoor spot",
        paragraphs: [
          "Traveling with kids, check visit length, whether experiences need advance booking, and whether the space is stroller- and meal-friendly. Solo or adult travelers should compare what kind of exhibit it is and roughly how long it takes, and avoid stacking two similar media-heavy exhibits back to back.",
          "Indoor attractions get crowded on rainy days. If a place takes reservations, lock in a time slot; if it doesn't, have a market or a covered arcade ready as a backup instead of standing in an entry queue."
        ]
      },
      {
        title: "Driving and parking in the rain",
        paragraphs: [
          "Heavy rain brings pooling water and reduced visibility. Give yourself more time than your navigation app estimates, and prioritize places with underground or covered parking connected directly to the entrance for an easier arrival.",
          "Bring a towel and a plastic bag so you can deal with wet umbrellas and jackets inside the car. Sights with a long outdoor walk from the parking lot to the entrance won't feel much like an 'indoor' day even if the destination itself is covered."
        ]
      },
      {
        title: "If the weather clears up",
        paragraphs: [
          "Even after the rain eases, forest trails and coastal walkways can still be slippery. Rather than jumping straight into a long outdoor route, ease back in with something easy to retreat from, like a stroll around a market or a short harbor walk."
        ]
      }
    ],
    sources: outdoorSourcesEn
  },

  "aewol-coastal-drive": {
    title: "Aewol Coastal Drive",
    category: "Cafes",
    region: "Western Jeju · Aewol",
    address: "Aewol Haean-ro, Aewol-eup, Jeju-si, Jeju",
    parking:
      "Parking varies a lot from café to café. Around Handam Beach, plan on parking and walking rather than driving right up.",
    fee: "The coast road and beaches are free to walk. Cafés charge separately.",
    operatingHours: "The road and beaches are accessible any time. Café hours vary by shop.",
    course: ["Iho Tewoo Beach", "Aewol coast road", "Handam Beach walk", "Gwakji Beach"],
    nearbySpots: ["Handam Beach", "Gwakji Beach", "Iho Tewoo Beach", "Aewol café strip"],
    summary:
      "A relaxed drive along the Aewol coast road, not far from the airport, alternating between café stops and ocean views.",
    editorialSections: [
      {
        title: "Break the drive into short stops",
        paragraphs: [
          "The Aewol coast road works better as a series of planned stops — Gwakji, Handam, Aewol Port — than as one continuous drive. Check the public parking lots and approach direction on a map ahead of time rather than pulling over wherever looks convenient.",
          "Around sunset, both cars and pedestrians pick up fast. If you're planning to walk the Handam trail at dusk, don't count on café parking — find a spot you can walk from instead."
        ]
      },
      {
        title: "A workable order and how long to stay",
        paragraphs: [
          "Gwakji Beach and the Handam trail in the morning, one Aewol café in the afternoon, is a solid structure. If you're heading to a western hotel that night, it's easier to finish dinner in the Aewol area than to push on to Hyeopjae as well.",
          "For photos, stop only where the view actually opens up, and choose a café with reliable parking and table turnover. Stacking several popular spots back to back usually means spending most of your time waiting and parking, not looking at the coast."
        ]
      },
      {
        title: "Wind and road safety",
        paragraphs: [
          "Watch for crosswinds and pedestrians stepping out unexpectedly on the coast road. Have a passenger check locations rather than sightseeing while driving, and only stop in marked parking areas.",
          "In rain, parts of the walking trail get slippery and waves can pick up. Cut back on getting close to the coastline and have an indoor café or a central Jeju-si route ready as a backup."
        ]
      },
      {
        title: "Who this suits",
        paragraphs: [
          "This works well if you're heading west on your arrival or departure day. Without a car, space out bus intervals in mind and pick one area — Handam or Aewol Port — to walk rather than trying to cover the whole coast road."
        ]
      }
    ],
    sources: outdoorSourcesEn
  },

  "seogwipo-olle-market-food": {
    title: "Seogwipo Maeil Olle Market Food Route",
    category: "Food",
    region: "Downtown Seogwipo",
    address: "Jungang-ro 62beon-gil, Seogwipo-si, Jeju",
    parking: "Use the public lots around the market. Evenings can get crowded.",
    fee: "Free to enter the market. Food and parking are paid separately.",
    operatingHours: "Hours vary by stall. Check whether your target stall is open before an evening visit.",
    course: ["Seogwipo Maeil Olle Market", "Lee Jung-seop Street", "Saeyeon Bridge at night", "Around Cheonjiyeon Waterfall"],
    nearbySpots: ["Lee Jung-seop Street", "Saeyeon Bridge", "Cheonjiyeon Waterfall", "Seogwipo Port"],
    summary:
      "A market-food and late-snack route that pairs well with a night in downtown Seogwipo — dinner, dessert, and an evening walk.",
    editorialSections: [
      {
        title: "Narrow down the menu before you go in",
        paragraphs: [
          "Snacks, takeout food and full meals are all on display at once at Maeil Olle Market, and walking in without a plan makes it easy to buy the same kind of thing twice. Decide on one real meal and one or two snacks to split, and stick to that.",
          "Rather than just following the longest line, think about where you'll actually eat what you buy, whether it needs refrigeration, and how far it is back to your hotel. Seafood and hot food especially shouldn't sit around for long after you buy it."
        ]
      },
      {
        title: "A walkable Seogwipo evening",
        paragraphs: [
          "A natural order is a walk on Lee Jung-seop Street, dinner at the market, then checking whether Cheonjiyeon Waterfall's night viewing is running. If the timing doesn't line up, swap it for a walk around Saeyeon Bridge or Seogwipo Port instead.",
          "It's easier to park once and walk than to move the car repeatedly. With kids or older family members, factor in the hills and the walk back — it may be worth trimming either the market or the walk, not both."
        ]
      },
      {
        title: "Parking and busy hours",
        paragraphs: [
          "Evening and weekend parking near the market can involve a wait. Rather than waiting for a spot right by the market, check the nearby public lots and their hours in advance.",
          "The market aisles get tight when busy, which makes moving with big bags or a stroller harder. Do one loop first to see what's on offer, then decide what to buy — it saves backtracking through the same aisle."
        ]
      },
      {
        title: "Before you go",
        paragraphs: [
          "Hours and closed days differ by stall. If you're set on a specific stall, check its posted hours; otherwise, treat the whole market as an area with plenty of options, which gives you room to adjust on the fly."
        ]
      }
    ],
    sources: commonSourcesEn
  },

  "sangumburi-autumn-course": {
    title: "Sangumburi Autumn Silver Grass Trip",
    category: "Seasonal Routes",
    region: "Eastern Jeju · Jocheon",
    address: "Bijarim-ro, Jocheon-eup, Jeju-si, Jeju",
    parking: "Use the site's parking lot. Weekends and peak autumn get crowded.",
    fee: "Paid admission — check current pricing on the official site before you go.",
    operatingHours: "Hours shift by season. Confirm the last-entry cutoff for a late-afternoon visit.",
    course: ["Sangumburi", "Around Gyorae Natural Recreation Forest", "Jeju Stone Park", "Jocheon café"],
    nearbySpots: ["Jeju Stone Park", "Gyorae Natural Recreation Forest", "Bijarim", "Jeolmul Natural Recreation Forest"],
    summary:
      "A light eastern oreum outing built around Sangumburi's autumn silver grass and crater views.",
    editorialSections: [
      {
        title: "Check the light along with the season",
        paragraphs: [
          "The look of Sangumburi's silver grass depends more on weather and growing conditions than on any single date. Check recent official photos and notices before you go, and account for glare and exposure if you're visiting during strong backlight hours.",
          "Much of the crater rim is exposed to wind. Don't judge by the temperature back in town — bring a light windbreaker so the viewpoint is actually comfortable to linger at."
        ]
      },
      {
        title: "How to walk it",
        paragraphs: [
          "Build in time for the walk from the entrance to the viewing area, the walk back, and photos. If anyone in your group finds stairs or slopes difficult, stick to the accessible viewing section rather than the full loop.",
          "Sangumburi in the morning, then somewhere sheltered from the wind — Bijarim or a Jocheon café — in the afternoon works well. Stacking several oreum visits in a row tends to blur together and adds up in fatigue."
        ]
      },
      {
        title: "Parking and admission",
        paragraphs: [
          "In peak season, expect a wait to get into the parking lot and at the ticket counter. If you're arriving late in the day, check the last-entry time and how long you'll actually need first.",
          "Prices and hours change by season, so don't rely on old reviews. Check the official notice, and switch to a forest or indoor route if it's raining or foggy."
        ]
      },
      {
        title: "An autumn travel tip",
        paragraphs: [
          "Rather than making the trip just for silver-grass photos, pair it with eastern Jeju's stone walls, forests and a meal — that way the day still works even if the weather turns. White or light-colored clothing stands out against the grass, but skip anything loose enough to blow around in the wind."
        ]
      }
    ],
    sources: outdoorSourcesEn
  },

  "east-jeju-2days": {
    title: "Eastern Jeju in 2 Days, 1 Night",
    category: "Seasonal Routes",
    region: "Eastern Jeju",
    address: "Jocheon-eup, Gujwa-eup, Jeju-si and Seongsan-eup, Seogwipo-si",
    parking: "Use each site's public lot. If you're visiting Udo, plan for parking near Seongsan Port.",
    fee: "Admission and ferry fares are separate at each stop.",
    operatingHours: "Check Udo's ferry schedule and any paid sites' hours first — they anchor the rest of the plan.",
    course: ["Day 1: Hamdeok & Bijarim", "Overnight in Seongsan", "Day 2: Seongsan Ilchulbong", "Udo or Seopjikoji"],
    nearbySpots: ["Hamdeok Beach", "Bijarim", "Seongsan Ilchulbong", "Udo Island", "Seopjikoji"],
    summary:
      "A no-backtracking 2-day, 1-night route through eastern Jeju, splitting Seongsan, Udo, Hamdeok and Bijarim across two days.",
    editorialSections: [
      {
        title: "Front-load the northeast on day one",
        paragraphs: [
          "Coming from the airport, Jocheon, then Hamdeok, then Gimnyeong or Woljeongri is a simple sequence. Trying to also fit in Seongsan and Udo on day one usually means less actual beach time once you account for arrival and meal waits.",
          "If you're staying in Seongsan, keep heading east through the afternoon, but don't stack multiple cafés and multiple beaches. One walk at Hamdeok and one meal or café stop in Gujwa is enough to avoid rushing check-in."
        ]
      },
      {
        title: "Day two: the Seongsan area",
        paragraphs: [
          "If sunrise is the plan, check your parking spot and the forecast the evening before. If you're also doing Udo, plan around the morning ferry and pick just one of Seongsan Ilchulbong or Seopjikoji for the same day.",
          "If the ferry gets cancelled, Seongsan Ilchulbong, Gwangchigi Beach and Seopjikoji make a reasonable substitute loop. Having that backup ready means you're not burning time at the port figuring out plan B."
        ]
      },
      {
        title: "Where to stay and what to pack",
        paragraphs: [
          "For a single overnight, it's usually more efficient to base in either Seongsan or Gujwa rather than switching hotels. Check whether luggage storage is available before check-in so you're not leaving bags in the car all day.",
          "Without a car, bus intervals make it hard to follow this exact route. Cut back on either the Hamdeok or the Seongsan leg and build the day around whichever major stops have the simplest transfers."
        ]
      },
      {
        title: "Adjusting by season",
        paragraphs: [
          "In summer, cut back on midday beach time; in winter, plan around shorter daylight hours. If rain or strong wind is forecast, drop Udo and the oreum from the plan and center the day on Bijarim or an indoor sight instead."
        ]
      }
    ],
    sources: outdoorSourcesEn
  },

  "seopjikoji-coastal-walk-guide": {
    title: "Seopjikoji Coastal Walk Guide",
    category: "Places to Visit",
    region: "Eastern Jeju · Seongsan",
    address: "Goseong-ri, Seongsan-eup, Seogwipo-si, Jeju",
    parking:
      "Use the entrance parking lot. In peak season and on weekends, the access road can back up — a morning visit is easier.",
    fee: "Most of the coastal walk is free; a few facilities may charge — check on-site.",
    operatingHours:
      "This is a heavily weather-dependent outdoor walk. Check the on-site advisory before approaching the coast in strong wind or rain.",
    course: ["Seopjikoji entrance", "Coastal walking trail", "Viewpoint", "Seongsan Ilchulbong or Gwangchigi Beach"],
    nearbySpots: ["Seongsan Ilchulbong", "Gwangchigi Beach", "Sinyang-Seopji Beach", "Seongsan Port"],
    summary:
      "Parking, wind, slope and timing for pairing a Seopjikoji coastal walk with Seongsan Ilchulbong.",
    editorialSections: [
      {
        title: "Budget your round-trip time first",
        paragraphs: [
          "Seopjikoji isn't a stop-and-photograph spot — it's a walking trail where the view changes as you follow the coast. Set aside at least an hour, including the walk from parking, photo stops, and rest breaks.",
          "You don't have to walk all the way to the end. If it's windy or anyone in your group finds walking difficult, turn back once you reach an open viewpoint rather than pushing further."
        ]
      },
      {
        title: "Pairing it with the Seongsan area",
        paragraphs: [
          "Morning at Seongsan Ilchulbong, lunch, afternoon at Seopjikoji is a simple order, but in midsummer that puts you there during the hottest part of the day. In summer, consider walking Seopjikoji in the morning and doing Seongsan after an indoor lunch instead.",
          "Adding Udo the same day can leave all three feeling rushed. On a day with a ferry, prioritize Udo and Seongsan Ilchulbong, and treat Seopjikoji as optional depending on weather and time left."
        ]
      },
      {
        title: "Wind and footwear",
        paragraphs: [
          "There's little shelter along the coastal stretch, and the surface can be slick after rain. Wear shoes with good grip and a windproof layer, and stay back from the edge on days with high waves.",
          "Parking availability and site operations can shift on the day. If you're visiting late afternoon, check not just sunset time but also exit traffic and nearby dinner hours."
        ]
      },
      {
        title: "A tip for photos",
        paragraphs: [
          "Rather than waiting at one spot for the perfect shot, keep moving and alternate between angles that show Seongsan Ilchulbong and the coastal grassland. If you're using a tripod or larger gear, be mindful not to block the trail."
        ]
      }
    ],
    sources: outdoorSourcesEn
  },

  "bijarim-forest-walk-guide": {
    title: "Bijarim Forest Walk Guide",
    category: "Places to Visit",
    region: "Eastern Jeju · Gujwa",
    address: "Bijasup-gil, Gujwa-eup, Jeju-si, Jeju",
    parking: "Use the site's parking lot. Dirt paths can be slick after rain.",
    fee: "Admission may apply — check the official notice and on-site pricing before you go.",
    operatingHours:
      "Last-entry times shift by season. If you're visiting late afternoon, check the cutoff first.",
    course: ["Bijarim entrance", "Loop forest walk", "Gujwa café", "Woljeongri or Sehwa Beach"],
    nearbySpots: ["Woljeongri Beach", "Sehwa Beach", "Pyeongdae-ri cafés", "Manjanggul Cave"],
    summary:
      "How much time to actually give Bijarim, what to wear, and how to pair it with the rest of an eastern-Jeju day, rain or shine.",
    editorialSections: [
      {
        title: "A short-looking forest takes longer than it looks",
        paragraphs: [
          "Between photos and slowing down to look at the trees, Bijarim tends to take longer than the map distance suggests. Don't arrive close to the last-entry cutoff — build in time for rest stops and restrooms.",
          "Most of the loop is gentle, but the dirt and stone can be slippery after rain. Skip sandals or smooth-soled shoes in favor of sneakers that still grip when wet."
        ]
      },
      {
        title: "Deciding whether to visit in the rain",
        paragraphs: [
          "Light rain actually suits the forest's atmosphere, but strong wind or heavy rain raises the risk of falling branches and slick footing. Don't rely on an umbrella alone — bring a waterproof layer, and switch to an indoor plan if there's an on-site closure notice.",
          "A towel and spare socks are useful after rain. With kids, check ahead whether the muddier sections make a stroller impractical that day."
        ]
      },
      {
        title: "Pairing it with the eastern coast",
        paragraphs: [
          "Bijarim plus Woljeongri or Sehwa Beach gives you both forest and coast in one day. On a windy day, though, cut back on beach time and swap in Jeju Stone Park or a café instead.",
          "If you're heading to a Seongsan hotel, treat Bijarim as a midpoint stop and eat in Gujwa. Adding an oreum climb the same day adds up in walking distance, so check your energy level first."
        ]
      },
      {
        title: "Check the official notice",
        paragraphs: [
          "Admission, hours, closed days and which sections are open should be confirmed through official channels. Parts of the forest may be closed for conservation or safety, so don't expect the exact route from an old review.",
          "Stay on the marked trail and don't touch the trees or plants. This is a quiet place to walk — keep noise and food to a minimum, and carry your own trash back out with you."
        ]
      }
    ],
    sources: outdoorSourcesEn
  }
};

// MyRealTrip's own catalog and its server-side keyword matching
// (functions/lib/affiliate-match.js) are Korean-only, so booking widgets on
// English article pages still need to search using the original Korean
// title/region/category/nearby-spot terms even though everything the
// visitor reads is English. `curateArticlesEn` keeps those original values
// around as koTitle/koRegion/koCategory/koNearbySpots for that purpose only
// — they are never rendered, just sent to the existing MyRealTrip APIs.
export function curateArticlesEn(articles = [], overridesEn = editorialOverridesEn, slugs = translatedSlugs) {
  const articlesBySlug = new Map(articles.map((article) => [article.slug, article]));
  return slugs
    .map((slug) => {
      const article = articlesBySlug.get(slug);
      const override = overridesEn[slug];
      if (!article || !override) return null;
      const content = override.editorialSections.flatMap((section) => section.paragraphs);
      return {
        ...article,
        ...override,
        slug,
        image: article.image,
        date: article.date,
        koTitle: article.title,
        koRegion: article.region,
        koCategory: article.category,
        koNearbySpots: article.nearbySpots || [],
        content,
        status: "published",
        author: editorialProfileEn.author,
        publisher: editorialProfileEn.publisher,
        reviewedAt: editorialProfileEn.reviewedAt,
        dateModified: editorialProfileEn.reviewedAt,
        reviewMethod: editorialProfileEn.reviewMethod
      };
    })
    .filter(Boolean);
}
