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
  "rainy-day-indoor-jeju"
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
