/**
 * J. Fletcher Art catalogue and collection data
 * ------------------------------------------------
 * Keep product content in one place so the shop, product, cart and checkout
 * pages remain consistent. Prices are intentionally controlled by size.
 */

const SIZE_PRICES = Object.freeze({
  A5: 120,
  A4: 180,
  A3: 260
});

const PRODUCTS = Object.freeze([
  {
    id: "silent-tide",
    title: "Silent Tide",
    category: "Nature",
    orientation: "Landscape",
    edition: "Open Edition",
    editionSize: "Open edition",
    availability: "Printed to order",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    alt: "Soft ocean tide meeting a quiet shoreline at dusk",
    description: "A quiet study of water, distance and negative space.",
    story: "Photographed as the tide softened the shoreline, Silent Tide holds the calm between movement and stillness.",
    featured: true
  },
  {
    id: "city-in-blue",
    title: "City in Blue",
    category: "Urban",
    orientation: "Portrait",
    edition: "Open Edition",
    editionSize: "Open edition",
    availability: "Printed to order",
    image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2",
    alt: "Modern city architecture with geometric glass lines",
    description: "Architectural rhythm, cool tones and precise geometry.",
    story: "City in Blue turns an ordinary city facade into a study of repetition, balance and movement.",
    featured: true
  },
  {
    id: "desert-line",
    title: "Desert Line",
    category: "Nature",
    orientation: "Landscape",
    edition: "Signed Limited Edition",
    editionSize: "Edition of 25",
    availability: "Available while the edition lasts",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
    alt: "Golden desert ridges beneath a pale sky",
    description: "A restrained desert composition with sculptural light.",
    story: "Created during a long walk through open desert, the image follows a single line of light across the dunes.",
    featured: true
  },
  {
    id: "field-notes",
    title: "Field Notes",
    category: "Objects",
    orientation: "Portrait",
    edition: "Signed Limited Edition",
    editionSize: "Edition of 25",
    availability: "Available while the edition lasts",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d",
    alt: "Vintage camera and photographic field notes arranged on a map",
    description: "A tactile still life about travel, observation and the tools of seeing.",
    story: "Field Notes brings together the objects that sit behind the finished image: a camera, handwritten references and traces of the journey.",
    featured: false
  },
  {
    id: "winter-pulse",
    title: "Winter Pulse",
    category: "Nature",
    orientation: "Landscape",
    edition: "Signed Limited Edition",
    editionSize: "Edition of 25",
    availability: "Available while the edition lasts",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
    alt: "Snow-covered mountain range beneath a star-filled sky",
    description: "Sharp alpine forms softened by winter atmosphere.",
    story: "A high-altitude study of silence, scale and the shifting edge between sky and stone.",
    featured: true
  },
  {
    id: "green-study",
    title: "Green Study No. 3",
    category: "Botanical",
    orientation: "Portrait",
    edition: "Open Edition",
    editionSize: "Open edition",
    availability: "Printed to order",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86",
    alt: "Layered green leaves photographed from below",
    description: "A botanical composition built from light and repetition.",
    story: "Green Study No. 3 was photographed to feel immersive, calm and quietly architectural.",
    featured: false
  },
  {
    id: "between-mountains",
    title: "Between Mountains",
    category: "Nature",
    orientation: "Landscape",
    edition: "Open Edition",
    editionSize: "Open edition",
    availability: "Printed to order",
    image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e",
    alt: "A mountain valley beneath mist and cool morning light",
    description: "A wide landscape designed for calm, spacious interiors.",
    story: "The frame was made after the weather cleared for only a few minutes, revealing the valley in layers.",
    featured: true
  },
  {
    id: "quiet-water",
    title: "Quiet Water",
    category: "Nature",
    orientation: "Landscape",
    edition: "Open Edition",
    editionSize: "Open edition",
    availability: "Printed to order",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    alt: "Still mountain lake reflecting a dramatic landscape",
    description: "Reflective water, deep distance and natural symmetry.",
    story: "Quiet Water is an invitation to pause, look longer and let the eye move slowly through the frame.",
    featured: false
  },
  {
    id: "after-the-rain",
    title: "After the Rain",
    category: "Portraits",
    orientation: "Portrait",
    edition: "Open Edition",
    editionSize: "Open edition",
    availability: "Printed to order",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    alt: "Editorial portrait in soft natural light",
    description: "An intimate portrait shaped by softness, colour and direct gaze.",
    story: "After the Rain studies the quiet confidence that appears when expression is allowed to remain unforced.",
    featured: true
  },
  {
    id: "electric-bloom",
    title: "Electric Bloom",
    category: "Digital Art",
    orientation: "Portrait",
    edition: "Signed Limited Edition",
    editionSize: "Edition of 40",
    availability: "Available while the edition lasts",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5",
    alt: "Colourful abstract digital artwork with layered forms",
    description: "A vivid digital composition balancing colour, rhythm and movement.",
    story: "Electric Bloom layers photographed texture with digital colour to create an image that shifts between organic and imagined space.",
    featured: true
  },
  {
    id: "quiet-horizons-set",
    title: "Quiet Horizons Set",
    category: "Bundles",
    orientation: "Landscape",
    edition: "Curated Two-Print Set",
    editionSize: "Two-print pairing",
    availability: "Prepared together to order",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85",
    alt: "Two coordinated framed photographic prints in a calm interior",
    description: "Two landscape prints selected to share tone, scale and atmosphere.",
    story: "Quiet Horizons pairs Desert Line with Between Mountains for a calm, layered wall arrangement.",
    featured: true,
    priceMultiplier: 1.8,
    bundleItems: ["desert-line", "between-mountains"]
  },
  {
    id: "city-rhythm-set",
    title: "City Rhythm Set",
    category: "Bundles",
    orientation: "Portrait",
    edition: "Curated Two-Print Set",
    editionSize: "Two-print pairing",
    availability: "Prepared together to order",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    alt: "Coordinated architectural prints displayed in a modern interior",
    description: "A precise two-print pairing for modern, architectural spaces.",
    story: "City Rhythm combines City in Blue with a complementary urban study for a clean, graphic arrangement.",
    featured: false,
    priceMultiplier: 1.8,
    bundleItems: ["city-in-blue", "field-notes"]
  }
]);

const COLLECTIONS = Object.freeze([
  {
    name: "Featured",
    type: "featured",
    value: "true",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
    alt: "Snow-covered mountains beneath a night sky",
    description: "A concise edit of current studio favourites."
  },
  {
    name: "Nature",
    type: "category",
    value: "Nature",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    alt: "Mountain lake and valley landscape",
    description: "Open landscapes, weather and atmosphere."
  },
  {
    name: "Portraits",
    type: "category",
    value: "Portraits",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    alt: "Editorial portrait in natural light",
    description: "Direct, intimate studies of presence."
  },
  {
    name: "Urban",
    type: "category",
    value: "Urban",
    image: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2",
    alt: "Geometric city architecture",
    description: "Architecture, repetition and city rhythm."
  },
  {
    name: "Objects",
    type: "category",
    value: "Objects",
    image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d",
    alt: "Camera and field notes on a map",
    description: "Still life, memory and tactile detail."
  },
  {
    name: "Digital Art",
    type: "category",
    value: "Digital Art",
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5",
    alt: "Colourful abstract digital artwork",
    description: "Photographic texture reimagined through colour."
  },
  {
    name: "Botanical",
    type: "category",
    value: "Botanical",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86",
    alt: "Green leaves viewed from below",
    description: "Form, repetition and natural structure."
  }
]);

/** Find one product by its URL-safe id. */
function getProductById(id) {
  const legacyAliases = { "still-figure": "field-notes" };
  const resolvedId = legacyAliases[id] || id;
  return PRODUCTS.find((product) => product.id === resolvedId);
}
