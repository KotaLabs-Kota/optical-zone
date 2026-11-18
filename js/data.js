/* ------------------------------------------------------------------
   Optical Zone — Kota · site data (frontend only, no backend)

   Everything a shop owner is likely to change lives in this file:
   business details, the sample catalogue, FAQs and eye-test steps.

   VERIFY BEFORE LAUNCH (see README "Facts to confirm"):
   - BUSINESS.phone / whatsapp   (two different numbers appear in public listings)
   - BUSINESS.hours              (no verified opening hours were found)
   - PRODUCTS                    (sample catalogue; replace with real stock)
   - price: null                 (prices are shown as "Price on enquiry")
------------------------------------------------------------------- */

const BUSINESS = {
  name: "Optical Zone",
  shortName: "Optical Zone Kota",
  tagline: "Eyeglasses, branded sunglasses and eye testing in Vigyan Nagar, Kota.",
  address: {
    line1: "Plot No. 4-J-7, opposite Mayank School",
    line2: "Main Road, Vigyan Nagar",
    city: "Kota, Rajasthan 324005",
    country: "India"
  },
  // Verify before launch. Listings disagree on the number; this one is from indiainfo.
  phone: "+91 96940 31470",
  phoneTel: "+919694031470",
  whatsapp: "919694031470",
  // Not verified from a primary source. Shown as "to confirm" on the site.
  hours: { open: 10, close: 21, label: "10:00 am – 9:00 pm" },
  hoursNote: "Hours to be confirmed by the shop. Please call before visiting.",
  timezone: "Asia/Kolkata",
  mapsSearch: "https://www.google.com/maps/search/?api=1&query=Optical+Zone+Plot+4-J-7+Vigyan+Nagar+Kota+Rajasthan+324005",
  mapsDirections: "https://www.google.com/maps/dir/?api=1&destination=Optical+Zone+Plot+4-J-7+Vigyan+Nagar+Kota+Rajasthan+324005",
  services: ["Eyeglasses", "Branded sunglasses", "Eye testing", "Frame fitting"]
};

const SHAPES = ["Square", "Round", "Rectangle", "Aviator", "Cat-eye", "Wayfarer"];

const LENS_OPTIONS = [
  { id: "single", name: "Single vision", note: "Corrects one distance. Ask us about your prescription." },
  { id: "bluecut", name: "Blue-light filter", note: "Reduces glare from screens. Ask in store about options." },
  { id: "progressive", name: "Progressive", note: "Near, middle and distance in one lens. Eye test needed." },
  { id: "plano", name: "Plain lenses (no power)", note: "For style only, without a prescription." }
];

/* Sample catalogue. Replace with the real stock before launch.
   price: null -> the site shows "Price on enquiry". */
const PRODUCTS = [
  {
    id: "vigyan",
    name: "The Vigyan",
    category: "eyeglasses",
    shape: "Square",
    price: null,
    image: "images/product-vigyan.jpg",
    tags: ["Lightweight", "Everyday"],
    material: "Matte acetate",
    colors: [
      { name: "Matte Black", hex: "#1b1d22" },
      { name: "Navy", hex: "#23304f" },
      { name: "Honey", hex: "#b57a3e" }
    ],
    description: "A confident square rim for everyday wear. Matte acetate that stays quiet on the face and works from the office to a wedding.",
    details: [
      "Matte acetate frame, light on the nose",
      "Spring hinges for a comfortable, forgiving fit",
      "Lenses can be prescription, blue-light filter or plain",
      "Ask in store about fitting and adjustments"
    ]
  },
  {
    id: "kunadi",
    name: "The Kunadi",
    category: "eyeglasses",
    shape: "Round",
    price: null,
    image: "images/product-kunadi.jpg",
    tags: ["Metal", "Classic"],
    material: "Gold-tone metal",
    colors: [
      { name: "Gold", hex: "#c9a35c" },
      { name: "Silver", hex: "#aab2bd" }
    ],
    description: "A fine round metal frame with a soft, classic outline. Light enough to forget you are wearing it.",
    details: [
      "Thin gold-tone metal frame",
      "Adjustable nose pads",
      "Lenses can be prescription, blue-light filter or plain",
      "Ask in store about adjusting the fit"
    ]
  },
  {
    id: "talwandi",
    name: "The Talwandi",
    category: "eyeglasses",
    shape: "Rectangle",
    price: null,
    image: "images/product-talwandi.jpg",
    tags: ["Tortoise", "Versatile"],
    material: "Acetate",
    colors: [
      { name: "Tortoise", hex: "#8a5a33" },
      { name: "Crystal", hex: "#cfd6d2" },
      { name: "Ink", hex: "#20241f" }
    ],
    description: "A soft rectangular frame in a warm tortoise. It suits most face shapes and pairs well with both formal and casual outfits.",
    details: [
      "Acetate frame in a warm tortoise finish",
      "Keyhole bridge for a secure fit",
      "Lenses can be prescription, blue-light filter or plain",
      "Ask in store about adjusting the fit"
    ]
  },
  {
    id: "dadabari",
    name: "The Dadabari",
    category: "sunglasses",
    shape: "Aviator",
    price: null,
    image: "images/product-dadabari.jpg",
    tags: ["Gold frame", "Polarised options"],
    material: "Metal",
    colors: [
      { name: "Gold / Green", hex: "#3b4a3a" },
      { name: "Silver / Grey", hex: "#8e979f" }
    ],
    description: "A classic aviator with a gold frame and deep green gradient lenses. Built for bright afternoons on the road.",
    details: [
      "Lightweight metal frame",
      "Gradient tinted lenses",
      "Ask in store about UV protection and polarised options",
      "Can be fitted with prescription lenses"
    ]
  },
  {
    id: "nayapura",
    name: "The Nayapura",
    category: "sunglasses",
    shape: "Cat-eye",
    price: null,
    image: "images/product-nayapura.jpg",
    tags: ["Bold", "Statement"],
    material: "Acetate",
    colors: [
      { name: "Burgundy", hex: "#6b1f2a" },
      { name: "Black", hex: "#16161a" }
    ],
    description: "A glossy cat-eye for people who like their sunglasses to be part of the outfit. Dark brown lenses keep the glare down.",
    details: [
      "Glossy acetate frame with a lifted cat-eye shape",
      "Dark tinted lenses",
      "Ask in store about UV protection",
      "Can be fitted with prescription lenses"
    ]
  },
  {
    id: "chambal",
    name: "The Chambal",
    category: "sunglasses",
    shape: "Wayfarer",
    price: null,
    image: "images/product-chambal.jpg",
    tags: ["Classic", "Unisex"],
    material: "Acetate",
    colors: [
      { name: "Matte Black", hex: "#1b1d22" },
      { name: "Tortoise", hex: "#8a5a33" }
    ],
    description: "A timeless wayfarer shape with grey lenses. Simple, sturdy and easy to wear every day.",
    details: [
      "Sturdy acetate frame",
      "Grey tinted lenses",
      "Ask in store about UV protection",
      "Can be fitted with prescription lenses"
    ]
  }
];

/* Face-shape guide used by the frame finder on the home page. */
const FACE_SHAPES = [
  { id: "round", name: "Round", hint: "Soft, equal width and length", suggest: ["Square", "Rectangle", "Wayfarer"] },
  { id: "square", name: "Square", hint: "Strong jaw, broad forehead", suggest: ["Round", "Aviator", "Cat-eye"] },
  { id: "oval", name: "Oval", hint: "Longer than wide, balanced", suggest: ["Square", "Round", "Rectangle", "Aviator", "Cat-eye", "Wayfarer"] },
  { id: "heart", name: "Heart", hint: "Wider forehead, narrower chin", suggest: ["Round", "Aviator", "Wayfarer"] }
];

const EYE_TEST_STEPS = [
  { title: "Book by phone or WhatsApp", text: "Tell us a convenient time. Call to confirm the slot before you come in." },
  { title: "Get your eyes checked", text: "A short in-store eye test to check your vision and update your prescription." },
  { title: "Choose your frames", text: "Try frames on with your prescription in mind. We fit them to you before you leave." }
];

const FAQS = [
  {
    q: "Do you do eye tests in store?",
    a: "Yes. Call or WhatsApp us to book a time. We also recommend calling ahead to confirm availability."
  },
  {
    q: "Can I bring my old glasses or prescription?",
    a: "Yes, please do. Your old frames and prescription help us match a frame and lens to what you need."
  },
  {
    q: "Do you sell sunglasses as well as eyeglasses?",
    a: "Yes. We stock eyeglasses and branded sunglasses. Ask in store for the current range."
  },
  {
    q: "How much does a frame or lens cost?",
    a: "Prices depend on the frame and lens you pick. Enquire on WhatsApp or call the shop for a quote."
  },
  {
    q: "Are the frames on this website always in stock?",
    a: "Not necessarily. The website shows a sample of our range. Please check with the shop for current stock and prices."
  },
  {
    q: "Where exactly are you?",
    a: "We are at Plot No. 4-J-7, opposite Mayank School, Main Road, Vigyan Nagar, Kota 324005. Use the directions button on this site."
  }
];
