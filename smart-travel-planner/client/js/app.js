// ---------------- Shared data & Configuration ----------------
const API_BASE = '/api';

// Helper: returns local asset path, falling back to Unsplash CDN if needed
function destImg(local, unsplashId, w = 1200) {
  return `assets/${local}`;
}

// ---------------- Tourist POI Data (Points of Interest per destination) ----------------
const touristPOIs = {
  1: [ // Goa
    { name: "Baga Beach",           lat: 15.5553, lon: 73.7527, type: "beach",    desc: "Famous party beach with shacks, water sports & vibrant nightlife." },
    { name: "Calangute Beach",      lat: 15.5440, lon: 73.7553, type: "beach",    desc: "Queen of Beaches — Goa's largest and most popular beach." },
    { name: "Fort Aguada",          lat: 15.4964, lon: 73.7754, type: "fort",     desc: "17th-century Portuguese fort with a famous lighthouse." },
    { name: "Basilica of Bom Jesus",lat: 15.5009, lon: 73.9116, type: "temple",   desc: "UNESCO World Heritage Site & home of St. Francis Xavier's remains." },
    { name: "Dudhsagar Falls",      lat: 15.3143, lon: 74.3144, type: "nature",   desc: "Spectacular 4-tiered waterfall on the Goa-Karnataka border." },
    { name: "Anjuna Flea Market",   lat: 15.5733, lon: 73.7400, type: "market",   desc: "Iconic Wednesday flea market — hippie vibes, crafts & music." },
    { name: "Panjim Inn",           lat: 15.4989, lon: 73.8278, type: "hotel",    desc: "Charming heritage hotel in the heart of Fontainhas Latin Quarter." },
    { name: "Hotel Fidalgo Goa",    lat: 15.5003, lon: 73.8295, type: "hotel",    desc: "Well-located 3-star hotel near Goa's main market area." },
    { name: "Jungle Hostel Goa",    lat: 15.5532, lon: 73.7620, type: "hostel",   desc: "Budget-friendly hostel near Baga Beach, popular with backpackers." },
    { name: "Mapusa Market",        lat: 15.5931, lon: 73.8083, type: "market",   desc: "Lively Friday market — local produce, spices & cheap souvenirs." }
  ],
  2: [ // Manali
    { name: "Solang Valley",        lat: 32.3190, lon: 77.1527, type: "nature",   desc: "Snow adventure hub — skiing, paragliding & cable car rides." },
    { name: "Rohtang Pass",         lat: 32.3718, lon: 77.2313, type: "nature",   desc: "Breathtaking high-altitude mountain pass at 3,978m." },
    { name: "Hadimba Temple",       lat: 32.2396, lon: 77.1834, type: "temple",   desc: "Ancient cave temple dedicated to Goddess Hadimba, built in 1553." },
    { name: "Old Manali",           lat: 32.2565, lon: 77.1726, type: "market",   desc: "Bohemian village with cafes, backpacker hostels & art galleries." },
    { name: "Beas River Rafting",   lat: 32.2200, lon: 77.1900, type: "adventure",desc: "White-water rafting on the gushing River Beas." },
    { name: "The Himalayan Hotel",  lat: 32.2433, lon: 77.1905, type: "hotel",    desc: "Comfortable 3-star hotel with stunning Himalayan mountain views." },
    { name: "Snow Valley Resorts",  lat: 32.2482, lon: 77.1858, type: "hotel",    desc: "Premium resort with private valley views and cozy interiors." },
    { name: "Zostel Manali",        lat: 32.2551, lon: 77.1711, type: "hostel",   desc: "Top-rated hostel in Old Manali — great community & cheap food." },
    { name: "Vashisht Hot Springs", lat: 32.2695, lon: 77.1878, type: "nature",   desc: "Natural sulfur hot springs in the beautiful Vashisht village." },
    { name: "Mall Road Manali",     lat: 32.2432, lon: 77.1910, type: "market",   desc: "Main shopping promenade with local handicrafts & restaurants." }
  ],
  3: [ // Jaipur
    { name: "Amber Fort",           lat: 26.9855, lon: 75.8513, type: "fort",     desc: "Magnificent hilltop fort with ornate palaces & elephant rides." },
    { name: "Hawa Mahal",           lat: 26.9239, lon: 75.8267, type: "fort",     desc: "Iconic Palace of Winds — 5-storey pink sandstone facade." },
    { name: "City Palace Jaipur",   lat: 26.9258, lon: 75.8237, type: "fort",     desc: "Royal residence with museums, courtyards & stunning architecture." },
    { name: "Jal Mahal",            lat: 26.9521, lon: 75.8430, type: "nature",   desc: "Enchanting water palace floating in the middle of Man Sagar Lake." },
    { name: "Jantar Mantar",        lat: 26.9246, lon: 75.8247, type: "temple",   desc: "UNESCO-listed astronomical observatory with giant instruments." },
    { name: "Johari Bazaar",        lat: 26.9202, lon: 75.8201, type: "market",   desc: "Famous jewellery bazaar — precious gems, bangles & textiles." },
    { name: "ITC Rajputana Hotel",  lat: 26.9052, lon: 75.7882, type: "hotel",    desc: "Luxury 5-star hotel blending Rajput architecture with modern comfort." },
    { name: "Zostel Jaipur",        lat: 26.9119, lon: 75.7887, type: "hostel",   desc: "Lively backpacker hostel near the Pink City's attractions." },
    { name: "Albert Hall Museum",   lat: 26.9115, lon: 75.8192, type: "temple",   desc: "Oldest museum in Rajasthan — housed in a stunning Indo-Saracenic building." },
    { name: "Bapu Bazaar",          lat: 26.9207, lon: 75.8147, type: "market",   desc: "Street market famous for Rajasthani jootis, textiles & handicrafts." }
  ],
  4: [ // Kerala Backwaters (Alleppey)
    { name: "Alleppey Beach",       lat: 9.4898,  lon: 76.3277, type: "beach",    desc: "Long sandy beach with an old British-era pier jutting into the sea." },
    { name: "Vembanad Lake",        lat: 9.6000,  lon: 76.4000, type: "nature",   desc: "Kerala's largest lake — the gateway to the famous backwaters." },
    { name: "Kumarakom Bird Sanctuary", lat: 9.6167, lon: 76.4333, type: "nature", desc: "Mangrove forests teeming with egrets, darters & migratory birds." },
    { name: "Marari Beach",         lat: 9.6000,  lon: 76.3000, type: "beach",    desc: "Quiet, pristine fishing village beach — perfect for relaxation." },
    { name: "St. Mary's Church Alleppey", lat: 9.4908, lon: 76.3388, type: "temple", desc: "One of the oldest churches in Kerala, dating back to 1911." },
    { name: "Punnamada Lake",       lat: 9.5272,  lon: 76.3583, type: "nature",   desc: "Venue of the famous Nehru Trophy Snake Boat Race every August." },
    { name: "Marari Beach Resort",  lat: 9.5990,  lon: 76.3013, type: "hotel",    desc: "Award-winning eco-resort on the pristine Marari Beach." },
    { name: "Emerald Isle Heritage Villa", lat: 9.4981, lon: 76.3388, type: "hotel", desc: "Romantic heritage stay on a small island surrounded by backwaters." },
    { name: "Zostel Alleppey",      lat: 9.4865,  lon: 76.3396, type: "hostel",   desc: "Popular hostel near boat jetty — great for solo backpackers." },
    { name: "Pathiramanal Island",  lat: 9.5880,  lon: 76.4060, type: "nature",   desc: "Tiny island in Vembanad Lake, sanctuary for 50+ species of birds." }
  ],
  5: [ // Ladakh
    { name: "Pangong Lake",         lat: 33.7638, lon: 78.6536, type: "nature",   desc: "Stunning high-altitude saltwater lake at 4,350m, spanning India & China." },
    { name: "Nubra Valley",         lat: 34.6667, lon: 77.5500, type: "nature",   desc: "Cold desert valley with sand dunes and Bactrian camels." },
    { name: "Leh Palace",           lat: 34.1653, lon: 77.5877, type: "fort",     desc: "Abandoned 17th-century royal palace towering over Leh town." },
    { name: "Magnetic Hill",        lat: 34.1726, lon: 77.4032, type: "nature",   desc: "Optical illusion where cars appear to roll uphill on their own." },
    { name: "Thiksey Monastery",    lat: 34.0494, lon: 77.6670, type: "temple",   desc: "Stunning 12-story monastery resembling the Potala Palace in Lhasa." },
    { name: "Shanti Stupa",         lat: 34.1616, lon: 77.5758, type: "temple",   desc: "White-domed stupa with panoramic views of Leh and surrounding mountains." },
    { name: "The Grand Dragon Ladakh", lat: 34.1527, lon: 77.5853, type: "hotel", desc: "Luxurious 4-star hotel with unmatched views of the Himalayas." },
    { name: "Zostel Leh",           lat: 34.1614, lon: 77.5836, type: "hostel",   desc: "Cozy hostel in Leh town — great rooftop views and good vibes." },
    { name: "Diskit Monastery",     lat: 34.6764, lon: 77.5750, type: "temple",   desc: "600-year-old monastery in Nubra Valley with a giant Maitreya Buddha." },
    { name: "Leh Main Market",      lat: 34.1660, lon: 77.5862, type: "market",   desc: "Bustling market with Tibetan handicrafts, pashmina shawls & prayer flags." }
  ],
  6: [ // Rishikesh
    { name: "Laxman Jhula",         lat: 30.1240, lon: 78.3230, type: "temple",   desc: "Iconic 450-ft iron suspension bridge across the Ganges, built in 1939." },
    { name: "Ram Jhula",            lat: 30.1106, lon: 78.3157, type: "temple",   desc: "Famous bridge near Shivananda Ashram — lined with temples & shops." },
    { name: "Triveni Ghat",         lat: 30.0999, lon: 78.2985, type: "temple",   desc: "Sacred bathing ghat — evening Ganga Aarti is spectacular here." },
    { name: "Neelkanth Mahadev Temple", lat: 30.1635, lon: 78.3949, type: "temple", desc: "Ancient Shiva temple at 1,675m altitude in lush forest hills." },
    { name: "River Rafting Shivpuri", lat: 30.1417, lon: 78.3541, type: "adventure", desc: "16 km of thrilling Grade 3-4 rapids — most popular rafting stretch." },
    { name: "Bungee Jumping Mohan Chatti", lat: 30.1200, lon: 78.3800, type: "adventure", desc: "83m free-fall bungee — one of India's highest bungee jump spots." },
    { name: "Zostel Rishikesh",     lat: 30.0841, lon: 78.2640, type: "hostel",   desc: "Well-known hostel on the Ganges banks — yoga, cafe & great community." },
    { name: "Glasshouse on the Ganges", lat: 30.1300, lon: 78.3200, type: "hotel", desc: "Heritage riverside resort in a colonial glasshouse setting." },
    { name: "Rajaji National Park", lat: 29.9000, lon: 78.2000, type: "nature",   desc: "Wildlife sanctuary at Rishikesh's doorstep — elephants, tigers & leopards." },
    { name: "Beatles Ashram",       lat: 30.1175, lon: 78.3248, type: "temple",   desc: "Maharishi Mahesh Yogi's ashram — visited by The Beatles in 1968." }
  ],
  7: [ // Andaman Islands
    { name: "Radhanagar Beach",     lat: 12.0526, lon: 92.9656, type: "beach",    desc: "Rated Asia's Best Beach — pristine turquoise waters & white sand." },
    { name: "Cellular Jail",        lat: 11.6700, lon: 92.7460, type: "fort",     desc: "Historic colonial prison & national memorial — powerful light & sound show." },
    { name: "Ross Island",          lat: 11.6700, lon: 92.7594, type: "nature",   desc: "Abandoned British headquarters — hauntingly beautiful ruins & tame deer." },
    { name: "North Bay Island",     lat: 11.6920, lon: 92.7697, type: "beach",    desc: "Vibrant coral reefs perfect for snorkelling and glass-bottom boat rides." },
    { name: "Elephant Beach Havelock", lat: 12.0660, lon: 92.9874, type: "beach", desc: "Clear waters with excellent snorkelling and scuba diving sites." },
    { name: "Scuba Diving Havelock", lat: 11.9843, lon: 92.9929, type: "adventure", desc: "World-class dive sites with vibrant coral gardens and marine life." },
    { name: "Barefoot at Havelock", lat: 12.0250, lon: 92.9700, type: "hotel",    desc: "Award-winning eco-resort on Radhanagar Beach with beach huts & villas." },
    { name: "TSG Emerald View Hotel", lat: 11.6726, lon: 92.7323, type: "hotel",  desc: "Comfortable 4-star hotel in Port Blair with sea-facing rooms." },
    { name: "Zostel Havelock",      lat: 12.0295, lon: 92.9770, type: "hostel",   desc: "Beachfront hostel on Havelock Island — ideal for budget divers." },
    { name: "Jolly Buoy Island",    lat: 11.5480, lon: 92.6800, type: "nature",   desc: "Marine national park with stunning coral ecosystems (seasonal access)." }
  ],
  8: [ // Shimla
    { name: "The Ridge Shimla",     lat: 31.1041, lon: 77.1667, type: "nature",   desc: "Iconic open space with stunning views of the snow-capped Himalayas." },
    { name: "Mall Road Shimla",     lat: 31.1027, lon: 77.1713, type: "market",   desc: "Colonial shopping promenade lined with cafes, shops & restaurants." },
    { name: "Jakhu Temple",         lat: 31.1063, lon: 77.1843, type: "temple",   desc: "Ancient Hanuman temple atop Jakhu Hill with panoramic city views." },
    { name: "Kufri",               lat: 31.0971, lon: 77.2654, type: "nature",   desc: "Mini hill station near Shimla — snow activities & Himalayan nature park." },
    { name: "Christ Church Shimla", lat: 31.1038, lon: 77.1689, type: "temple",   desc: "2nd oldest church in North India — Gothic architecture & beautiful stained glass." },
    { name: "Toy Train Shimla",     lat: 31.1082, lon: 77.1712, type: "adventure", desc: "UNESCO heritage Kalka-Shimla narrow-gauge railway — scenic mountain journey." },
    { name: "The Oberoi Cecil",     lat: 31.1026, lon: 77.1615, type: "hotel",    desc: "Grand colonial-era luxury hotel with magnificent mountain views." },
    { name: "Woodville Palace Hotel", lat: 31.1021, lon: 77.1504, type: "hotel",  desc: "Charming 1938 heritage hotel in a leafy, secluded estate." },
    { name: "Zostel Shimla",        lat: 31.1020, lon: 77.1700, type: "hostel",   desc: "Cozy budget hostel near Mall Road — great for young travellers." },
    { name: "Scandal Point",        lat: 31.1043, lon: 77.1665, type: "market",   desc: "Historic meeting point on Mall Road with a famous legend of romance." }
  ],
  9: [ // Udaipur
    { name: "City Palace Udaipur",  lat: 24.5763, lon: 73.6836, type: "fort",     desc: "Largest royal palace complex in Rajasthan — stunning Lake Pichola views." },
    { name: "Lake Pichola",         lat: 24.5762, lon: 73.6820, type: "nature",   desc: "Beautiful artificial lake dotted with marble palaces & island hotels." },
    { name: "Jag Mandir Island",    lat: 24.5713, lon: 73.6810, type: "fort",     desc: "Island palace in Lake Pichola — where Prince Khurram took refuge." },
    { name: "Sajjangarh Palace",    lat: 24.5871, lon: 73.6531, type: "fort",     desc: "Monsoon Palace perched on a hilltop — magical sunset views of the city." },
    { name: "Jagdish Temple",       lat: 24.5787, lon: 73.6843, type: "temple",   desc: "Largest temple in Udaipur — superb Indo-Aryan architecture from 1651." },
    { name: "Fateh Sagar Lake",     lat: 24.5966, lon: 73.6781, type: "nature",   desc: "Picturesque artificial lake with boat rides and a small island garden." },
    { name: "Taj Lake Palace Hotel", lat: 24.5740, lon: 73.6820, type: "hotel",   desc: "Iconic floating palace hotel — one of the world's most romantic stays." },
    { name: "Zostel Udaipur",       lat: 24.5797, lon: 73.6838, type: "hostel",   desc: "Lakeside hostel with rooftop views of Lake Pichola — very popular." },
    { name: "Shilpgram Crafts Village", lat: 24.6007, lon: 73.6600, type: "market", desc: "Living museum of rural arts & crafts of western India." },
    { name: "Ambrai Ghat",          lat: 24.5776, lon: 73.6804, type: "nature",   desc: "Serene lakeside ghat — best spot for sunset views of City Palace." }
  ],
  10: [ // Munnar
    { name: "Tea Museum Munnar",    lat: 10.0869, lon: 77.0617, type: "nature",   desc: "Fascinating museum showcasing the history and making of Munnar tea." },
    { name: "Eravikulam National Park", lat: 10.1800, lon: 77.0700, type: "nature", desc: "Home to the endangered Nilgiri Tahr — stunning shola grasslands." },
    { name: "Mattupetty Dam",       lat: 10.1285, lon: 77.1280, type: "nature",   desc: "Serene dam with boating, surrounded by lush tea estates and forests." },
    { name: "Top Station",          lat: 10.1985, lon: 77.1619, type: "nature",   desc: "Highest point in Munnar — breathtaking views of the Western Ghats." },
    { name: "Attukad Waterfalls",   lat: 10.1120, lon: 77.0990, type: "nature",   desc: "Scenic cascade amid tea gardens — great for a refreshing walk." },
    { name: "Pothamedu Viewpoint",  lat: 10.1175, lon: 77.0870, type: "nature",   desc: "Panoramic viewpoint overlooking vast tea, coffee & cardamom estates." },
    { name: "Windermere Estate",    lat: 10.0901, lon: 77.0590, type: "hotel",    desc: "Heritage plantation bungalow stay amid tea gardens — very peaceful." },
    { name: "Spice Village CGH Earth", lat: 10.0850, lon: 77.0561, type: "hotel", desc: "Award-winning eco-resort styled like a tribal village in the hills." },
    { name: "Zostel Munnar",        lat: 10.0885, lon: 77.0606, type: "hostel",   desc: "Budget hostel near Munnar town — great base for trekking trips." },
    { name: "Chinnakanal Waterfalls", lat: 10.0667, lon: 77.0900, type: "nature", desc: "Cascading falls near Power House — popular picnic destination." }
  ],
  11: [ // Hampi
    { name: "Virupaksha Temple",    lat: 15.3350, lon: 76.4620, type: "temple",   desc: "Main living temple in Hampi — dedicated to Lord Shiva since the 7th century." },
    { name: "Vittala Temple",       lat: 15.3358, lon: 76.4734, type: "temple",   desc: "Marvel of Vijayanagara architecture — famous for musical stone pillars." },
    { name: "Matanga Hill",         lat: 15.3362, lon: 76.4627, type: "nature",   desc: "Best sunrise viewpoint in Hampi — panoramic view of boulder landscape." },
    { name: "Hampi Bazaar",         lat: 15.3356, lon: 76.4610, type: "market",   desc: "Ancient market street lined with granite pillars — now a lively strip." },
    { name: "Lotus Mahal",          lat: 15.3197, lon: 76.4676, type: "fort",     desc: "Exquisite double-storey pavilion blending Hindu and Islamic styles." },
    { name: "Elephant Stables",     lat: 15.3193, lon: 76.4674, type: "fort",     desc: "Magnificent 11-domed structure that once housed royal elephants." },
    { name: "Kishkinda Heritage Resort", lat: 15.3314, lon: 76.4456, type: "hotel", desc: "Eco-resort with cottages amid boulders — serene Hampi experience." },
    { name: "Gopi Guest House Hampi", lat: 15.3356, lon: 76.4620, type: "hostel",  desc: "Top-rated budget stay right on the Hampi Bazaar strip." },
    { name: "Tungabhadra River",    lat: 15.3380, lon: 76.4608, type: "nature",   desc: "Sacred river — coracle boat rides to Virupaksha Temple." },
    { name: "Royal Enclosure Hampi", lat: 15.3215, lon: 76.4627, type: "fort",    desc: "Vast walled complex of platforms and pavilions of the Vijayanagara kings." }
  ],
  12: [ // Jim Corbett
    { name: "Dhikala Zone",         lat: 29.5712, lon: 78.7916, type: "nature",   desc: "Most popular and biodiverse zone — best chance to spot tigers." },
    { name: "Corbett Waterfall",    lat: 29.5484, lon: 78.9123, type: "nature",   desc: "Picturesque waterfall surrounded by lush sal forests." },
    { name: "Sitabani Forest",      lat: 29.5000, lon: 79.0500, type: "nature",   desc: "Buffer zone bordering the national park — great for birding." },
    { name: "Garjiya Devi Temple",  lat: 29.5850, lon: 78.9220, type: "temple",   desc: "Sacred temple on a rock in the Kosi River — popular pilgrimage site." },
    { name: "Bijrani Zone",         lat: 29.5500, lon: 78.8500, type: "nature",   desc: "Grassland zone known for tiger sightings and elephant herds." },
    { name: "Corbett Museum Kaladhungi", lat: 29.3855, lon: 79.0370, type: "fort", desc: "Jim Corbett's winter home turned museum — colonial hunting memorabilia." },
    { name: "The Infinity Resort Corbett", lat: 29.5308, lon: 78.7758, type: "hotel", desc: "Upscale resort at the park gate with jungle-view cottages." },
    { name: "Jim's Jungle Retreat", lat: 29.5250, lon: 78.7820, type: "hotel",    desc: "Award-winning eco-lodge with private forest trails and birdwatching." },
    { name: "Aahana The Corbett Wilderness", lat: 29.5197, lon: 78.7747, type: "hotel", desc: "Luxury tented resort with a wildlife naturalist on staff." },
    { name: "Kosi River Viewpoint", lat: 29.5800, lon: 78.9100, type: "nature",   desc: "Scenic river-bank spot — elephants often cross here at dusk." }
  ]
};

// POI type config: color, emoji icon for map markers
const POI_TYPE_CONFIG = {
  beach:     { color: '#0ea5e9', emoji: '🏖️', label: 'Beach' },
  fort:      { color: '#d97706', emoji: '🏰', label: 'Fort / Palace' },
  temple:    { color: '#8b5cf6', emoji: '🛕', label: 'Temple / Church' },
  nature:    { color: '#10b981', emoji: '🌿', label: 'Nature / Park' },
  market:    { color: '#f59e0b', emoji: '🛍️', label: 'Market / Bazaar' },
  hotel:     { color: '#3b82f6', emoji: '🏨', label: 'Hotel / Resort' },
  hostel:    { color: '#ec4899', emoji: '🏠', label: 'Hostel / Budget Stay' },
  adventure: { color: '#ef4444', emoji: '🧗', label: 'Adventure Activity' }
};

const destinations = [
  {
    id: 1,
    name: "Goa",
    category: "Beach",
    lat: 15.2993,
    lon: 74.1240,
    season: "Oct - Mar",
    price: 8499,
    rating: 4.8,
    reviews: 1420,
    duration: "4 Days / 3 Nights",
    desc: "Golden palm beaches, vibrant nightlife, Portuguese colonial forts, and scenic coastal sunset cruises.",
    attractions: ["Baga Beach", "Fort Aguada", "Dudhsagar Falls", "Basilica of Bom Jesus"],
    img: destImg("goa.jpg")
  },
  {
    id: 2,
    name: "Manali",
    category: "Mountain",
    lat: 32.2432,
    lon: 77.1892,
    season: "Mar - Jun",
    price: 11200,
    rating: 4.9,
    reviews: 2180,
    duration: "5 Days / 4 Nights",
    desc: "A Himalayan paradise surrounded by pine forests, snow-capped peaks, Solang adventure valleys, and cozy riverside cafes.",
    attractions: ["Solang Valley", "Rohtang Pass", "Hadimba Temple", "Old Manali"],
    img: destImg("manali.jpg")
  },
  {
    id: 3,
    name: "Jaipur",
    category: "Heritage",
    lat: 26.9124,
    lon: 75.7873,
    season: "Oct - Mar",
    price: 7800,
    rating: 4.7,
    reviews: 1890,
    duration: "3 Days / 2 Nights",
    desc: "The royal Pink City of Rajasthan filled with majestic hilltop forts, intricate palaces, and vibrant cultural street bazaars.",
    attractions: ["Amber Fort", "Hawa Mahal", "City Palace", "Jal Mahal"],
    img: destImg("jaipur.jpg")
  },
  {
    id: 4,
    name: "Kerala Backwaters (Alleppey)",
    category: "Nature",
    lat: 9.4981,
    lon: 76.3388,
    season: "Oct - Mar",
    price: 12500,
    rating: 4.9,
    reviews: 980,
    duration: "4 Days / 3 Nights",
    desc: "Tranquil palm-fringed backwaters, luxury houseboat stays, traditional Ayurvedic wellness, and lush spice plantations.",
    attractions: ["Houseboat Cruise", "Alleppey Beach", "Kumarakom Bird Sanctuary", "Vembanad Lake"],
    img: destImg("kerala.jpg")
  },
  {
    id: 5,
    name: "Ladakh",
    category: "Mountain",
    lat: 34.1526,
    lon: 77.5771,
    season: "Jun - Sep",
    price: 18900,
    rating: 4.95,
    reviews: 1340,
    duration: "7 Days / 6 Nights",
    desc: "Dramatic high-altitude Tibetan mountain landscapes, crystal blue Pangong Lake, historic monasteries, and Nubra sand dunes.",
    attractions: ["Pangong Lake", "Nubra Valley", "Leh Palace", "Magnetic Hill"],
    img: destImg("ladakh.jpg")
  },
  {
    id: 6,
    name: "Rishikesh",
    category: "Adventure",
    lat: 30.0869,
    lon: 78.2676,
    season: "Oct - Mar",
    price: 6499,
    rating: 4.8,
    reviews: 1650,
    duration: "3 Days / 2 Nights",
    desc: "The world yoga and adventure capital nestled beside the holy Ganges — famous for river rafting, bungee jumping, and cliff camping.",
    attractions: ["Laxman Jhula", "River Rafting", "Triveni Ghat", "Neelkanth Mahadev Temple"],
    img: destImg("rishikesh.jpg")
  },
  {
    id: 7,
    name: "Andaman Islands",
    category: "Beach",
    lat: 11.7401,
    lon: 92.6586,
    season: "Oct - Mar",
    price: 16400,
    rating: 4.8,
    reviews: 1120,
    duration: "6 Days / 5 Nights",
    desc: "Turquoise lagoons, coral reefs, quiet island beaches, and unforgettable sunset cruises in the Bay of Bengal.",
    attractions: ["Radhanagar Beach", "Cellular Jail", "Ross Island", "Scuba Diving"],
    img: destImg("andaman.jpg")
  },
  {
    id: 8,
    name: "Shimla",
    category: "Mountain",
    lat: 31.1048,
    lon: 77.1734,
    season: "Mar - Jun",
    price: 9200,
    rating: 4.7,
    reviews: 1760,
    duration: "4 Days / 3 Nights",
    desc: "A charming Himalayan hill station with colonial streets, cedar forests, mountain views, and relaxed cafe culture.",
    attractions: ["The Ridge", "Mall Road", "Kufri", "Jakhu Temple"],
    img: destImg("shimla.jpg")
  },
  {
    id: 9,
    name: "Udaipur",
    category: "Heritage",
    lat: 24.5854,
    lon: 73.7125,
    season: "Oct - Mar",
    price: 8900,
    rating: 4.8,
    reviews: 1540,
    duration: "4 Days / 3 Nights",
    desc: "Romantic lakes, ornate palaces, colorful bazaars, and royal Rajasthani hospitality in the City of Lakes.",
    attractions: ["City Palace", "Lake Pichola", "Sajjangarh Palace", "Jag Mandir"],
    img: destImg("udaipur.jpg")
  },
  {
    id: 10,
    name: "Munnar",
    category: "Nature",
    lat: 10.0889,
    lon: 77.0595,
    season: "Jun - Sep",
    price: 10100,
    rating: 4.8,
    reviews: 1280,
    duration: "4 Days / 3 Nights",
    desc: "Rolling tea gardens, misty peaks, waterfalls, and cool green valleys make Munnar a peaceful highland escape.",
    attractions: ["Tea Museum", "Eravikulam National Park", "Mattupetty Dam", "Top Station"],
    img: destImg("munnar.jpg")
  },
  {
    id: 11,
    name: "Hampi",
    category: "Heritage",
    lat: 15.3350,
    lon: 76.4600,
    season: "Oct - Mar",
    price: 7200,
    rating: 4.7,
    reviews: 860,
    duration: "3 Days / 2 Nights",
    desc: "Ancient temple ruins, enormous boulders, and dramatic landscapes bring the legendary Vijayanagara Empire to life.",
    attractions: ["Virupaksha Temple", "Vittala Temple", "Matanga Hill", "Hampi Bazaar"],
    img: destImg("hampi.jpg")
  },
  {
    id: 12,
    name: "Jim Corbett",
    category: "Adventure",
    lat: 29.5300,
    lon: 78.7747,
    season: "Oct - Jun",
    price: 11800,
    rating: 4.6,
    reviews: 940,
    duration: "4 Days / 3 Nights",
    desc: "Wild forest safaris, riverside stays, and the chance to spot tigers and rare Himalayan wildlife in their natural habitat.",
    attractions: ["Jeep Safari", "Dhikala Zone", "Corbett Waterfall", "Sitabani Forest"],
    img: destImg("jimcorbett.jpg")
  }
];

let currentUser = null;
const SESSION_KEY = "stp_session";

let tripCart = [];
let activeCategory = 'all';
let plannerConfig = null;
let currentItinerary = [];
let savedPlans = [];
let activePlanId = null;
let activePlanFilter = 'all';

// Load trip cart from MySQL DB for logged-in user
async function loadCartFromDB() {
  if (!currentUser) { 
    tripCart = []; 
    updateCartUI();
    renderDestinations();
    return; 
  }
  try {
    const res = await fetch(`${API_BASE}/trips/${currentUser.id}`);
    const data = await res.json();
    if (data.success) {
      tripCart = data.trips.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        img: t.img,
        price: Number(t.price),
        duration: t.duration,
        rating: Number(t.rating)
      }));
    } else {
      tripCart = [];
    }
  } catch {
    tripCart = [];
  }
  updateCartUI();
  renderDestinations();
}

// ---------------- Navigation Tabs ----------------
document.querySelectorAll('#tabNav button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#tabNav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const target = document.getElementById(btn.dataset.tab);
    if (target) target.classList.add('active');

    if (btn.dataset.tab === 'mapweather') {
      renderMapDestStrip();
      // Use multiple staggered invalidateSize calls to ensure tiles render
      // after CSS transitions and layout paint
      setTimeout(() => {
        if (typeof L !== 'undefined') {
          if (!leafletMap) {
            // First time opening the map tab — panel is now visible, safe to init
            loadMapWeather();
            // Multiple invalidateSize calls to catch all timing issues
            [200, 500, 1000, 2000].forEach(delay => {
              setTimeout(() => {
                if (leafletMap) {
                  leafletMap.invalidateSize(true);
                }
              }, delay);
            });
          } else {
            // Map already initialised — fix tile rendering after CSS transition
            [100, 400, 800].forEach(delay => {
              setTimeout(() => {
                leafletMap.invalidateSize(true);
              }, delay);
            });
          }
        } else {
          console.error('Leaflet library (L) failed to load.');
          const loading = document.getElementById('weatherLoading');
          if (loading) loading.textContent = 'Map library is loading...';
        }
      }, 50);
    }

    // Scroll smoothly to top of main content
    document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
  });
});

// ---------------- Authentication State ----------------
function logoutUser() {
  // Wipe in-memory plan state BEFORE switching user so old plans never show
  savedPlans = [];
  activePlanId = null;
  updateSavedPlansUI();

  currentUser = null;
  localStorage.removeItem(SESSION_KEY);
  tripCart = [];
  updateCartUI();
  renderDestinations();
  renderAuthState();
  loadSavedPlansFromStorage(); // will load empty guest plans
  // Clear badge
  const badge = document.getElementById('cartCountBadge');
  if (badge) badge.textContent = '0';
}

function renderAuthState() {
  const headerLoginBtn = document.getElementById('headerLoginBtn');
  const headerRegisterBtn = document.getElementById('headerRegisterBtn');
  const headerUserView = document.getElementById('headerUserView');
  const headerUserName = document.getElementById('headerUserName');
  const loggedOutView = document.getElementById('loggedOutView');
  const loggedInView = document.getElementById('loggedInView');

  if (currentUser) {
    if (loggedOutView) loggedOutView.classList.add('hidden');
    if (loggedInView) loggedInView.classList.remove('hidden');
    
    const welcomeName = document.getElementById('welcomeName');
    const welcomeEmail = document.getElementById('welcomeEmail');
    const avatarInitial = document.getElementById('avatarInitial');
    
    if (welcomeName) welcomeName.textContent = "Welcome, " + currentUser.name + "!";
    if (welcomeEmail) welcomeEmail.textContent = currentUser.email;
    if (avatarInitial) avatarInitial.textContent = currentUser.name.charAt(0).toUpperCase();

    if (headerLoginBtn) headerLoginBtn.classList.add('hidden');
    if (headerRegisterBtn) headerRegisterBtn.classList.add('hidden');
    if (headerUserView) {
      headerUserView.classList.remove('hidden');
      headerUserName.textContent = currentUser.name;
    }
  } else {
    if (loggedOutView) loggedOutView.classList.remove('hidden');
    if (loggedInView) loggedInView.classList.add('hidden');

    if (headerLoginBtn) headerLoginBtn.classList.remove('hidden');
    if (headerRegisterBtn) headerRegisterBtn.classList.remove('hidden');
    if (headerUserView) headerUserView.classList.add('hidden');
  }
}

(function restoreSession(){
  const saved = localStorage.getItem(SESSION_KEY);
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
    } catch {
      currentUser = null;
    }
  }
  renderAuthState();
  loadCartFromDB(); // Load cart from MySQL
  loadSavedPlansFromStorage(); // Load saved trip plans from MySQL/LocalStorage
})();

// ---------------- Trip Cart Drawer Functionality ----------------
// (Cart is persisted to MySQL; localStorage is no longer the primary store)

function toggleCartDrawer() {
  if (!currentUser) {
    if (confirm("Please log in to view or manage your Trip Cart. Would you like to go to the login page now?")) {
      window.location.href = "login.html";
    }
    return;
  }
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  drawer.classList.toggle('open');
  overlay.classList.toggle('open');
}

function isInCart(destId) {
  if (!currentUser) return false;
  return tripCart.some(item => item.id === destId);
}

async function toggleTripCart(destId, event) {
  if (event) event.stopPropagation();

  // If user is not logged in, prompt and redirect to login page
  if (!currentUser) {
    alert("Please log in to add destinations to your Trip Cart!");
    window.location.href = "login.html";
    return;
  }

  const d = destinations.find(x => x.id === destId);
  if (!d) return;

  const idx = tripCart.findIndex(item => item.id === destId);
  const isRemoving = idx > -1;

  // Optimistically update UI
  if (isRemoving) {
    tripCart.splice(idx, 1);
  } else {
    tripCart.push(d);
  }
  updateCartUI();
  renderDestinations();

  // Persist to MySQL DB
  try {
    if (isRemoving) {
      await fetch(`${API_BASE}/trips/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, destinationId: destId })
      });
    } else {
      await fetch(`${API_BASE}/trips/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, destination: d })
      });
    }
  } catch (err) {
    console.error('Failed to sync trip cart with DB:', err);
  }
}


function updateCartUI() {
  const badge = document.getElementById('cartCountBadge');
  if (badge) badge.textContent = tripCart.length;

  // Update profile page stats
  const profileCartCount = document.getElementById('profileCartCount');
  if (profileCartCount) profileCartCount.textContent = tripCart.length;

  const profileCartStatus = document.getElementById('profileCartStatus');
  if (profileCartStatus) {
    profileCartStatus.textContent = tripCart.length === 0
      ? 'Your trip cart is empty — start exploring!'
      : `${tripCart.length} destination${tripCart.length === 1 ? '' : 's'} saved in your itinerary`;
  }

  // Render profile saved destinations list
  const savedList = document.getElementById('profileSavedList');
  if (savedList) {
    if (tripCart.length === 0) {
      savedList.innerHTML = `
        <div class="profile-saved-empty">
          <div style="font-size:36px; margin-bottom:8px;">🧳</div>
          <p>No destinations saved yet.<br>Click <strong>"+ Add to Trip"</strong> on any destination to get started.</p>
        </div>
      `;
    } else {
      savedList.innerHTML = tripCart.map(item => `
        <div class="profile-saved-item">
          <div class="profile-saved-thumb" style="background-image:url('${item.img}')"></div>
          <div class="profile-saved-info">
            <strong>${item.name}</strong>
            <span>₹${item.price.toLocaleString()} • ${item.duration || ''}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Render trip cart drawer
  const list = document.getElementById('cartItemsList');
  if (!list) return;

  if (tripCart.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; padding:40px 10px; color:var(--muted);">
        <div style="font-size:36px; margin-bottom:8px;">🎒</div>
        <p style="margin:0; font-weight:600;">Your trip cart is empty.</p>
        <p style="margin:4px 0 0; font-size:12px;">Browse destinations and click "Add to Trip" to build your itinerary.</p>
      </div>
    `;
    document.getElementById('cartTotalCost').textContent = '₹0';
    return;
  }

  let totalCost = 0;
  list.innerHTML = tripCart.map(item => {
    totalCost += item.price;
    return `
      <div class="cart-item" style="${item.status ? 'border: 2px solid #10b981; background: #f0fdf4;' : ''}">
        <div class="cart-item-thumb" style="background-image:url('${item.img}')"></div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <p>${item.duration || 'Custom Trip'} • ₹${item.price.toLocaleString()}</p>
          ${item.status ? `<div style="margin-top: 6px; font-size: 12px; font-weight: 700; color: #10b981;">✅ ${item.status}</div>` : ''}
          ${item.description ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.description}</div>` : ''}
        </div>
        ${!item.status ? `<button class="btn-close-drawer" style="background:#fee2e2; color:#ef4444; width:26px; height:26px;" onclick="toggleTripCart(${item.id})">✕</button>` : ''}
      </div>
    `;
  }).join('');

  document.getElementById('cartTotalCost').textContent = '₹' + totalCost.toLocaleString();
}


function proceedToBudgetWithCart() {
  toggleCartDrawer();
  syncBudgetFromCart();
  document.querySelector('[data-tab="budget"]').click();
}

function syncBudgetFromCart() {
  if (tripCart.length === 0) {
    alert("Please add at least one destination to your trip cart first!");
    return;
  }

  let totalEstimated = 0;
  tripCart.forEach(item => totalEstimated += item.price);

  // Set realistic category breakdown
  const hotel = Math.round(totalEstimated * 0.50);
  const transport = Math.round(totalEstimated * 0.30);
  const activities = Math.round(totalEstimated * 0.20);

  document.getElementById('totalBudget').value = totalEstimated;
  document.getElementById('expHotel').value = hotel;
  document.getElementById('expTransport').value = transport;
  document.getElementById('expActivities').value = activities;

  updateBudget();
}

// ---------------- Filtering & Search ----------------
function setCategoryFilter(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  filterDestinations();
}

function searchButtonAction() {
  document.querySelector('[data-tab="destinations"]').click();
  filterDestinations();
}

function filterDestinations() {
  const q = (document.getElementById('destSearch').value || '').toLowerCase().trim();
  const season = document.getElementById('seasonFilter').value;
  const maxPrice = parseFloat(document.getElementById('maxPriceFilter').value) || Infinity;

  const filtered = destinations.filter(d => {
    const matchesQuery = !q || d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    const matchesCategory = activeCategory === 'all' || d.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSeason = season === 'all' || d.season.toLowerCase().includes(season.toLowerCase());
    const matchesPrice = d.price <= maxPrice;

    return matchesQuery && matchesCategory && matchesSeason && matchesPrice;
  });

  renderDestinationsList(filtered);
}

function renderDestinationsList(list) {
  const container = document.getElementById('destList');
  const countBadge = document.getElementById('resultsCount');

  if (countBadge) countBadge.textContent = `${list.length} destination${list.length === 1 ? '' : 's'} found`;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:50px 20px; background:white; border-radius:12px; border:1px solid var(--border);">
        <div style="font-size:42px; margin-bottom:10px;">🔍</div>
        <h3 style="margin:0 0 6px; color:var(--primary);">No holiday packages matched your search</h3>
        <p style="margin:0; font-size:13.5px; color:var(--muted);">Try changing your keywords, season, or budget filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(d => {
    const inCart = isInCart(d.id);
    return `
      <div class="dest-card" style="cursor: pointer;" onclick="proceedToHotels(${d.id}, '${d.name.replace(/'/g, "\\'")}', ${d.price})">
        <div class="card-img-wrap">
          <img class="dest-img" src="${d.img}" alt="${d.name} destination">
          <span class="badge-category">${d.category}</span>
          <span class="badge-season">🗓️ ${d.season}</span>
        </div>
        <div class="dest-body">
          <div class="card-top-row">
            <h3 class="dest-name">${d.name}</h3>
            <div class="card-rating">★ ${d.rating} <span style="font-weight:400; color:var(--muted); font-size:11px;">(${d.reviews})</span></div>
          </div>
          <div style="font-size:11.5px; color:var(--blue); font-weight:700; margin-bottom:4px;">⏱️ ${d.duration}</div>
          <p class="dest-desc">${d.desc}</p>
          <div class="card-footer" style="flex-direction: column; align-items: stretch; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <div class="price-block">
                <span class="price-label">Starts at</span>
                <span class="price-amount">₹${d.price.toLocaleString()}</span>
              </div>
              <div style="display: flex; gap: 6px;">
                <button class="btn" style="padding: 6px 10px; font-size: 11px;" onclick="event.stopPropagation(); openDestDetail(${d.id})">ℹ️ Details</button>
                <button class="btn-add-trip ${inCart ? 'added' : ''}" onclick="toggleTripCart(${d.id}, event)">
                  ${inCart ? '✓ Added' : '+ Add'}
                </button>
              </div>
            </div>
            <button class="btn accent" style="width: 100%; padding: 10px 14px; font-weight: 700; font-size: 13.5px;" onclick="event.stopPropagation(); proceedToHotels(${d.id}, '${d.name.replace(/'/g, "\\'")}', ${d.price})">
              🏨 Select &amp; View Hotels in ${d.name} →
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderDestinations() {
  filterDestinations();
}

function openDestDetail(id) {
  const d = destinations.find(x => x.id === id);
  if (!d) return;

  document.getElementById('destList').parentElement.querySelector('.section-header').classList.add('hidden');
  document.getElementById('destList').parentElement.querySelector('.category-strip').classList.add('hidden');
  document.getElementById('destList').classList.add('hidden');
  
  const card = document.getElementById('destDetailCard');
  card.classList.remove('hidden');

  const inCart = isInCart(d.id);
  const detailActionSlot = document.getElementById('detailActionSlot');
  detailActionSlot.innerHTML = `
    <button class="btn ${inCart ? 'secondary' : 'accent'}" onclick="toggleTripCart(${d.id}); openDestDetail(${d.id});">
      ${inCart ? '✓ Remove from Trip Cart' : '🎒 Add to Trip Cart'}
    </button>
  `;

  document.getElementById('destDetailBody').innerHTML = `
    <div class="detail-hero" style="background-image:url('${d.img}')">
      <span class="badge-category" style="top:16px; left:16px; font-size:13px; padding:6px 14px;">${d.category}</span>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
      <div>
        <h2 style="margin:0 0 6px; font-size:26px; color:var(--primary);">${d.name}</h2>
        <div style="display:flex; align-items:center; gap:12px; font-size:14px;">
          <span style="color:#d97706; font-weight:700;">★ ${d.rating} (${d.reviews} traveler reviews)</span>
          <span style="color:var(--muted);">•</span>
          <span style="color:var(--primary); font-weight:600;">🗓️ Best Season: ${d.season}</span>
          <span style="color:var(--muted);">•</span>
          <span style="color:var(--blue); font-weight:700;">⏱️ ${d.duration}</span>
        </div>
      </div>
      <div style="text-align:right;">
        <span class="price-label">Estimated Starting Cost</span>
        <div style="font-size:28px; font-weight:800; color:var(--primary);">₹${d.price.toLocaleString()}</div>
      </div>
    </div>

    <p style="font-size:14.5px; line-height:1.6; color:#334155; margin:16px 0 20px;">${d.desc}</p>
    
    <h4 style="margin:16px 0 10px; color:var(--primary); font-size:16px;">🌟 Must-Visit Highlights & Attractions</h4>
    <div class="attraction-tags">
      ${d.attractions.map(a => `<span class="attraction-tag">📍 ${a}</span>`).join('')}
    </div>

    <div style="display:flex; gap:12px; margin-top:24px; flex-wrap:wrap;">
      <button class="btn accent" style="box-shadow: 0 4px 14px rgba(224, 86, 56, 0.4);" onclick="proceedToHotels(${d.id}, '${d.name.replace(/'/g, "\\'")}', ${d.price})">🏨 View Hotels in ${d.name}</button>
      <button class="btn" onclick="selectDestinationForMapWeather(${d.id})">🗺️ View on Map & Weather Forecast</button>
      <button class="btn secondary" onclick="planForDestination('${d.name}', ${d.price})">💰 Calculate Detailed Budget</button>
    </div>
  `;

  card.scrollIntoView({ behavior: 'smooth' });
}

function closeDestDetail() {
  document.getElementById('destDetailCard').classList.add('hidden');
  document.getElementById('destList').parentElement.querySelector('.section-header').classList.remove('hidden');
  document.getElementById('destList').parentElement.querySelector('.category-strip').classList.remove('hidden');
  document.getElementById('destList').classList.remove('hidden');
}

function selectDestinationForMapWeather(destId) {
  mwSelect.value = destId;
  // Click the nav tab — this triggers loadMapWeather() only after the panel is visible
  const mapTab = document.querySelector('[data-tab="mapweather"]');
  if (mapTab) {
    mapTab.click();
  } else {
    // Fallback: panel already visible
    loadMapWeather();
  }
}

function planForDestination(name, price) {
  document.getElementById('totalBudget').value = price;
  document.getElementById('expHotel').value = Math.round(price * 0.5);
  document.getElementById('expTransport').value = Math.round(price * 0.3);
  document.getElementById('expActivities').value = Math.round(price * 0.2);
  updateBudget();
  document.querySelector('[data-tab="budget"]').click();
}

// ---------------- MODULE 3: BUDGET TRACKER ----------------
function updateBudget() {
  const total = parseFloat(document.getElementById('totalBudget').value) || 0;
  const hotel = parseFloat(document.getElementById('expHotel').value) || 0;
  const transport = parseFloat(document.getElementById('expTransport').value) || 0;
  const activities = parseFloat(document.getElementById('expActivities').value) || 0;
  const spend = hotel + transport + activities;
  const balance = total - spend;

  document.getElementById('spendLabel').textContent = '₹' + spend.toLocaleString();
  document.getElementById('budgetLabel').textContent = '₹' + total.toLocaleString();

  const balanceLabel = document.getElementById('balanceLabel');
  const balanceText = document.getElementById('balanceText');
  if (balanceLabel) {
    balanceLabel.textContent = '₹' + Math.abs(balance).toLocaleString();
    balanceLabel.style.color = balance >= 0 ? '#34d399' : '#ef4444';
  }
  if (balanceText) {
    balanceText.textContent = balance >= 0 ? 'Remaining Balance' : 'Over Budget Amount';
  }

  const pct = total > 0 ? Math.min((spend / total) * 100, 100) : 0;
  const actualPct = total > 0 ? ((spend / total) * 100).toFixed(0) : 0;

  const fill = document.getElementById('budgetFill');
  fill.style.width = pct + '%';
  fill.className = 'budget-bar-fill' + (spend > total && total > 0 ? ' over' : '');

  const pctText = document.getElementById('budgetPctText');
  if (pctText) pctText.textContent = `${actualPct}% utilized`;

  const statusEl = document.getElementById('budgetStatus');
  if (total === 0) {
    statusEl.className = 'msg show';
    statusEl.textContent = '💡 Enter a target trip budget above to track your spending.';
  } else if (spend > total) {
    statusEl.className = 'msg show error';
    statusEl.textContent = `⚠️ Your selected trip is ₹${(spend - total).toLocaleString()} over your budget.`;
  } else {
    statusEl.className = 'msg show success';
    statusEl.textContent = `✓ Great planning! You are within your budget with ₹${(total - spend).toLocaleString()} left for spontaneous adventures.`;
  }

  const rows = [
    ['🏨 Accommodation (Hotels/Resorts & Food)', hotel],
    ['🚗 Transit & Flights', transport],
    ['🎟️ Sightseeing & Local Activities', activities],
  ];
  document.getElementById('budgetTableBody').innerHTML = rows.map(([cat, amt]) => `
    <tr>
      <td style="font-weight:600; color:var(--primary);">${cat}</td>
      <td style="font-weight:700;">₹${amt.toLocaleString()}</td>
      <td>
        <span style="background:#e0f2fe; color:#0369a1; padding:3px 8px; border-radius:12px; font-weight:700; font-size:12px;">
          ${total > 0 ? ((amt / total) * 100).toFixed(1) : 0}%
        </span>
      </td>
    </tr>
  `).join('');
}

// ---------------- MODULE 4: LEAFLET MAP & WEATHER ----------------
const mwSelect = document.getElementById('mwDestSelect');
mwSelect.innerHTML = destinations.map(d =>
  `<option value="${d.id}">${d.name} (${d.category})</option>`
).join('');

// Build the destination quick-pick strip
function renderMapDestStrip() {
  const strip = document.getElementById('mapDestStrip');
  if (!strip) return;
  strip.innerHTML = destinations.map(d => `
    <button class="map-dest-chip" id="chip-${d.id}" onclick="selectMapDest(${d.id})">
      <span class="chip-icon">${
        d.category === 'Beach' ? '🏖️' :
        d.category === 'Mountain' ? '🏔️' :
        d.category === 'Heritage' ? '🏰' :
        d.category === 'Nature' ? '🌿' :
        d.category === 'Adventure' ? '🧗' : '🌍'
      }</span>
      ${d.name}
    </button>
  `).join('');
}

function selectMapDest(id) {
  mwSelect.value = id;
  document.querySelectorAll('.map-dest-chip').forEach(c => c.classList.remove('active'));
  const chip = document.getElementById(`chip-${id}`);
  if (chip) chip.classList.add('active');
  loadMapWeather();
}

// Leaflet map instance
let leafletMap = null;
let leafletMarkers = [];
let poiMarkers = [];      // POI tourist place markers
let poiVisible = true;    // Toggle state for POI layer
let currentMapDestId = null;

function initLeafletMap(d) {
  if (!d) return;
  const lat = parseFloat(d.lat) || 15.2993;
  const lon = parseFloat(d.lon) || 74.1240;
  d.lat = lat;
  d.lon = lon;

  const mapContainer = document.getElementById('leafletMap');
  if (!mapContainer || typeof L === 'undefined') return;

  if (!leafletMap) {
    if (mapContainer._leaflet_id) {
      delete mapContainer._leaflet_id;
    }
    try {
      leafletMap = L.map('leafletMap', {
        center: [lat, lon],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Create a custom canvas tile layer that works 100% offline
      // Generates realistic, beautiful map-style tiles locally
      const CanvasTileLayer = L.GridLayer.extend({
        createTile: function(coords) {
          const tile = document.createElement('canvas');
          const size = this.getTileSize();
          tile.width = size.x;
          tile.height = size.y;
          const ctx = tile.getContext('2d');
          const z = coords.z;
          const tx = coords.x;
          const ty = coords.y;

          // Seed-based pseudo-random for consistent tile appearance
          const seed = tx * 1000003 + ty * 999983 + z * 997;
          const rng = (n) => (Math.sin(seed + n) * 0.5 + 0.5);

          // ── Land background gradient ──
          const grad = ctx.createLinearGradient(0, 0, size.x, size.y);
          grad.addColorStop(0, '#e9eff5');
          grad.addColorStop(1, '#dfe8f0');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, size.x, size.y);

          // ── Water bodies (rivers/lakes) ──
          const hasWater = rng(1) > 0.55;
          if (hasWater) {
            ctx.save();
            const wGrad = ctx.createLinearGradient(0, size.y * rng(2), size.x, size.y * rng(3));
            wGrad.addColorStop(0, '#b8d4e8');
            wGrad.addColorStop(1, '#c8dff0');
            ctx.fillStyle = wGrad;
            ctx.beginPath();
            const wy = size.y * (0.3 + rng(4) * 0.4);
            const wh = 12 + rng(5) * 30;
            ctx.moveTo(0, wy);
            ctx.bezierCurveTo(
              size.x * 0.3, wy - 15 + rng(6) * 30,
              size.x * 0.7, wy + 10 - rng(7) * 20,
              size.x, wy + rng(8) * 12
            );
            ctx.lineTo(size.x, wy + wh + rng(9) * 10);
            ctx.bezierCurveTo(
              size.x * 0.7, wy + wh + 15 - rng(10) * 25,
              size.x * 0.3, wy + wh - 10 + rng(11) * 15,
              0, wy + wh
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          // ── Green parks / vegetation patches ──
          const numParks = Math.floor(rng(12) * 3);
          for (let p = 0; p < numParks; p++) {
            const px = rng(13 + p * 7) * size.x;
            const py = rng(14 + p * 7) * size.y;
            const pw = 30 + rng(15 + p * 7) * 60;
            const ph = 20 + rng(16 + p * 7) * 40;
            ctx.save();
            ctx.fillStyle = `rgba(${180 + Math.floor(rng(17+p)*20)}, ${210 + Math.floor(rng(18+p)*20)}, ${170 + Math.floor(rng(19+p)*20)}, 0.7)`;
            ctx.beginPath();
            ctx.ellipse(px, py, pw / 2, ph / 2, rng(20 + p) * Math.PI, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // ── City blocks (beige/cream rectangles) ──
          if (z >= 10) {
            const blockCount = Math.floor(rng(21) * 5) + 3;
            for (let b = 0; b < blockCount; b++) {
              const bx = rng(22 + b * 5) * size.x;
              const by = rng(23 + b * 5) * size.y;
              const bw = 15 + rng(24 + b * 5) * 35;
              const bh = 10 + rng(25 + b * 5) * 25;
              ctx.fillStyle = `rgba(245, 238, 220, ${0.5 + rng(26 + b) * 0.4})`;
              ctx.fillRect(bx, by, bw, bh);
              ctx.strokeStyle = 'rgba(200, 185, 155, 0.6)';
              ctx.lineWidth = 0.5;
              ctx.strokeRect(bx, by, bw, bh);
            }
          }

          // ── Secondary roads (thin, light) ──
          const roadStep = Math.max(16, Math.floor(200 / Math.pow(1.5, Math.max(0, z - 8))));
          ctx.strokeStyle = 'rgba(255,255,255,0.75)';
          ctx.lineWidth = z > 11 ? 1.5 : 0.8;
          for (let x = roadStep / 2; x < size.x; x += roadStep) {
            ctx.beginPath();
            const bend = (rng(30 + x) - 0.5) * 20;
            ctx.moveTo(x + bend, 0);
            ctx.bezierCurveTo(x - bend * 0.5, size.y * 0.3, x + bend * 0.3, size.y * 0.7, x - bend, size.y);
            ctx.stroke();
          }
          for (let y = roadStep / 2; y < size.y; y += roadStep) {
            ctx.beginPath();
            const bend = (rng(31 + y) - 0.5) * 20;
            ctx.moveTo(0, y + bend);
            ctx.bezierCurveTo(size.x * 0.3, y - bend * 0.5, size.x * 0.7, y + bend * 0.3, size.x, y - bend);
            ctx.stroke();
          }

          // ── Major roads / highways (thicker, yellow-white) ──
          const majorStep = roadStep * 3;
          ctx.strokeStyle = 'rgba(255,245,200,0.9)';
          ctx.lineWidth = z > 11 ? 3 : 1.5;
          for (let x = majorStep; x < size.x; x += majorStep) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size.y);
            ctx.stroke();
          }
          for (let y = majorStep; y < size.y; y += majorStep) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size.x, y);
            ctx.stroke();
          }

          // ── Diagonal highway ──
          if (rng(32) > 0.6) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 235, 150, 0.85)';
            ctx.lineWidth = z > 11 ? 2.5 : 1.5;
            ctx.beginPath();
            ctx.moveTo(0, rng(33) * size.y);
            ctx.lineTo(size.x, rng(34) * size.y);
            ctx.stroke();
            ctx.restore();
          }

          // ── Subtle vignette to distinguish tiles ──
          const vGrad = ctx.createRadialGradient(
            size.x / 2, size.y / 2, size.x * 0.3,
            size.x / 2, size.y / 2, size.x * 0.8
          );
          vGrad.addColorStop(0, 'rgba(0,0,0,0)');
          vGrad.addColorStop(1, 'rgba(0,0,0,0.04)');
          ctx.fillStyle = vGrad;
          ctx.fillRect(0, 0, size.x, size.y);

          return tile;
        }
      });

      // Add the canvas tile layer (always works offline)
      new CanvasTileLayer({
        attribution: '🗺️ Smart Travel Planner — Interactive Map',
        tileSize: 256,
        minZoom: 1,
        maxZoom: 20
      }).addTo(leafletMap);

      // Also attempt to load OSM tiles on top (they'll appear if internet is available)
      const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        opacity: 0
      });
      osmLayer.addTo(leafletMap);
      // If OSM tiles load successfully, show them
      let osmTilesLoaded = 0;
      osmLayer.on('tileload', function() {
        osmTilesLoaded++;
        if (osmTilesLoaded === 1) {
          osmLayer.setOpacity(1);
        }
      });
    } catch (err) {
      console.warn('Map initialization warning:', err);
      return;
    }
  } else {
    leafletMap.setView([lat, lon], 11);
  }

  // Clear old markers
  leafletMarkers.forEach(m => leafletMap.removeLayer(m));
  leafletMarkers = [];

  // Custom styled marker
  const categoryColor = {
    'Beach': '#0ea5e9',
    'Mountain': '#6366f1',
    'Heritage': '#d97706',
    'Nature': '#10b981',
    'Adventure': '#ef4444'
  };
  const color = categoryColor[d.category] || '#008cff';

  const markerIcon = L.divIcon({
    className: '',
    html: `
      <div style="
        background:${color};
        width:44px; height:44px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 4px 14px rgba(0,0,0,0.3);
        display:flex; align-items:center; justify-content:center;
      ">
        <div style="transform:rotate(45deg); font-size:18px; margin-top:2px;">
          ${d.category === 'Beach' ? '🏖️' :
            d.category === 'Mountain' ? '🏔️' :
            d.category === 'Heritage' ? '🏰' :
            d.category === 'Nature' ? '🌿' :
            d.category === 'Adventure' ? '🧗' : '📍'}
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -48]
  });

  const marker = L.marker([d.lat, d.lon], { icon: markerIcon }).addTo(leafletMap);

  // Rich popup
  marker.bindPopup(`
    <div style="min-width:200px; font-family:'Plus Jakarta Sans',sans-serif;">
      <div style="background-image:url('${d.img}'); height:100px; background-size:cover; background-position:center; border-radius:8px 8px 0 0; margin:-12px -12px 10px;"></div>
      <strong style="font-size:15px; color:#0a2540;">${d.name}</strong>
      <div style="color:#64748b; font-size:12px; margin:4px 0;">${d.category} · ${d.season}</div>
      <div style="font-size:13px; color:#0a2540; font-weight:700;">⭐ ${d.rating} · ₹${d.price.toLocaleString()}</div>
      <div style="font-size:11.5px; color:#64748b; margin-top:6px; line-height:1.4;">${d.desc.substring(0,80)}...</div>
    </div>
  `, { maxWidth: 240 });

  leafletMarkers.push(marker);

  // Add tourist POI markers for this destination
  addPOIMarkersToMap(d.id);
}

// ---- Tourist POI Markers ----
function addPOIMarkersToMap(destId) {
  if (!leafletMap) return;
  // Remove existing POI markers
  poiMarkers.forEach(m => leafletMap.removeLayer(m));
  poiMarkers = [];

  const dest = destinations.find(x => x.id == destId);
  const baseLat = (dest && dest.lat) ? dest.lat : 15.2993;
  const baseLon = (dest && dest.lon) ? dest.lon : 74.1240;

  const pois = touristPOIs[destId] || [
    { name: (dest ? dest.name : 'Local') + " Center & Market", lat: baseLat + 0.012, lon: baseLon + 0.010, type: "market", desc: "Local shopping, souvenirs and authentic street cuisine." },
    { name: (dest ? dest.name : 'Scenic') + " Viewpoint & Ridge", lat: baseLat - 0.014, lon: baseLon - 0.011, type: "nature", desc: "Breathtaking panoramic scenic spot popular for photography." },
    { name: (dest ? dest.name : 'Heritage') + " Monument", lat: baseLat + 0.008, lon: baseLon - 0.016, type: "fort", desc: "Iconic historic attraction and cultural architecture." }
  ];

  pois.forEach(poi => {
    const cfg = POI_TYPE_CONFIG[poi.type] || { color: '#64748b', emoji: '📍', label: 'Place' };

    const poiIcon = L.divIcon({
      className: '',
      html: `
        <div style="
          position:relative;
          display:flex;
          flex-direction:column;
          align-items:center;
        ">
          <div style="
            background:${cfg.color};
            width:36px; height:36px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:2.5px solid white;
            box-shadow:0 3px 10px rgba(0,0,0,0.35);
            display:flex; align-items:center; justify-content:center;
          ">
            <span style="transform:rotate(45deg); font-size:15px;">${cfg.emoji}</span>
          </div>
          <div style="
            margin-top:3px;
            background:rgba(10,37,64,0.85);
            color:white;
            font-size:9px;
            font-weight:700;
            padding:2px 5px;
            border-radius:4px;
            white-space:nowrap;
            max-width:90px;
            overflow:hidden;
            text-overflow:ellipsis;
            font-family:'Plus Jakarta Sans',sans-serif;
            backdrop-filter:blur(4px);
          ">${poi.name}</div>
        </div>
      `,
      iconSize: [36, 56],
      iconAnchor: [18, 56],
      popupAnchor: [0, -60]
    });

    const m = L.marker([poi.lat, poi.lon], { icon: poiIcon });
    m.bindPopup(`
      <div style="min-width:210px; font-family:'Plus Jakarta Sans',sans-serif; padding:2px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <span style="
            background:${cfg.color}20;
            color:${cfg.color};
            font-size:20px;
            width:36px; height:36px;
            border-radius:50%;
            display:flex; align-items:center; justify-content:center;
            flex-shrink:0;
          ">${cfg.emoji}</span>
          <div>
            <div style="font-size:14px; font-weight:800; color:#0a2540; line-height:1.2;">${poi.name}</div>
            <span style="
              background:${cfg.color}20;
              color:${cfg.color};
              font-size:10px;
              font-weight:700;
              padding:2px 8px;
              border-radius:10px;
            ">${cfg.label}</span>
          </div>
        </div>
        <p style="margin:0; font-size:12px; color:#475569; line-height:1.5;">${poi.desc}</p>
      </div>
    `, { maxWidth: 250 });

    if (poiVisible) m.addTo(leafletMap);
    poiMarkers.push(m);
  });

  // Render/update legend and toggle button
  renderPOILegend(destId);

  // Render the places list panel below the map
  renderPlacesList(destId);

  // Keep the destination and all famous places inside the visible map area.
  const destination = destinations.find(item => item.id == destId);
  if (destination && leafletMap) {
    const points = [[destination.lat, destination.lon]];
    pois.forEach(p => { if (p.lat && p.lon) points.push([p.lat, p.lon]); });
    const bounds = L.latLngBounds(points);
    leafletMap.fitBounds(bounds, { padding: [36, 36], maxZoom: 12 });
  }
}

// Overview destination markers
let allDestMarkers = [];
function addAllMarkersToMap() {
  if (!leafletMap || typeof L === 'undefined') return;
  allDestMarkers.forEach(m => leafletMap.removeLayer(m));
  allDestMarkers = [];

  destinations.forEach(d => {
    if (currentMapDest && d.id === currentMapDest.id) return; // Don't duplicate main active destination marker
    const miniIcon = L.divIcon({
      className: '',
      html: `<div style="background:#0a2540;color:white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;" title="${d.name}">${d.name.charAt(0)}</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    const m = L.marker([d.lat, d.lon], { icon: miniIcon });
    m.bindTooltip(`<strong>${d.name}</strong><br><span style="font-size:11px; color:#64748b;">Click to view</span>`, { permanent: false, direction: 'top' });
    m.on('click', () => selectMapDest(d.id));
    m.addTo(leafletMap);
    allDestMarkers.push(m);
  });
}

function renderPOILegend(destId) {
  // Remove old legend if any
  const existingLegend = document.getElementById('poiLegend');
  if (existingLegend) existingLegend.remove();

  const pois = touristPOIs[destId];
  if (!pois) return;

  // Find unique POI types present
  const typesPresent = [...new Set(pois.map(p => p.type))];

  const container = document.getElementById('poiLegendContainer');
  if (!container) return;

  const div = document.createElement('div');
  div.id = 'poiLegend';
  div.style.cssText = `
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(12px);
    border-radius: 14px;
    padding: 14px 16px;
    box-shadow: 0 6px 28px rgba(0,0,0,0.12);
    font-family: 'Plus Jakarta Sans', sans-serif;
    border: 1.5px solid #e2e8f0;
  `;
  div.innerHTML = `
      <div style="font-size:12px; font-weight:800; color:#0a2540; text-transform:uppercase; letter-spacing:0.6px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between;">
        <span style="display:flex;align-items:center;gap:5px;">📍 Tourist Places</span>
        <button id="poiToggleBtn" onclick="togglePOILayer()" style="
          background: ${poiVisible ? 'linear-gradient(135deg,#0ea5e9,#6366f1)' : '#94a3b8'};
          color: white;
          border: none;
          border-radius: 20px;
          padding: 3px 11px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          letter-spacing:0.3px;
        ">${poiVisible ? '👁 Hide' : '👁 Show'}</button>
      </div>
      ${typesPresent.map(type => {
        const cfg = POI_TYPE_CONFIG[type] || { color: '#64748b', emoji: '📍', label: type };
        return `<div style="
          display:flex;
          align-items:center;
          gap:9px;
          margin:5px 0;
          padding:5px 8px;
          border-radius:8px;
          background:${cfg.color}0f;
          border-left:3px solid ${cfg.color};
        ">
          <span style="
            width:26px; height:26px;
            background:${cfg.color};
            border-radius:50%;
            display:flex; align-items:center; justify-content:center;
            font-size:14px;
            flex-shrink:0;
            box-shadow: 0 2px 6px ${cfg.color}55;
          ">${cfg.emoji}</span>
          <span style="font-weight:700; font-size:11.5px; color:#1e293b;">${cfg.label}</span>
        </div>`;
      }).join('')}
      <div style="margin-top:10px; padding-top:8px; border-top:1px solid #e2e8f0; font-size:10px; color:#94a3b8; display:flex; align-items:center; gap:4px;">
        <span style="width:6px;height:6px;background:#10b981;border-radius:50%;display:inline-block;"></span>
        ${pois.length} places mapped for this destination
      </div>
  `;
  container.appendChild(div);
}

function togglePOILayer() {
  poiVisible = !poiVisible;
  poiMarkers.forEach(m => {
    if (poiVisible) {
      m.addTo(leafletMap);
    } else {
      leafletMap.removeLayer(m);
    }
  });
  // Re-render legend to update button text/color
  const dest = destinations.find(x => x.id == mwSelect.value);
  if (dest) renderPOILegend(dest.id);
}

// Track currently selected dest for "Add to Cart" button
let currentMapDest = null;

// Route state
let routePolyline = null;       // current drawn polyline on map
let routeUserLat = null;        // cached user lat
let routeUserLon = null;        // cached user lon
let routeDistanceKm = 0;        // cached route distance
let routeBaseDurationMin = 0;   // cached car duration in minutes
let activeRouteMode = 'car';    // currently selected tab

// Vehicle config for route modes
const ROUTE_MODES = {
  car:   { label: 'Car',   emoji: '🚗', color: '#0ea5e9', multiplier: 1,    note: 'Fastest door-to-door route' },
  bike:  { label: 'Bike',  emoji: '🏍️', color: '#f59e0b', multiplier: 0.85, note: 'Slightly faster than car on highways' },
  bus:   { label: 'Bus',   emoji: '🚌', color: '#10b981', multiplier: 1.6,  note: 'Includes stops & layovers' },
  train: { label: 'Train', emoji: '🚂', color: '#6366f1', multiplier: 0.6,  note: 'Express rail — fastest for long distances' }
};

// ---- Places List Panel ----
function renderPlacesList(destId) {
  const dest = destinations.find(x => x.id == destId);
  const baseLat = (dest && dest.lat) ? dest.lat : 15.2993;
  const baseLon = (dest && dest.lon) ? dest.lon : 74.1240;

  const pois = touristPOIs[destId] || [
    { name: (dest ? dest.name : 'Local') + " Center & Market", lat: baseLat + 0.012, lon: baseLon + 0.010, type: "market", desc: "Local shopping, souvenirs and authentic street cuisine." },
    { name: (dest ? dest.name : 'Scenic') + " Viewpoint & Ridge", lat: baseLat - 0.014, lon: baseLon - 0.011, type: "nature", desc: "Breathtaking panoramic scenic spot popular for photography." },
    { name: (dest ? dest.name : 'Heritage') + " Monument", lat: baseLat + 0.008, lon: baseLon - 0.016, type: "fort", desc: "Iconic historic attraction and cultural architecture." }
  ];
  const listEl = document.getElementById('placesList');
  const countEl = document.getElementById('placesPanelCount');
  const destNameEl = document.getElementById('placesPanelDestName');

  if (destNameEl && dest) destNameEl.textContent = dest.name;

  if (!pois || !listEl) return;

  if (countEl) countEl.textContent = `${pois.length} places`;
  
  const getIdealTime = (type) => {
    switch(type) {
      case 'beach': return 'Ideal Time: 4:00 PM - 6:30 PM (Sunset)';
      case 'temple': return 'Ideal Time: 6:00 AM - 10:00 AM (Morning)';
      case 'market': return 'Ideal Time: 5:00 PM - 9:00 PM (Evening)';
      case 'nature': return 'Ideal Time: 7:00 AM - 11:00 AM (Morning)';
      case 'fort': return 'Ideal Time: 9:00 AM - 1:00 PM (Day)';
      case 'adventure': return 'Ideal Time: 10:00 AM - 3:00 PM (Day)';
      case 'hotel':
      case 'hostel': return 'Standard Check-in: 2:00 PM';
      default: return 'Ideal Time: Flexible';
    }
  };

  listEl.innerHTML = pois.map((poi, idx) => {
    const cfg = POI_TYPE_CONFIG[poi.type] || { color: '#64748b', emoji: '📍', label: 'Place' };
    const idealTime = getIdealTime(poi.type);
    
    return `
      <div class="place-card" onclick="focusOnPOI(${poi.lat}, ${poi.lon})" title="Click to zoom to this place on the map">
        <div class="place-card-icon" style="background:${cfg.color};">${cfg.emoji}</div>
        <div class="place-card-body">
          <div class="place-card-name">${poi.name}</div>
          <div class="place-card-meta">
            <span class="place-card-type" style="background:${cfg.color}18;color:${cfg.color};border:1px solid ${cfg.color}40;">${cfg.label}</span>
            <span style="font-size:11px; font-weight:600; color:var(--muted); margin-left:8px;">${idealTime}</span>
          </div>
          <div class="place-card-desc">${poi.desc}</div>
        </div>
        <div class="place-card-arrow">→</div>
      </div>
    `;
  }).join('');
}

function focusOnPOI(lat, lon) {
  if (leafletMap) {
    leafletMap.setView([lat, lon], 14, { animate: true });
    // Open matching POI marker popup
    poiMarkers.forEach(m => {
      const pos = m.getLatLng();
      if (Math.abs(pos.lat - lat) < 0.001 && Math.abs(pos.lng - lon) < 0.001) {
        m.openPopup();
      }
    });
  }
}

function loadMapWeather() {
  const d = destinations.find(x => x.id == mwSelect.value) || destinations[0];
  if (!d) return;

  const lat = parseFloat(d.lat) || 15.2993;
  const lon = parseFloat(d.lon) || 74.1240;
  d.lat = lat;
  d.lon = lon;

  currentMapDest = d;
  currentMapDestId = d.id;

  // Reset route state when destination changes
  routeUserLat = null; routeUserLon = null;
  routeBaseDurationMin = 0; routeDistanceKm = 0;
  Object.keys(ROUTE_MODES).forEach(mode => {
    const el = document.getElementById(`routeTime-${mode}`);
    if (el) el.textContent = '--';
  });
  const resultBox = document.getElementById('routeResultBox');
  if (resultBox) resultBox.classList.add('hidden');
  const goBtn = document.getElementById('routeGoBtn');
  if (goBtn) { goBtn.textContent = '📍 Show Routes from My Location'; goBtn.disabled = false; }

  // Highlight active chip
  document.querySelectorAll('.map-dest-chip').forEach(c => c.classList.remove('active'));
  const chip = document.getElementById(`chip-${d.id}`);
  if (chip) chip.classList.add('active');

  // Update Leaflet map
  initLeafletMap(d);

  // Invalidate map size after DOM settles so tiles render immediately
  setTimeout(() => {
    if (leafletMap) {
      leafletMap.invalidateSize();
    }
  }, 250);

  // Update destination info box
  const infoBox = document.getElementById('destInfoBox');
  const infoImg = document.getElementById('destInfoImg');
  const infoName = document.getElementById('destInfoName');
  const infoMeta = document.getElementById('destInfoMeta');
  if (infoBox) {
    infoBox.classList.remove('hidden');
    infoImg.style.backgroundImage = `url('${d.img}')`;
    infoName.textContent = d.name;
    infoMeta.innerHTML = `
      <span style="background:#eff6ff;color:#1e40af;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;">${d.category}</span>
      <span style="margin-left:6px;font-size:12px;color:#64748b;">⭐ ${d.rating} · ₹${d.price.toLocaleString()}</span>
      <div style="margin-top:4px;font-size:12px;color:#64748b;">🗓️ Best: ${d.season} · ${d.duration}</div>
    `;
  }

  // Fetch live weather
  document.getElementById('weatherLoading').classList.remove('hidden');
  document.getElementById('weatherContent').classList.add('hidden');
  document.getElementById('weatherError').classList.remove('show');

  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${d.lat}&longitude=${d.lon}&current=temperature_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,weather_code&timezone=auto&forecast_days=5`)
    .then(r => r.json())
    .then(data => {
      document.getElementById('weatherLoading').classList.add('hidden');
      document.getElementById('weatherContent').classList.remove('hidden');
      const wCodeMap = {
        0: 'Clear Sky ☀️', 1: 'Mainly Clear 🌤️', 2: 'Partly Cloudy ⛅',
        3: 'Overcast ☁️', 45: 'Misty Fog 🌫️', 51: 'Light Drizzle 🌦️',
        61: 'Light Rain 🌧️', 63: 'Moderate Rain 🌧️', 65: 'Heavy Rain ⛈️',
        71: 'Snow Flurries ❄️', 80: 'Passing Showers 🌦️', 95: 'Thunderstorm ⚡'
      };
      document.getElementById('wTemp').textContent = Math.round(data.current.temperature_2m) + '°C';
      document.getElementById('wCondition').textContent = wCodeMap[data.current.weather_code] || 'Mild & Pleasant';
      document.getElementById('wWind').textContent = 'Wind: ' + data.current.wind_speed_10m + ' km/h';

      const days = data.daily.time.map((t, i) => ({
        day: new Date(t).toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.round(data.daily.temperature_2m_max[i]),
        code: data.daily.weather_code[i]
      }));
      document.getElementById('wForecast').innerHTML = days.map(x => `
        <div style="background:#f8fafc; border:1px solid var(--border); border-radius:10px; padding:10px 14px; text-align:center; min-width:72px; flex-shrink:0;">
          <div style="font-size:11px; color:var(--muted); font-weight:600;">${x.day}</div>
          <div style="font-size:16px; margin:4px 0;">${wCodeMap[x.code]?.split(' ').pop() || '🌡️'}</div>
          <div style="font-size:14px; font-weight:800; color:var(--primary);">${x.temp}°C</div>
        </div>
      `).join('');
    })
    .catch(() => {
      document.getElementById('weatherLoading').classList.add('hidden');
      const err = document.getElementById('weatherError');
      err.classList.add('show');
      err.textContent = 'Could not load live weather data right now.';
    });
}

function addCurrentMapDestToCart() {
  if (currentMapDest) toggleTripCart(currentMapDest.id);
}

// ---- Route Drawing ----
function drawRouteOnMap(latlngs, color) {
  if (!leafletMap) return;
  // Remove old route
  if (routePolyline) { leafletMap.removeLayer(routePolyline); routePolyline = null; }
  // Draw new route with a glowing double-line effect
  L.polyline(latlngs, {
    color: 'white', weight: 8, opacity: 0.5
  }).addTo(leafletMap);
  routePolyline = L.polyline(latlngs, {
    color: color, weight: 5, opacity: 0.95,
    lineCap: 'round', lineJoin: 'round'
  }).addTo(leafletMap);
  leafletMap.fitBounds(routePolyline.getBounds(), { padding: [40, 40] });
}

function decodePolyline(encoded) {
  // Decode Google-style encoded polyline (used by OSRM)
  let index = 0, lat = 0, lng = 0;
  const coords = [];
  while (index < encoded.length) {
    let shift = 0, result = 0, b;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    coords.push([lat / 1e5, lng / 1e5]);
  }
  return coords;
}

function formatTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

async function calculateAllRoutes() {
  const errBox = document.getElementById('routeErrorBox');
  const resultBox = document.getElementById('routeResultBox');
  const goBtn = document.getElementById('routeGoBtn');
  errBox.textContent = '';
  errBox.classList.remove('show');
  resultBox.classList.add('hidden');

  if (!currentMapDest) {
    errBox.textContent = 'Please select a destination first.';
    errBox.classList.add('show');
    return;
  }

  if (!navigator.geolocation) {
    errBox.textContent = 'Geolocation is not supported by your browser.';
    errBox.classList.add('show');
    return;
  }

  if (navigator.permissions?.query) {
    const perm = await navigator.permissions.query({ name: 'geolocation' });
    if (perm.state === 'denied') {
      errBox.textContent = 'Location access blocked. Allow it in browser settings and try again.';
      errBox.classList.add('show');
      return;
    }
  }

  goBtn.textContent = '⏳ Getting your location...';
  goBtn.disabled = true;

  // Reset all tab times to loading
  Object.keys(ROUTE_MODES).forEach(mode => {
    const el = document.getElementById(`routeTime-${mode}`);
    if (el) el.textContent = '...';
  });

  navigator.geolocation.getCurrentPosition(async position => {
    routeUserLat = position.coords.latitude;
    routeUserLon = position.coords.longitude;
    const dest = currentMapDest;

    try {
      // Fetch route with full geometry (encoded polyline)
      const url = `https://router.project-osrm.org/route/v1/driving/${routeUserLon},${routeUserLat};${dest.lon},${dest.lat}?overview=full&geometries=polyline`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Route request failed');
      const data = await res.json();
      const route = data.routes?.[0];
      if (!route) throw new Error('No route found');

      routeDistanceKm = (route.distance / 1000).toFixed(1);
      routeBaseDurationMin = Math.round(route.duration / 60);
      const latlngs = decodePolyline(route.geometry);

      // Add user location marker
      if (routePolyline) leafletMap.removeLayer(routePolyline);
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="background:#ef4444;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(239,68,68,0.6);"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8]
      });
      L.marker([routeUserLat, routeUserLon], { icon: userIcon })
        .bindPopup('<b>📍 Your Location</b>')
        .addTo(leafletMap);

      // Fill time for each mode
      Object.entries(ROUTE_MODES).forEach(([mode, cfg]) => {
        const mins = Math.max(1, Math.round(routeBaseDurationMin * cfg.multiplier));
        const el = document.getElementById(`routeTime-${mode}`);
        if (el) el.textContent = formatTime(mins);
      });

      // Draw route for currently active tab
      showRouteForMode(activeRouteMode, latlngs);

      // Show summary card
      const carTime = formatTime(Math.round(routeBaseDurationMin));
      const trainTime = formatTime(Math.max(1, Math.round(routeBaseDurationMin * 0.6)));
      resultBox.classList.remove('hidden');
      document.getElementById('routeResultContent').innerHTML = `
        <div class="route-summary-card">
          <div class="route-summary-dest">
            <span style="font-size:20px;">📍</span>
            <div>
              <div style="font-weight:800;font-size:14px;color:#0a2540;">Route to ${dest.name}</div>
              <div style="font-size:12px;color:#64748b;">${routeDistanceKm} km total distance</div>
            </div>
          </div>
          <div class="route-summary-grid">
            ${Object.entries(ROUTE_MODES).map(([mode, cfg]) => {
              const mins = Math.max(1, Math.round(routeBaseDurationMin * cfg.multiplier));
              return `
                <div class="route-summary-item" onclick="showRouteForMode('${mode}')" style="border-left:3px solid ${cfg.color};">
                  <span style="font-size:18px;">${cfg.emoji}</span>
                  <div>
                    <div style="font-weight:800;color:#0a2540;font-size:13px;">${cfg.label}</div>
                    <div style="font-weight:700;color:${cfg.color};font-size:15px;">${formatTime(mins)}</div>
                    <div style="font-size:10px;color:#94a3b8;">${cfg.note}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div style="font-size:10px;color:#94a3b8;margin-top:8px;">Click a transport card or the tabs above to view that route on the map</div>
        </div>
      `;

      goBtn.textContent = '🔄 Recalculate Routes';
    } catch(e) {
      errBox.textContent = 'Could not calculate route. Check your internet connection and try again.';
      errBox.classList.add('show');
      Object.keys(ROUTE_MODES).forEach(mode => {
        const el = document.getElementById(`routeTime-${mode}`);
        if (el) el.textContent = '--';
      });
      goBtn.textContent = '📍 Show Routes from My Location';
    }
    goBtn.disabled = false;
  }, err => {
    errBox.textContent = err.code === 1
      ? 'Location permission denied. Allow location access and try again.'
      : 'Could not get your location right now.';
    errBox.classList.add('show');
    goBtn.textContent = '📍 Show Routes from My Location';
    goBtn.disabled = false;
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
}

function showRouteForMode(mode, precomputedLatLngs) {
  activeRouteMode = mode;

  // Update active tab styling
  document.querySelectorAll('.route-mode-tab').forEach(btn => btn.classList.remove('active'));
  const activeTab = document.getElementById(`routeTab-${mode}`);
  if (activeTab) activeTab.classList.add('active');

  const cfg = ROUTE_MODES[mode];
  if (!cfg) return;

  // If we already have computed route data, redraw
  if (precomputedLatLngs) {
    drawRouteOnMap(precomputedLatLngs, cfg.color);
  } else if (routeUserLat && routeBaseDurationMin > 0 && currentMapDest) {
    // Re-fetch and redraw
    const dest = currentMapDest;
    const url = `https://router.project-osrm.org/route/v1/driving/${routeUserLon},${routeUserLat};${dest.lon},${dest.lat}?overview=full&geometries=polyline`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const latlngs = decodePolyline(data.routes[0].geometry);
        drawRouteOnMap(latlngs, cfg.color);
      })
      .catch(() => {});
  } else {
    // No route calculated yet — prompt user
    const errBox = document.getElementById('routeErrorBox');
    errBox.textContent = 'Click "Show Routes from My Location" first to calculate the route.';
    errBox.classList.add('show');
    setTimeout(() => errBox.classList.remove('show'), 3000);
  }
}

// Add all destination markers to the map as a mini overview
function addAllMarkersToMap() {
  destinations.forEach(d => {
    const miniIcon = L.divIcon({
      className: '',
      html: `<div style="background:#0a2540;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${d.name.charAt(0)}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    const m = L.marker([d.lat, d.lon], { icon: miniIcon });
    m.bindTooltip(d.name, { permanent: false, direction: 'top' });
    m.on('click', () => selectMapDest(d.id));
    m.addTo(leafletMap);
  });
}

// ---------------- Booking Modal Logic ----------------
function openBookingModal() {
  if (tripCart.length === 0) {
    alert("Your trip cart is empty. Please add destinations before booking.");
    return;
  }
  document.getElementById('bookingModalOverlay').classList.remove('hidden');
  document.getElementById('bookingModal').classList.remove('hidden');
  toggleCartDrawer(); // Close the cart drawer if it's open
}

function closeBookingModal() {
  document.getElementById('bookingModalOverlay').classList.add('hidden');
  document.getElementById('bookingModal').classList.add('hidden');
}

async function handleBookingSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById('bookName').value;
  const email = document.getElementById('bookEmail')?.value || (currentUser && currentUser.email) || 'customer@example.com';
  const phone = document.getElementById('bookPhone').value;
  const address = document.getElementById('bookAddress').value;
  
  if (!name || !phone || !address) {
    alert("Please fill in all the details.");
    return;
  }

  const totalPaid = parseFloat(document.getElementById('totalBudget').value) || 0;
  const now = new Date();
  const receiptNo = 'STP-' + now.getFullYear() + ('0'+(now.getMonth()+1)).slice(-2) + ('0'+now.getDate()).slice(-2) + '-' + Math.floor(Math.random()*9000+1000);
  
  window._lastBookingReceiptNo = receiptNo;
  window._lastBookingEmail = email;

  // Add paid trip to cart
  const bookedTrip = {
    id: window.currentTrip.destId || Date.now(),
    name: window.currentTrip.destName || 'Custom Trip',
    price: totalPaid,
    status: 'Payment Completed (Pending Admin Review)',
    description: `Includes ${window.currentTrip.hotelName || 'Hotel'} & ${window.currentTrip.transportName || 'Transport'}`,
    img: destinations.find(d => d.id === window.currentTrip.destId)?.img || 'assets/goa.jpg'
  };
  
  tripCart.unshift(bookedTrip);
  updateCartUI();
  
  closeBookingModal();

  // Send booking to database & trigger customer email
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser ? currentUser.id : null,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerAddress: address,
        destinationId: window.currentTrip.destId || 1,
        destinationName: window.currentTrip.destName || 'Goa',
        hotelName: window.currentTrip.hotelName || 'Selected Hotel',
        hotelPrice: window.currentTrip.hotelPrice || 0,
        transportName: window.currentTrip.transportName || 'Selected Transit',
        transportPrice: window.currentTrip.transportPrice || 0,
        totalPrice: totalPaid,
        receiptNo: receiptNo
      })
    });
    const data = await res.json();
    if (data.success) {
      alert(`🎉 Trip Plan Successfully Submitted!\n\n📨 A confirmation email notification has been dispatched to ${email}.\nYour trip is now awaiting Admin review and approval in the Admin Portal.`);
    }
  } catch (err) {
    console.warn('Booking API offline fallback:', err);
  }

  // Stay on budget tab and show the receipt
  document.querySelector('[data-tab="budget"]').click();
  setTimeout(() => {
    generateTripReceipt();
  }, 300);
}

async function fetchAdminCustomDestinations() {
  try {
    const res = await fetch(`${API_BASE}/admin/destinations`);
    const data = await res.json();
    if (data.success && data.destinations && data.destinations.length > 0) {
      data.destinations.forEach(cd => {
        if (!destinations.some(d => d.name.toLowerCase() === cd.name.toLowerCase())) {
          let lat = parseFloat(cd.lat);
          let lon = parseFloat(cd.lon);
          if (isNaN(lat) || isNaN(lon)) {
            const lower = cd.name.toLowerCase();
            if (lower.includes('ooty')) { lat = 11.4102; lon = 76.6950; }
            else if (lower.includes('agra')) { lat = 27.1767; lon = 78.0081; }
            else if (lower.includes('varanasi')) { lat = 25.3176; lon = 82.9739; }
            else if (lower.includes('darjeeling')) { lat = 27.0410; lon = 88.2663; }
            else if (lower.includes('coorg')) { lat = 12.3375; lon = 75.8069; }
            else { lat = 20.5937; lon = 78.9629; }
          }

          destinations.unshift({
            id: cd.id,
            name: cd.name,
            category: cd.category,
            season: cd.season,
            price: cd.price,
            duration: cd.duration,
            lat: lat,
            lon: lon,
            rating: parseFloat(cd.rating) || 4.8,
            reviews: cd.reviews || 120,
            desc: cd.description || 'Exclusive custom travel package designed by our travel planners.',
            attractions: cd.attractions ? cd.attractions.split(',').map(s => s.trim()) : [cd.name + ' Highlights'],
            img: cd.image_url || 'assets/goa.jpg'
          });
        }
      });
      renderDestinations();
      if (mwSelect) {
        mwSelect.innerHTML = destinations.map(d =>
          `<option value="${d.id}">${d.name} (${d.category})</option>`
        ).join('');
      }
      renderMapDestStrip();
    }
  } catch (err) {
    console.warn('Failed to load admin custom destinations:', err);
  }
}

// ---------------- App Initializer ----------------
document.addEventListener('DOMContentLoaded', () => {
  renderDestinations();
  fetchAdminCustomDestinations();
  renderMapDestStrip();
  updateCartUI();
  updateBudget();
  renderTransportList();
  
  if (typeof L === 'undefined') {
    console.error('Leaflet library (L) failed to load from CDN.');
  }
});

// ---------------- MODULE 5: HOTELS ----------------
const hotelsData = [];

// Extract hotels from touristPOIs to populate hotelsData
const realHotelImages = {
  hotel: ['assets/hotel_premium.jpg?v=2', 'assets/hotel_heritage.jpg?v=2'],
  hostel: ['assets/hostel_vibe.jpg?v=2']
};

Object.keys(touristPOIs).forEach(destId => {
  const destHotels = touristPOIs[destId].filter(poi => poi.type === 'hotel' || poi.type === 'hostel');
  const destName = destinations.find(d => d.id == destId)?.name || '';
  
  const transports = ['Local Bus Stand (2km)', 'Railway Station (5km)', 'Airport (15km)', 'Taxi Stand (1km)'];
  
  destHotels.forEach((hotel, idx) => {
    let imgPool = realHotelImages[hotel.type] || realHotelImages.hotel;
    hotelsData.push({
      id: `hotel_${destId}_${Math.random().toString(36).substr(2, 9)}`,
      destId: Number(destId),
      name: hotel.name,
      destination: destName,
      type: hotel.type,
      desc: hotel.desc,
      lat: hotel.lat,
      lon: hotel.lon,
      price: Math.floor(Math.random() * (15000 - 1500) + 1500),
      rating: (Math.random() * (5 - 3.5) + 3.5).toFixed(1),
      img: imgPool[idx % imgPool.length],
      transport: transports[idx % transports.length]
    });
  });
});

function filterHotels() {
  const destSearch = (document.getElementById('hotelDestSearch').value || '').toLowerCase().trim();
  const checkIn = document.getElementById('hotelCheckIn').value;
  const checkOut = document.getElementById('hotelCheckOut').value;
  
  // Basic validation for dates
  if (checkIn && checkOut && new Date(checkIn) >= new Date(checkOut)) {
    console.log("Check-out date must be after Check-in date");
  }

  const filtered = hotelsData.filter(h => {
    const matchesDest = !destSearch || h.destination.toLowerCase().includes(destSearch) || h.name.toLowerCase().includes(destSearch);
    return matchesDest;
  });

  renderHotelsList(filtered);
}

function renderHotelsList(list) {
  const container = document.getElementById('hotelList');
  const countBadge = document.getElementById('hotelResultsCount');

  if (countBadge) countBadge.textContent = `${list.length} hotel${list.length === 1 ? '' : 's'} found`;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding:50px 20px; background:white; border-radius:12px; border:1px solid var(--border);">
        <div style="font-size:42px; margin-bottom:10px;">🏨</div>
        <h3 style="margin:0 0 6px; color:var(--primary);">No hotels matched your search</h3>
        <p style="margin:0; font-size:13.5px; color:var(--muted);">Try changing your destination or clear search filters.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(h => `
    <div class="dest-card" style="cursor: pointer;" onclick="proceedToTransport('${h.name.replace(/'/g, "\\'")}', ${h.price}, ${h.destId}, '${h.destination.replace(/'/g, "\\'")}')">
      <div class="card-img-wrap">
        <img class="dest-img" src="${h.img}" alt="${h.name}">
        <span class="badge-category">${h.type === 'hotel' ? 'Hotel' : 'Hostel'}</span>
      </div>
      <div class="dest-body">
        <div class="card-top-row">
          <h3 class="dest-name">${h.name}</h3>
          <div class="card-rating">★ ${h.rating}</div>
        </div>
        <div style="font-size:12px; color:var(--muted); font-weight:700; margin-bottom:4px;">📍 ${h.destination}</div>
        <div style="font-size:11px; color:#10b981; font-weight:700; margin-bottom:8px;">🚍 Nearby: ${h.transport}</div>
        <p class="dest-desc">${h.desc}</p>
        <div class="card-footer" style="flex-direction: column; align-items: stretch;">
          <div style="font-size: 18px; font-weight: 800; color: var(--primary); margin-bottom: 12px;">
            ₹${h.price.toLocaleString()} <span style="font-size: 12px; color: var(--muted); font-weight: 600;">/ total stay</span>
          </div>
          <div class="card-actions" style="display:flex; gap:8px; width: 100%;">
            <button class="btn accent" style="padding: 12px 14px; width: 100%; font-weight: 700;" onclick="event.stopPropagation(); proceedToTransport('${h.name.replace(/'/g, "\\'")}', ${h.price}, ${h.destId}, '${h.destination.replace(/'/g, "\\'")}')">
              Select &amp; Choose Transport →
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

function bookHotel(hotelName, price) {
  // Open the UPI payment modal for this hotel
  document.getElementById('bookingModalOverlay').classList.remove('hidden');
  const modal = document.getElementById('bookingModal');
  modal.classList.remove('hidden');
  
  // Optionally update modal text to show what is being booked
  const headerText = modal.querySelector('h3');
  if (headerText) {
    headerText.textContent = `Book ${hotelName} (₹${price.toLocaleString()})`;
  }
}

function addHotelToBudget(hotelPrice, hotelName) {
  // Assume a 3-night stay by default for the budget
  const stayCost = hotelPrice * 3;
  
  const currentTotal = parseFloat(document.getElementById('totalBudget').value) || 0;
  const currentHotelExp = parseFloat(document.getElementById('expHotel').value) || 0;
  
  document.getElementById('expHotel').value = currentHotelExp + stayCost;
  document.getElementById('totalBudget').value = currentTotal + stayCost;
  
  updateBudget();
  
  // Navigate to budget tab
  document.querySelector('[data-tab="budget"]').click();
  alert(`Added ₹${stayCost.toLocaleString()} (3 nights at ${hotelName}) to your Hotel & Stay expenses in the Budget Planner.`);
}

window.currentTrip = {
  destId: null,
  destName: '',
  destPrice: 0,
  hotelName: '',
  hotelPrice: 0,
  transportName: '',
  transportPrice: 0
};

// ---------------- Booking Flow Progress Stepper ----------------
function renderBookingProgress(activeStep) {
  // activeStep: 1=Destination, 2=Hotels, 3=Transport, 4=Budget
  const steps = [
    { n: 1, label: 'Destination', icon: '✈️', tab: 'destinations' },
    { n: 2, label: 'Hotels',      icon: '🏨', tab: 'hotels' },
    { n: 3, label: 'Transport',   icon: '🚗', tab: 'transport' },
    { n: 4, label: 'Budget',      icon: '💰', tab: 'budget' }
  ];

  const html = `
    <div class="booking-progress">
      <div class="booking-progress-inner">
        ${steps.map((s, i) => {
          const isDone   = s.n < activeStep;
          const isActive = s.n === activeStep;
          const cls = isDone ? 'step done' : isActive ? 'step active' : 'step';
          return `
            <div class="${cls}">
              <div class="step-circle" ${isDone || isActive ? `onclick="switchToStep('${s.tab}')"` : ''}>
                ${isDone ? '✓' : s.icon}
              </div>
              <span class="step-label">${s.label}</span>
            </div>
            ${i < steps.length - 1 ? `<div class="step-connector ${isDone ? 'done' : ''}"></div>` : ''}
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Inject into any section that is currently active
  ['destinations','hotels','transport','budget'].forEach(id => {
    const sec = document.getElementById(id);
    if (!sec) return;
    const existing = sec.querySelector('.booking-progress');
    if (existing) existing.remove();
  });

  const activeSection = document.getElementById(steps[activeStep-1].tab);
  if (activeSection) {
    activeSection.insertAdjacentHTML('afterbegin', html);
  }
}

function switchToStep(tabId) {
  const btn = document.querySelector(`[data-tab="${tabId}"]`);
  if (btn) btn.click();
}

function proceedToHotels(destId, destName, destPrice) {
  window.currentTrip.destId = destId;
  window.currentTrip.destName = destName;
  window.currentTrip.destPrice = destPrice;
  
  const searchInput = document.getElementById('hotelDestSearch');
  if (searchInput) {
    searchInput.value = destName;
  }
  
  filterHotels();
  document.querySelector('[data-tab="hotels"]').click();
  setTimeout(() => renderBookingProgress(2), 50);
}

function proceedToTransport(hotelName, hotelPrice, destId, destName) {
  // Update trip context from hotel card arguments
  window.currentTrip.hotelName = hotelName;
  window.currentTrip.hotelPrice = hotelPrice;
  if (destId)  window.currentTrip.destId   = destId;
  if (destName) window.currentTrip.destName = destName;

  renderTransportList();
  document.querySelector('[data-tab="transport"]').click();
  setTimeout(() => renderBookingProgress(3), 50);
}

const transportOptions = [
  { name: 'Premium Flight', price: 6500, icon: '✈️', desc: 'Fastest way to reach. Includes standard baggage.' },
  { name: 'Express Train', price: 1800, icon: '🚂', desc: 'Comfortable AC sleeper class. Scenic route.' },
  { name: 'Luxury AC Sleeper Bus', price: 2200, icon: '🚌', desc: 'Overnight journey with reclining seats and blankets.' },
  { name: 'Private Outstation Cab', price: 8500, icon: '🚕', desc: 'Door-to-door pickup and drop off in an SUV.' }
];

function renderTransportList() {
  const container = document.getElementById('transportList');
  if (!container) return;
  
  const destName = window.currentTrip.destName || 'your destination';
  
  const destId = window.currentTrip.destId || 1;

  // Base options with local assets
  let dynamicTransportOptions = [
    { type: 'flight', name: `Flight to ${destName}`, price: 6500, icon: '✈️', desc: `Fastest way to reach ${destName}. Includes standard baggage.`, img: 'assets/flight.jpg?v=2' },
    { type: 'train', name: `Express Train to ${destName}`, price: 1800, icon: '🚂', desc: `Comfortable AC sleeper class journey to ${destName}.`, img: 'assets/train.jpg?v=2' },
    { type: 'bus', name: `Luxury Bus to ${destName}`, price: 2200, icon: '🚌', desc: `Overnight journey to ${destName} with reclining seats.`, img: 'assets/bus.jpg?v=2' },
    { type: 'cab', name: `Private Cab to ${destName}`, price: 8500, icon: '🚕', desc: `Door-to-door pickup and drop off to ${destName}.`, img: 'assets/cab.jpg?v=2' }
  ];

  // Filter based on destination id
  if (destId === 2 || destId === 10 || destId === 11 || destId === 12) { // Manali, Munnar, Hampi, Jim Corbett (No flight)
      dynamicTransportOptions = dynamicTransportOptions.filter(t => t.type !== 'flight');
  }
  if (destId === 2 || destId === 5 || destId === 7 || destId === 10) { // Manali, Ladakh, Andaman, Munnar (No train)
      dynamicTransportOptions = dynamicTransportOptions.filter(t => t.type !== 'train');
  }
  if (destId === 7) { // Andaman Islands (No bus from mainland)
      dynamicTransportOptions = dynamicTransportOptions.filter(t => t.type !== 'bus');
  }

  container.innerHTML = dynamicTransportOptions.map(t => `
    <div class="dest-card transport-card" id="tcard-${t.type}" style="cursor: pointer;" onclick="proceedToBudget('${t.name.replace(/'/g, "\\'")}', ${t.price})">
      <div class="transport-selected-badge">✓ Selected</div>
      <img src="${t.img}" alt="${t.name}" style="width: 100%; height: 200px; object-fit: cover; border-top-left-radius: 16px; border-top-right-radius: 16px;">
      <div class="dest-body" style="text-align: center; padding: 20px;">
        <div style="font-size: 32px; margin-bottom: 8px;">${t.icon}</div>
        <h3 class="dest-name" style="margin-bottom: 8px;">${t.name}</h3>
        <p class="dest-desc" style="margin-bottom: 15px;">${t.desc}</p>
        <div style="font-size: 20px; font-weight: 800; color: var(--primary); margin-bottom: 15px;">₹${t.price.toLocaleString()}</div>
        <button class="btn accent" style="width: 100%; padding: 12px; font-weight: 700;" onclick="event.stopPropagation(); proceedToBudget('${t.name.replace(/'/g, "\\'")}', ${t.price})">
          🎯 Book This &amp; View Budget →
        </button>
      </div>
    </div>
  `).join('');
}

function selectTransportCard(cardEl, transportName, transportPrice) {
  // Visual selection highlight
  document.querySelectorAll('.transport-card').forEach(c => c.classList.remove('selected'));
  cardEl.classList.add('selected');
}

function proceedToBudget(transportName, transportPrice) {
  window.currentTrip.transportName = transportName;
  window.currentTrip.transportPrice = transportPrice;

  // Pre-fill budget tracker with all the selections
  const dest       = destinations.find(d => d.id === window.currentTrip.destId);
  const destPrice  = window.currentTrip.destPrice  || (dest ? dest.price : 0);
  const hotelPrice = window.currentTrip.hotelPrice  || 0;
  const transPrice = transportPrice || 0;
  const activitiesEst = Math.round(destPrice * 0.15); // 15% for activities
  const totalBudget = hotelPrice + transPrice + activitiesEst + Math.round(destPrice * 0.10); // + 10% buffer

  document.getElementById('totalBudget').value    = totalBudget;
  document.getElementById('expHotel').value       = hotelPrice;
  document.getElementById('expTransport').value   = transPrice;
  document.getElementById('expActivities').value  = activitiesEst;

  // Show the budget selection summary header
  renderBudgetSelectionSummary();

  // Show confirm button
  const confirmContainer = document.getElementById('budgetConfirmBtnContainer');
  if (confirmContainer) confirmContainer.classList.remove('hidden');
  const paymentIndicator = document.getElementById('paymentMethodIndicator');
  if (paymentIndicator) paymentIndicator.classList.remove('hidden');

  updateBudget();
  document.querySelector('[data-tab="budget"]').click();
  setTimeout(() => renderBookingProgress(4), 50);
}

function renderBudgetSelectionSummary() {
  const trip = window.currentTrip;
  if (!trip.destName) return;

  const dest = destinations.find(d => d.id === trip.destId);

  let existing = document.getElementById('budgetTripSummary');
  if (!existing) {
    existing = document.createElement('div');
    existing.id = 'budgetTripSummary';
    const budgetDash = document.querySelector('.budget-dashboard');
    if (budgetDash) budgetDash.insertBefore(existing, budgetDash.firstChild.nextSibling);
  }

  existing.innerHTML = `
    <div class="trip-summary-banner">
      <div class="trip-summary-title">🎯 Your Trip Selection Summary</div>
      <div class="trip-summary-grid">
        <div class="trip-summary-item">
          <span class="trip-summary-icon">✈️</span>
          <div>
            <div class="trip-summary-label">Destination</div>
            <div class="trip-summary-value">${trip.destName}</div>
            ${dest ? `<div class="trip-summary-sub">${dest.duration} · ${dest.season}</div>` : ''}
          </div>
        </div>
        <div class="trip-summary-item">
          <span class="trip-summary-icon">🏨</span>
          <div>
            <div class="trip-summary-label">Hotel / Stay</div>
            <div class="trip-summary-value">${trip.hotelName || 'Not selected'}</div>
            ${trip.hotelPrice ? `<div class="trip-summary-sub">₹${trip.hotelPrice.toLocaleString()} / stay</div>` : ''}
          </div>
        </div>
        <div class="trip-summary-item">
          <span class="trip-summary-icon">🚗</span>
          <div>
            <div class="trip-summary-label">Transport</div>
            <div class="trip-summary-value">${trip.transportName || 'Not selected'}</div>
            ${trip.transportPrice ? `<div class="trip-summary-sub">₹${trip.transportPrice.toLocaleString()}</div>` : ''}
          </div>
        </div>
        <div class="trip-summary-item">
          <span class="trip-summary-icon">💰</span>
          <div>
            <div class="trip-summary-label">Total Cost</div>
            <div class="trip-summary-value" style="color:#10b981;">₹${((trip.hotelPrice||0)+(trip.transportPrice||0)+Math.round((trip.destPrice||0)*0.15)).toLocaleString()}</div>
            <div class="trip-summary-sub">excl. buffer</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Keep legacy proceedToPlanTrip for backward compatibility (e.g. from itinerary)
function proceedToPlanTrip(transportName, transportPrice) {
  proceedToBudget(transportName, transportPrice);
}

function confirmAndPayTrip() {
  const total = parseFloat(document.getElementById('totalBudget').value) || 0;
  const tripTitle = window.currentTrip.destName ? `Trip to ${window.currentTrip.destName}` : 'Your Custom Trip';

  // Open booking modal
  document.getElementById('bookingModalOverlay').classList.remove('hidden');
  const modal = document.getElementById('bookingModal');
  modal.classList.remove('hidden');

  const headerText = modal.querySelector('h3');
  if (headerText) {
    headerText.textContent = `✅ Confirm & Pay for ${tripTitle} (₹${Number(total).toLocaleString()})`;
  }

  // Store total for receipt
  window._pendingPaymentTotal = total;
}

function generateTripReceipt() {
  const trip = window.currentTrip;
  const total = window._pendingPaymentTotal || parseFloat(document.getElementById('totalBudget').value) || 0;
  const now = new Date();
  const receiptNo = window._lastBookingReceiptNo || ('STP-' + now.getFullYear() + ('0'+(now.getMonth()+1)).slice(-2) + ('0'+now.getDate()).slice(-2) + '-' + Math.floor(Math.random()*9000+1000));
  const dateStr = now.toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
  const dest = destinations.find(d => d.id === trip.destId);

  const receiptContainer = document.getElementById('tripReceiptContainer');
  if (!receiptContainer) return;

  receiptContainer.classList.remove('hidden');
  receiptContainer.innerHTML = `
    <div class="trip-receipt" id="tripReceiptCard">
      <div class="receipt-header">
        <div class="receipt-brand">
          <span style="font-size:28px;">🧭</span>
          <div>
            <div class="receipt-brand-name">Smart Travel Planner</div>
            <div class="receipt-brand-sub">Official Trip Booking Receipt</div>
          </div>
        </div>
        <div class="receipt-no-block">
          <div class="receipt-label">Receipt No.</div>
          <div class="receipt-no">${receiptNo}</div>
          <div class="receipt-date">${dateStr}</div>
        </div>
      </div>

      <div class="receipt-status-badge">✅ PAYMENT CONFIRMED</div>

      <div class="receipt-section">
        <div class="receipt-section-title">📍 Trip Details</div>
        <div class="receipt-row">
          <span>Destination</span>
          <span><strong>${trip.destName || '—'}</strong></span>
        </div>
        ${dest ? `
        <div class="receipt-row">
          <span>Duration</span>
          <span>${dest.duration}</span>
        </div>
        <div class="receipt-row">
          <span>Best Season</span>
          <span>${dest.season}</span>
        </div>` : ''}
      </div>

      <div class="receipt-section">
        <div class="receipt-section-title">🏨 Hotel &amp; Stay</div>
        <div class="receipt-row">
          <span>Hotel Name</span>
          <span><strong>${trip.hotelName || '—'}</strong></span>
        </div>
        <div class="receipt-row">
          <span>Stay Cost</span>
          <span>₹${(trip.hotelPrice || 0).toLocaleString()}</span>
        </div>
      </div>

      <div class="receipt-section">
        <div class="receipt-section-title">🚗 Transport</div>
        <div class="receipt-row">
          <span>Mode</span>
          <span><strong>${trip.transportName || '—'}</strong></span>
        </div>
        <div class="receipt-row">
          <span>Transport Cost</span>
          <span>₹${(trip.transportPrice || 0).toLocaleString()}</span>
        </div>
      </div>

      <div class="receipt-section">
        <div class="receipt-section-title">💰 Cost Breakdown</div>
        <div class="receipt-row">
          <span>🏨 Hotel &amp; Stay</span>
          <span>₹${(parseFloat(document.getElementById('expHotel').value)||0).toLocaleString()}</span>
        </div>
        <div class="receipt-row">
          <span>🚗 Transport</span>
          <span>₹${(parseFloat(document.getElementById('expTransport').value)||0).toLocaleString()}</span>
        </div>
        <div class="receipt-row">
          <span>🎟️ Activities &amp; Entry</span>
          <span>₹${(parseFloat(document.getElementById('expActivities').value)||0).toLocaleString()}</span>
        </div>
        <div class="receipt-row receipt-total-row">
          <span>TOTAL PAID</span>
          <span>₹${total.toLocaleString()}</span>
        </div>
      </div>

      <div class="receipt-footer">
        <div class="receipt-upi">
          <span>💳 Paid via UPI</span>
          <span>akashakas723@okaxis</span>
        </div>
        <div class="receipt-thankyou">Thank you for booking with Smart Travel Planner! 🌟</div>
        <div class="receipt-note">This is a computer-generated receipt. For any queries, contact support@smarttravelplanner.in</div>
        <button class="btn accent" style="margin-top:16px; width:100%; padding:12px;" onclick="window.print()">
          🖨️ Print Receipt
        </button>
      </div>
    </div>
  `;

  // Smooth scroll to receipt
  receiptContainer.scrollIntoView({ behavior: 'smooth' });
}

// Initial render for hotels
document.addEventListener('DOMContentLoaded', () => {
  renderHotelsList(hotelsData);
});

// ---------------- COMPLETE TRIP PLANNER ----------------

function openPlanTripModal(defaultDestId = null, existingConfig = null) {
  const destSelect = document.getElementById('ptDest');
  destSelect.innerHTML = destinations.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  
  if (defaultDestId) {
    destSelect.value = defaultDestId;
  }
  
  if (existingConfig) {
    if (existingConfig.dest && existingConfig.dest.id) destSelect.value = existingConfig.dest.id;
    if (existingConfig.startDate) document.getElementById('ptStartDate').value = existingConfig.startDate;
    if (existingConfig.days) document.getElementById('ptDays').value = existingConfig.days;
    if (existingConfig.travellers) document.getElementById('ptTravellers').value = existingConfig.travellers;
    if (existingConfig.budget) document.getElementById('ptBudget').value = existingConfig.budget;
    if (existingConfig.group) document.getElementById('ptGroup').value = existingConfig.group;
    if (existingConfig.style) document.getElementById('ptStyle').value = existingConfig.style;
    if (existingConfig.interests && Array.isArray(existingConfig.interests)) {
      document.querySelectorAll('#ptInterests input').forEach(cb => {
        cb.checked = existingConfig.interests.some(i => cb.value.includes(i));
      });
    }
  } else {
    // Set default dates
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    document.getElementById('ptStartDate').value = nextWeek.toISOString().split('T')[0];
  }
  
  document.getElementById('planTripModalOverlay').classList.remove('hidden');
  document.getElementById('planTripModal').classList.remove('hidden');
}

function closePlanTripModal() {
  document.getElementById('planTripModalOverlay').classList.add('hidden');
  document.getElementById('planTripModal').classList.add('hidden');
}

function closePlanner() {
  document.getElementById('plannerItineraryCard').classList.add('hidden');
  document.getElementById('destList').classList.remove('hidden');
  document.getElementById('destList').parentElement.querySelector('.section-header').classList.remove('hidden');
  document.getElementById('destList').parentElement.querySelector('.category-strip').classList.remove('hidden');
}

function generateItinerary(e) {
  e.preventDefault();
  closePlanTripModal();
  
  const destId = parseInt(document.getElementById('ptDest').value);
  const dest = destinations.find(d => d.id === destId);
  const startDate = document.getElementById('ptStartDate').value;
  const days = parseInt(document.getElementById('ptDays').value);
  const travellers = parseInt(document.getElementById('ptTravellers').value);
  const budget = parseInt(document.getElementById('ptBudget').value);
  const group = document.getElementById('ptGroup').value;
  const style = document.getElementById('ptStyle').value;
  
  // Get selected interests
  const interests = Array.from(document.querySelectorAll('#ptInterests input:checked')).map(cb => cb.value.split(',')).flat();
  
  plannerConfig = { dest, startDate, days, travellers, budget, group, style, interests };
  
  // Generate days based on POIs
  const pois = touristPOIs[destId] ? [...touristPOIs[destId]] : [];
  
  // Very basic scoring based on interests
  pois.forEach(p => {
    p.score = 0;
    interests.forEach(i => {
      if (p.type === i) p.score += 2;
    });
    // Add realistic cost and duration if not present
    p.cost = p.cost || (Math.floor(Math.random() * 4 + 1) * 100);
    p.durationMins = p.durationMins || (Math.floor(Math.random() * 2 + 1) * 60);
  });
  
  // Sort POIs by interest score
  pois.sort((a, b) => b.score - a.score);
  
  let placesPerDay = 3;
  if (style === 'relaxed') placesPerDay = 2;
  if (style === 'packed') placesPerDay = 5;
  
  currentItinerary = [];
  let poiIndex = 0;
  
  for (let i=0; i<days; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + i);
    
    let dayActivities = [];
    
    // Helper to format time
    const formatTime = (minsFromMidnight) => {
      let h = Math.floor(minsFromMidnight / 60);
      let m = minsFromMidnight % 60;
      let suffix = h >= 12 && h < 24 ? "PM" : "AM";
      let displayH = h % 12;
      if (displayH === 0) displayH = 12;
      let displayM = m.toString().padStart(2, '0');
      return `${displayH}:${displayM} ${suffix}`;
    };

    let currentTimeMins = 8 * 60 + 30; // 8:30 AM Start
    
    // Breakfast
    dayActivities.push({
      name: "Breakfast & Briefing",
      type: "meal",
      desc: "Start your day with a hearty local breakfast to fuel up for the journey.",
      timeStr: `${formatTime(currentTimeMins)} - ${formatTime(currentTimeMins + 45)}`,
      durationMins: 45,
      cost: 200,
      icon: "🍳"
    });
    
    currentTimeMins += 45 + 15; // 45m breakfast + 15m travel
    
    let morningPlaces = Math.ceil(placesPerDay / 2);
    let afternoonPlaces = placesPerDay - morningPlaces;
    
    // Morning activities
    for (let j=0; j<morningPlaces; j++) {
      if (poiIndex < pois.length) {
        const p = pois[poiIndex++];
        let dur = p.durationMins || 90;
        dayActivities.push({
          ...p,
          timeStr: `${formatTime(currentTimeMins)} - ${formatTime(currentTimeMins + dur)}`,
          travelToNext: "15-20 mins (Taxi/Auto)",
          icon: POI_TYPE_CONFIG[p.type] ? POI_TYPE_CONFIG[p.type].emoji : "📍"
        });
        currentTimeMins += dur + 20; // duration + travel time
      }
    }
    
    // Lunch
    if (currentTimeMins < 13 * 60) currentTimeMins = 13 * 60; // Lunch around 1 PM
    dayActivities.push({
      name: "Lunch Break",
      type: "meal",
      desc: "Enjoy traditional local cuisine at a highly-rated nearby restaurant.",
      timeStr: `${formatTime(currentTimeMins)} - ${formatTime(currentTimeMins + 60)}`,
      durationMins: 60,
      cost: 400,
      icon: "🍲"
    });
    
    currentTimeMins += 60 + 20; // 60m lunch + 20m travel
    
    // Afternoon/Evening activities
    for (let j=0; j<afternoonPlaces; j++) {
      if (poiIndex < pois.length) {
        const p = pois[poiIndex++];
        let dur = p.durationMins || 90;
        dayActivities.push({
          ...p,
          timeStr: `${formatTime(currentTimeMins)} - ${formatTime(currentTimeMins + dur)}`,
          travelToNext: "15-20 mins (Taxi/Auto)",
          icon: POI_TYPE_CONFIG[p.type] ? POI_TYPE_CONFIG[p.type].emoji : "📍"
        });
        currentTimeMins += dur + 20; // duration + travel time
      }
    }
    
    // Dinner
    if (currentTimeMins < 19 * 60 + 30) currentTimeMins = 19 * 60 + 30; // Dinner at least at 7:30 PM
    dayActivities.push({
      name: "Dinner & Leisure",
      type: "meal",
      desc: "Wind down and relax with a delicious dinner.",
      timeStr: `${formatTime(currentTimeMins)} - ${formatTime(currentTimeMins + 60)}`,
      durationMins: 60,
      cost: 500,
      icon: "🍽️"
    });
    
    currentItinerary.push({
      day: i+1,
      date: dayDate.toDateString(),
      activities: dayActivities
    });
  }
  
  renderItinerary();
}

function renderItinerary(savedPlanRef = null) {
  document.getElementById('destList').parentElement.querySelector('.section-header').classList.add('hidden');
  document.getElementById('destList').parentElement.querySelector('.category-strip').classList.add('hidden');
  document.getElementById('destList').classList.add('hidden');
  document.getElementById('destDetailCard').classList.add('hidden');
  
  const card = document.getElementById('plannerItineraryCard');
  card.classList.remove('hidden');
  
  // Calculate total costs
  let totalActivityCost = 0;
  currentItinerary.forEach(d => {
    if (d.activities) d.activities.forEach(a => totalActivityCost += (a.cost || 0));
  });
  totalActivityCost *= (plannerConfig.travellers || 1);
  
  let remainingBudget = (plannerConfig.budget || 0) - totalActivityCost;
  let budgetColor = remainingBudget >= 0 ? '#10b981' : '#ef4444';
  let warningHtml = remainingBudget < 0 ? `<div style="background:#fee2e2; color:#ef4444; padding:10px; border-radius:6px; margin-top:10px; font-size:13px; font-weight:700;">⚠️ This itinerary exceeds your budget. Try removing activities or switching to a relaxed pace.</div>` : '';
  
  // Check if we are viewing a saved plan or active plan
  const planInfo = savedPlanRef || (activePlanId ? savedPlans.find(p => p.id === activePlanId) : null);
  const planBannerHtml = planInfo ? `
    <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1.5px solid #93c5fd; padding: 12px 18px; border-radius: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 24px;">🧭</span>
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <strong style="font-size: 15px; color: #1e3a8a;">${planInfo.title}</strong>
            <span class="saved-plan-status-pill status-${(planInfo.status || 'planning').toLowerCase()}">${planInfo.status || 'Planning'}</span>
          </div>
          <span style="font-size: 12px; color: #3b82f6;">Saved Plan ID #${planInfo.id} • Last updated: ${new Date(planInfo.updated_at || Date.now()).toLocaleDateString()}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn small accent" onclick="openSavePlanModal()">💾 Update This Saved Plan</button>
        <button class="btn small secondary" onclick="openSavedPlansTab()">View All Plans</button>
      </div>
    </div>
  ` : '';

  const saveBtn = document.getElementById('btnSaveTripPlan');
  if (saveBtn) {
    saveBtn.innerHTML = planInfo ? `💾 Update Saved Plan (#${planInfo.id})` : `💾 Save This Planned Trip`;
  }

  let html = `
    ${planBannerHtml}
    <div style="background:var(--bg); padding:18px 20px; border-radius:12px; margin-bottom:20px; border:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
        <div>
          <h2 style="margin:0 0 6px; color:var(--primary); font-size:24px;">Trip to ${(plannerConfig.dest && plannerConfig.dest.name) || (planInfo && (planInfo.destination_name || planInfo.destinationName)) || 'Destination'}</h2>
          <div style="display:flex; gap:16px; font-size:14px; color:#475569; flex-wrap:wrap;">
            <span>🗓️ ${plannerConfig.days} Days (${new Date(plannerConfig.startDate).toLocaleDateString()})</span>
            <span>👥 ${plannerConfig.travellers} ${plannerConfig.group}</span>
            <span>🏃 Pace: ${plannerConfig.style}</span>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn secondary small" onclick="openSavePlanModal()" style="font-weight:700;">💾 ${planInfo ? 'Update Plan' : 'Save Plan'}</button>
          <button class="btn accent small" onclick="saveItineraryToBudget()">💰 Send to Budget</button>
        </div>
      </div>
      
      <div style="margin-top:16px; display:flex; gap:20px; align-items:center; flex-wrap:wrap; padding-top:14px; border-top:1px dashed #cbd5e1;">
        <div>
          <span style="font-size:11px; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">TOTAL BUDGET</span>
          <div style="font-size:19px; font-weight:800; color:#0f172a;">₹${Number(plannerConfig.budget || 0).toLocaleString()}</div>
        </div>
        <div>
          <span style="font-size:11px; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">EST. ACTIVITY COST</span>
          <div style="font-size:19px; font-weight:800; color:#2563eb;">₹${totalActivityCost.toLocaleString()}</div>
        </div>
        <div>
          <span style="font-size:11px; color:var(--muted); font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">REMAINING (Hotel + Transport)</span>
          <div style="font-size:19px; font-weight:800; color:${budgetColor};">₹${remainingBudget.toLocaleString()}</div>
        </div>
      </div>
      ${warningHtml}
    </div>
    
    <div class="itinerary-days">
  `;
  
  currentItinerary.forEach((day, dIdx) => {
    html += `
      <div style="margin-bottom:24px; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; background:white; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
        <div style="background:#f8fafc; padding:12px 18px; border-bottom:1px solid #e2e8f0; font-weight:800; color:var(--primary); display:flex; justify-content:space-between; align-items:center;">
          <span>Day ${day.day} - ${day.date}</span>
          <span style="font-size:12px; color:var(--muted); font-weight:600;">${day.activities ? day.activities.length : 0} activities scheduled</span>
        </div>
        <div style="padding:18px;">
    `;
    
    if (!day.activities || day.activities.length === 0) {
      html += `<p style="color:var(--muted); font-size:14px; margin:10px 0;">No activities scheduled for this day. Relax and explore!</p>`;
    } else {
      day.activities.forEach((act, aIdx) => {
        let typeInfo = POI_TYPE_CONFIG[act.type] || { color: '#64748b', emoji: '📍', label: 'Activity' };
        let isMeal = act.type === 'meal';
        let actColor = isMeal ? '#f59e0b' : typeInfo.color;
        let actLabel = isMeal ? 'Meal Break' : typeInfo.label;
        
        html += `
          <div style="display:flex; gap:16px; margin-bottom:20px; padding-bottom:20px; border-bottom:1px dashed #e2e8f0; position:relative;">
            <div style="min-width:145px; font-size:13.5px; font-weight:800; color:#0f172a; padding-top:4px; border-right:3px solid ${actColor}40; padding-right:12px;">
              ${act.timeStr || 'Flexible'}
              ${act.travelToNext ? `<div style="font-size:11px; color:var(--muted); font-weight:600; margin-top:8px;">🚗 ${act.travelToNext}</div>` : ''}
            </div>
            <div style="flex:1;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h4 style="margin:0 0 4px; font-size:17px; color:var(--primary);">${act.icon || typeInfo.emoji} ${act.name}</h4>
                  <div style="font-size:12px; color:${actColor}; font-weight:700; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">${actLabel}</div>
                </div>
                ${!isMeal ? `<button onclick="removeActivity(${dIdx}, ${aIdx})" style="background:#fee2e2; border:1px solid #fca5a5; color:#ef4444; border-radius:6px; padding:4px 8px; font-size:12px; cursor:pointer;" title="Remove Activity">✕ Remove</button>` : ''}
              </div>
              <p style="margin:0 0 12px; font-size:13.5px; color:#334155; line-height:1.5;">${act.desc || ''}</p>
              <div style="display:flex; gap:12px; font-size:12px; color:var(--muted); flex-wrap:wrap;">
                <span style="background:#f1f5f9; padding:5px 10px; border-radius:6px; font-weight:600;">⏱️ Duration: ${Math.round(act.durationMins || 60)} mins</span>
                ${act.cost ? `<span style="background:#f1f5f9; padding:5px 10px; border-radius:6px; font-weight:600;">💸 Est. ₹${act.cost}/person</span>` : ''}
              </div>
            </div>
          </div>
        `;
      });
    }
    
    html += `</div></div>`;
  });
  
  html += `</div>`;
  
  document.getElementById('plannerItineraryBody').innerHTML = html;
}

function removeActivity(dayIndex, actIndex) {
  if (currentItinerary[dayIndex] && currentItinerary[dayIndex].activities) {
    currentItinerary[dayIndex].activities.splice(actIndex, 1);
    renderItinerary();
  }
}

function saveItineraryToBudget() {
  let totalActivityCost = 0;
  currentItinerary.forEach(d => {
    if (d.activities) d.activities.forEach(a => totalActivityCost += (a.cost || 0));
  });
  totalActivityCost *= (plannerConfig.travellers || 1);
  
  document.getElementById('totalBudget').value = plannerConfig.budget || 15000;
  document.getElementById('expActivities').value = totalActivityCost;
  
  // Assign arbitrary values for hotel and transport if they are empty
  const hotel = document.getElementById('expHotel').value || Math.round(((plannerConfig.budget || 15000) - totalActivityCost) * 0.6);
  const transport = document.getElementById('expTransport').value || Math.round(((plannerConfig.budget || 15000) - totalActivityCost) * 0.4);
  
  document.getElementById('expHotel').value = Math.max(0, hotel);
  document.getElementById('expTransport').value = Math.max(0, transport);
  
  updateBudget();
  document.querySelector('[data-tab="budget"]').click();
  showToast('Budget synchronized from trip plan!');
}

// ---------------- SAVED PLANNED TRIPS LOGIC ----------------

function getPlansStorageKey() {
  return currentUser && currentUser.id ? `stp_saved_plans_u_${currentUser.id}` : 'stp_saved_plans_guest';
}

async function loadSavedPlansFromStorage() {
  // Clean up legacy global key so other accounts never leak
  try { localStorage.removeItem('stp_saved_plans'); } catch (_) {}

  const storageKey = getPlansStorageKey();
  let localPlans = [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) localPlans = JSON.parse(raw);
  } catch (_) {
    localPlans = [];
  }

  if (currentUser && currentUser.id) {
    try {
      const res = await fetch(`${API_BASE}/planned-trips/user/${currentUser.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.plans)) {
        // Strictly load this specific logged-in user's plans from database
        savedPlans = data.plans;
        localStorage.setItem(storageKey, JSON.stringify(savedPlans));
        const syncStatus = document.getElementById('savedPlansSyncStatus');
        if (syncStatus) syncStatus.innerHTML = `☁️ Account: ${currentUser.email} (${savedPlans.length} plans)`;
      } else {
        savedPlans = localPlans;
      }
    } catch (err) {
      console.warn('Could not fetch cloud plans, using user local cache:', err);
      savedPlans = localPlans;
      const syncStatus = document.getElementById('savedPlansSyncStatus');
      if (syncStatus) syncStatus.innerHTML = `📱 Offline Cache (${savedPlans.length} plans)`;
    }
  } else {
    // Guest view: only show guest plans, never another account's plans
    savedPlans = localPlans;
    const syncStatus = document.getElementById('savedPlansSyncStatus');
    if (syncStatus) syncStatus.innerHTML = `📱 Guest Storage (Log in to save to your personal account)`;
  }

  updateSavedPlansUI();
}

function updateSavedPlansUI() {
  const badge = document.getElementById('savedPlansBadge');
  if (badge) {
    badge.textContent = savedPlans.length;
    badge.style.display = savedPlans.length > 0 ? 'inline-block' : 'none';
  }

  const profileCount = document.getElementById('profileSavedPlansCount');
  if (profileCount) profileCount.textContent = savedPlans.length;

  const profileStatus = document.getElementById('profilePlansStatus');
  if (profileStatus) {
    profileStatus.textContent = savedPlans.length === 0
      ? 'No saved trip plans yet — start planning your next adventure!'
      : `${savedPlans.length} customized travel plan${savedPlans.length === 1 ? '' : 's'} saved`;
  }

  // Update filter counters
  const cAll = document.getElementById('countFilterAll');
  if (cAll) cAll.textContent = savedPlans.length;

  const cPlanning = document.getElementById('countFilterPlanning');
  if (cPlanning) cPlanning.textContent = savedPlans.filter(p => (p.status || 'planning').toLowerCase() === 'planning').length;

  const cReady = document.getElementById('countFilterReady');
  if (cReady) cReady.textContent = savedPlans.filter(p => (p.status || '').toLowerCase() === 'ready').length;

  const cBooked = document.getElementById('countFilterBooked');
  if (cBooked) cBooked.textContent = savedPlans.filter(p => (p.status || '').toLowerCase() === 'booked').length;

  // Filter plans for the main grid
  let displayedPlans = savedPlans;
  if (activePlanFilter !== 'all') {
    displayedPlans = savedPlans.filter(p => (p.status || 'planning').toLowerCase() === activePlanFilter.toLowerCase());
  }

  const grid = document.getElementById('savedPlansGrid');
  const emptyView = document.getElementById('savedPlansEmpty');

  if (savedPlans.length === 0) {
    if (grid) grid.innerHTML = '';
    if (emptyView) emptyView.classList.remove('hidden');
  } else {
    if (emptyView) emptyView.classList.add('hidden');
    if (grid) {
      if (displayedPlans.length === 0) {
        grid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--muted); background: white; border-radius: 12px; border: 1px dashed #cbd5e1;">
            <p>No trip plans found with status "<strong>${activePlanFilter}</strong>".</p>
            <button class="btn small secondary" onclick="filterSavedPlansByStatus('all', document.querySelector('.plan-filter-btn'))">Show All Plans</button>
          </div>
        `;
      } else {
        grid.innerHTML = displayedPlans.map(plan => renderSavedPlanCard(plan)).join('');
      }
    }
  }

  // Also render showcase inside Account profile
  const profileList = document.getElementById('profileSavedPlansList');
  if (profileList) {
    if (savedPlans.length === 0) {
      profileList.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 30px; background: white; border-radius: 12px; border: 1px dashed #cbd5e1;">
          <p style="color: var(--muted); margin: 0 0 12px;">You haven't saved any planned trips yet.</p>
          <button class="btn accent small" onclick="openPlanTripModal()">✨ Plan a New Trip</button>
        </div>
      `;
    } else {
      profileList.innerHTML = savedPlans.slice(0, 4).map(plan => renderSavedPlanCard(plan)).join('');
    }
  }
}

function renderSavedPlanCard(plan) {
  const destId = plan.destination_id || plan.destinationId || 1;
  const destName = plan.destination_name || plan.destinationName || 'Destination';
  const destObj = destinations.find(d => d.id === destId) || {
    name: destName,
    img: 'assets/goa.jpg',
    category: 'Travel'
  };

  const statusLower = (plan.status || 'planning').toLowerCase();
  let statusClass = 'status-planning';
  let statusText = '🟡 In Planning';
  if (statusLower === 'ready') {
    statusClass = 'status-ready';
    statusText = '🟢 Ready to Book';
  } else if (statusLower === 'booked') {
    statusClass = 'status-booked';
    statusText = '🔵 Booked';
  }

  const durationDays = plan.duration_days || plan.durationDays || 3;
  const durationStr = `${durationDays} Days / ${Math.max(1, durationDays - 1)} Nights`;
  const startDate = plan.start_date || plan.startDate;
  const dateStr = startDate ? new Date(startDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : 'Flexible';
  const activityCost = plan.activity_cost || plan.activityCost || 0;
  const remainingCost = Math.max(0, (plan.budget || 0) - activityCost);

  return `
    <div class="saved-plan-card" id="planCard-${plan.id}" data-plan-id="${Number(plan.id)}">
      <div class="saved-plan-cover" style="background-image: url('${destObj.img || 'assets/goa.jpg'}');">
        <span class="saved-plan-dest-badge">📍 ${destName} • ${destObj.category || 'Package'}</span>
        <span class="saved-plan-status-pill ${statusClass}">${statusText}</span>
        <div class="saved-plan-cover-title">
          <h3>${plan.title}</h3>
          <span>🗓️ ${dateStr} • ${durationStr}</span>
        </div>
      </div>

      <div class="saved-plan-body">
        <div class="saved-plan-metrics">
          <div class="saved-plan-metric-box">
            <span class="label">👥 Travellers</span>
            <span class="val">${plan.travellers || 1} (${plan.group_type || plan.groupType || 'Solo'})</span>
          </div>
          <div class="saved-plan-metric-box">
            <span class="label">🏃 Pace</span>
            <span class="val">${plan.pace_style || plan.paceStyle || 'Balanced'}</span>
          </div>
        </div>

        <div class="saved-plan-budget-box">
          <div class="saved-plan-budget-row">
            <span style="color:var(--muted); font-weight:600;">Target Budget:</span>
            <strong style="color:#0f172a;">₹${Number(plan.budget || 0).toLocaleString()}</strong>
          </div>
          <div class="saved-plan-budget-row">
            <span style="color:var(--muted); font-weight:600;">Est. Activity Cost:</span>
            <strong style="color:#2563eb;">₹${Number(activityCost).toLocaleString()}</strong>
          </div>
          <div class="saved-plan-budget-row" style="margin-top:4px; padding-top:4px; border-top:1px dashed #cbd5e1;">
            <span style="color:var(--muted); font-weight:600;">Remaining for Stay:</span>
            <strong style="color:#10b981;">₹${remainingCost.toLocaleString()}</strong>
          </div>
        </div>

        ${plan.notes ? `<div class="saved-plan-notes">📝 <strong>Notes:</strong> ${plan.notes}</div>` : ''}

        <div class="saved-plan-footer-actions">
          <button class="btn accent small" style="flex:1; justify-content:center; font-weight:700;" onclick="reviewSavedPlan(${plan.id})">
            👁️ Review Plan
          </button>
          <button class="btn secondary small" style="flex:1; justify-content:center;" onclick="continuePlanningSavedPlan(${plan.id})">
            ✏️ Continue Planning
          </button>
          <button class="btn small" style="background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1;" title="Send to Budget Calculator" onclick="syncPlanToBudget(${plan.id})">
            💰 Budget
          </button>
          <button class="btn small" style="background:#fee2e2; color:#ef4444; border:1px solid #fca5a5;" title="Delete Plan" onclick="deleteSavedPlan(${plan.id})">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `;
}

function filterSavedPlansByStatus(status, btn) {
  activePlanFilter = status;
  document.querySelectorAll('.plan-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  updateSavedPlansUI();
}

function openSavedPlansTab() {
  const btn = document.querySelector('[data-tab="savedplans"]');
  if (btn) btn.click();
}

function openSavePlanModal() {
  if (!plannerConfig || !plannerConfig.dest) {
    alert("Please plan or generate an itinerary first!");
    return;
  }

  const existingPlan = activePlanId ? savedPlans.find(p => p.id === activePlanId) : null;

  document.getElementById('savePlanModalTitle').textContent = existingPlan ? 'Update Saved Trip Plan' : 'Save Trip Plan';
  document.getElementById('btnConfirmSavePlan').textContent = existingPlan ? '💾 Update Plan' : '💾 Save Trip Plan';

  document.getElementById('spTitle').value = existingPlan ? existingPlan.title : `${plannerConfig.days}-Day ${plannerConfig.dest.name} Getaway`;
  document.getElementById('spDestDisplay').value = plannerConfig.dest.name;
  document.getElementById('spStatus').value = existingPlan ? existingPlan.status : 'Planning';
  document.getElementById('spNotes').value = existingPlan ? (existingPlan.notes || '') : '';

  let totalCost = 0;
  if (currentItinerary && Array.isArray(currentItinerary)) {
    currentItinerary.forEach(d => {
      if (d.activities) d.activities.forEach(a => totalCost += (a.cost || 0));
    });
    totalCost *= (plannerConfig.travellers || 1);
  }

  document.getElementById('spSummaryDuration').textContent = `${plannerConfig.days} Days / ${Math.max(1, plannerConfig.days - 1)} Nights`;
  document.getElementById('spSummaryTravellers').textContent = `${plannerConfig.travellers} (${plannerConfig.group || 'Solo'})`;
  document.getElementById('spSummaryBudget').textContent = `₹${(plannerConfig.budget || 0).toLocaleString()}`;
  document.getElementById('spSummaryCost').textContent = `₹${totalCost.toLocaleString()}`;

  document.getElementById('savePlanModalOverlay').classList.remove('hidden');
  document.getElementById('savePlanModal').classList.remove('hidden');
}

function closeSavePlanModal() {
  document.getElementById('savePlanModalOverlay').classList.add('hidden');
  document.getElementById('savePlanModal').classList.add('hidden');
}

async function handleSavePlanSubmit(event) {
  event.preventDefault();

  const title = document.getElementById('spTitle').value.trim();
  const status = document.getElementById('spStatus').value;
  const notes = document.getElementById('spNotes').value.trim();

  let totalActivityCost = 0;
  if (currentItinerary && Array.isArray(currentItinerary)) {
    currentItinerary.forEach(d => {
      if (d.activities) d.activities.forEach(a => totalActivityCost += (a.cost || 0));
    });
    totalActivityCost *= (plannerConfig.travellers || 1);
  }

  const payload = {
    id: activePlanId || undefined,
    userId: currentUser ? currentUser.id : null,
    title,
    destinationId: plannerConfig.dest.id,
    destination_id: plannerConfig.dest.id,
    destinationName: plannerConfig.dest.name,
    destination_name: plannerConfig.dest.name,
    startDate: plannerConfig.startDate,
    start_date: plannerConfig.startDate,
    durationDays: plannerConfig.days,
    duration_days: plannerConfig.days,
    travellers: plannerConfig.travellers,
    groupType: plannerConfig.group,
    group_type: plannerConfig.group,
    paceStyle: plannerConfig.style,
    pace_style: plannerConfig.style,
    budget: plannerConfig.budget,
    activityCost: totalActivityCost,
    activity_cost: totalActivityCost,
    interests: plannerConfig.interests,
    itineraryData: currentItinerary,
    itinerary_data: JSON.stringify(currentItinerary),
    notes,
    status
  };

  closeSavePlanModal();

  try {
    const res = await fetch(`${API_BASE}/planned-trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      if (!activePlanId && data.planId) {
        activePlanId = data.planId;
        payload.id = data.planId;
      }
      showToast(data.message || '🎉 Trip plan saved successfully!');
    }
  } catch (err) {
    console.warn('Saved plan locally (server unreachable):', err);
    if (!activePlanId) {
      payload.id = Date.now();
      activePlanId = payload.id;
    }
    showToast('💾 Trip plan saved locally!');
  }

  // Update local storage (scoped per user account — never a shared global key)
  payload.id = payload.id || activePlanId || Date.now();
  payload.updated_at = new Date().toISOString();
  const existingIdx = savedPlans.findIndex(p => p.id === payload.id);
  if (existingIdx > -1) {
    savedPlans[existingIdx] = { ...savedPlans[existingIdx], ...payload };
  } else {
    savedPlans.unshift(payload);
  }
  localStorage.setItem(getPlansStorageKey(), JSON.stringify(savedPlans));

  updateSavedPlansUI();

  // Update button in planner
  const btn = document.getElementById('btnSaveTripPlan');
  if (btn) btn.innerHTML = `✅ Saved (#${payload.id}) — Update`;
}

function reviewSavedPlan(planId) {
  const plan = savedPlans.find(p => Number(p.id) === Number(planId));
  if (!plan) return;

  activePlanId = plan.id;
  const destId = plan.destination_id || plan.destinationId || 1;
  const destName = plan.destination_name || plan.destinationName || 'Destination';
  const dest = destinations.find(d => d.id === destId) || {
    id: destId,
    name: destName,
    img: 'assets/goa.jpg'
  };

  plannerConfig = {
    dest,
    startDate: plan.start_date || plan.startDate || new Date().toISOString().split('T')[0],
    days: plan.duration_days || plan.durationDays || 3,
    travellers: plan.travellers || 1,
    budget: plan.budget || 15000,
    group: plan.group_type || plan.groupType || 'solo',
    style: plan.pace_style || plan.paceStyle || 'balanced',
    interests: plan.interests || []
  };

  currentItinerary = plan.itineraryData || plan.itinerary_data || [];
  if (typeof currentItinerary === 'string') {
    try { currentItinerary = JSON.parse(currentItinerary); } catch (_) { currentItinerary = []; }
  }

  // Switch to destination tab and render itinerary
  document.querySelector('[data-tab="destinations"]').click();
  renderItinerary(plan);
  
  // Update button label
  const btn = document.getElementById('btnSaveTripPlan');
  if (btn) btn.innerHTML = `💾 Update Saved Plan (#${plan.id})`;

  showToast(`Loaded "${plan.title}" for review!`);
}

function continuePlanningSavedPlan(planId) {
  const plan = savedPlans.find(p => Number(p.id) === Number(planId));
  if (!plan) return;

  activePlanId = plan.id;
  const destId = plan.destination_id || plan.destinationId || 1;
  const destName = plan.destination_name || plan.destinationName || 'Destination';
  const dest = destinations.find(d => d.id === destId) || {
    id: destId,
    name: destName,
    img: 'assets/goa.jpg'
  };

  plannerConfig = {
    dest,
    startDate: plan.start_date || plan.startDate || new Date().toISOString().split('T')[0],
    days: plan.duration_days || plan.durationDays || 3,
    travellers: plan.travellers || 1,
    budget: plan.budget || 15000,
    group: plan.group_type || plan.groupType || 'solo',
    style: plan.pace_style || plan.paceStyle || 'balanced',
    interests: plan.interests || []
  };

  currentItinerary = plan.itineraryData || plan.itinerary_data || [];
  if (typeof currentItinerary === 'string') {
    try { currentItinerary = JSON.parse(currentItinerary); } catch (_) { currentItinerary = []; }
  }

  // Switch to destination tab
  document.querySelector('[data-tab="destinations"]').click();
  // Open the plan preferences modal pre-filled with this plan's exact data
  openPlanTripModal(destId, plannerConfig);

  showToast(`Continuing plan: "${plan.title}". Adjust your preferences or schedule anytime.`);
}

function confirmDeletePlan(planId) {
  // Remove any existing confirm overlays
  document.querySelectorAll('.plan-delete-confirm').forEach(el => el.remove());

  // Find the card for this plan
  const numId = Number(planId);
  const card = document.querySelector(`[data-plan-id="${numId}"]`);
  if (!card) {
    // Fallback: try direct delete if card not found
    doDeletePlan(planId);
    return;
  }

  // Create inline confirm overlay on the card
  const overlay = document.createElement('div');
  overlay.className = 'plan-delete-confirm';
  overlay.innerHTML = `
    <div class="plan-delete-confirm-inner">
      <p>🗑️ <strong>Delete this trip plan?</strong></p>
      <p style="color:#64748b; font-size:13px; margin:4px 0 12px;">This cannot be undone.</p>
      <div style="display:flex; gap:8px; justify-content:center;">
        <button class="btn small" style="background:#ef4444; color:#fff; font-weight:700; border:none;" onclick="doDeletePlan(${numId})">Yes, Delete</button>
        <button class="btn small secondary" onclick="this.closest('.plan-delete-confirm').remove()">Cancel</button>
      </div>
    </div>
  `;
  card.style.position = 'relative';
  card.appendChild(overlay);
}

async function doDeletePlan(planId) {
  // Remove confirm overlay if present
  document.querySelectorAll('.plan-delete-confirm').forEach(el => el.remove());

  const numId = Number(planId);

  try {
    const res = await fetch(`${API_BASE}/planned-trips/${numId}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!data.success) console.warn('Server delete response:', data);
  } catch (err) {
    console.warn('Failed to delete on server:', err);
  }

  // Use Number() coercion to handle string vs number ID mismatch from JSON/localStorage
  savedPlans = savedPlans.filter(p => Number(p.id) !== numId);
  localStorage.setItem(getPlansStorageKey(), JSON.stringify(savedPlans)); // scoped per user

  if (Number(activePlanId) === numId) {
    activePlanId = null;
    const btn = document.getElementById('btnSaveTripPlan');
    if (btn) btn.innerHTML = `💾 Save This Planned Trip`;
  }

  updateSavedPlansUI();
  showToast('Trip plan deleted.');
}

// Keep old name as alias for backward compatibility
async function deleteSavedPlan(planId) {
  confirmDeletePlan(planId);
}

function syncPlanToBudget(planId) {
  const plan = savedPlans.find(p => Number(p.id) === Number(planId));
  if (!plan) return;

  document.getElementById('totalBudget').value = plan.budget || 15000;
  document.getElementById('expActivities').value = plan.activity_cost || 3000;
  
  const remaining = Math.max(0, (plan.budget || 15000) - (plan.activity_cost || 3000));
  document.getElementById('expHotel').value = Math.round(remaining * 0.6);
  document.getElementById('expTransport').value = Math.round(remaining * 0.4);

  updateBudget();
  document.querySelector('[data-tab="budget"]').click();
  showToast(`Synced "${plan.title}" costs to Budget Calculator!`);
}

function showToast(msg) {
  const existing = document.querySelector('.stp-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'stp-toast';
  toast.innerHTML = `<span>🧭</span> <div>${msg}</div>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

