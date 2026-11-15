/* =========================================================
   builds music.html — curated YouTube meditations.
   Every video ID below was verified live via YouTube oEmbed
   before being added: it resolves to a public, embeddable video
   and its title matches the description used here.
   ========================================================= */
const { page } = require('./shell');

const VIDEOS = [
  // -------- Mantra & chant --------
  {
    id: 'pnkFJ0NQrkM', cat: 'mantra', title: 'The Deepest Om — 108 times',
    author: 'Meditative Mind', len: '30 min', c1: '#d8c48a', c2: '#8a6d2f',
    note: 'Om chanted 108 times — the classical mala count. Good for japa, or just for the back of a long practice.'
  },
  {
    id: 'vH11undyI2o', cat: 'mantra', title: 'Om Mantra Meditation — 11 minutes',
    author: 'Meditative Mind', len: '11 min', c1: '#e0cfa0', c2: '#8d6b2c',
    note: 'A short, complete practice. Eleven minutes fits into a morning before anyone else is awake.'
  },
  {
    id: '05c7SkvFY_o', cat: 'mantra', title: 'Om Namah Shivaya — 108 times',
    author: 'Anandmurti Gurumaa', len: 'chanting', c1: '#c9b2e8', c2: '#5b3f8f',
    note: 'A devotional chant to Shiva, in the traditional 108 repetitions. Slow, low and steadying.'
  },
  {
    id: 'J11VChbAboA', cat: 'mantra', title: 'Om Chanting 100 times',
    author: 'DhyaanGuru Dr. Nipun Aggarwal', len: 'guided', c1: '#e8cfa8', c2: '#8a6231',
    note: 'Guided om chanting with a clear, simple count — helpful if you have never chanted before.'
  },
  {
    id: '0D4V5awe-PA', cat: 'mantra', title: 'Tibetan monks chanting Om',
    author: 'Tibetan Singing Bells Monks', len: 'long', c1: '#c2cfe0', c2: '#4a5f7a',
    note: 'Field recording style chanting from a monastic setting. Deep, textured and very still.'
  },

  // -------- Frequencies --------
  {
    id: 'UuidkAboVQw', cat: 'frequency', title: 'Gate to Oneness — 963 Hz',
    author: 'Inner Lotus Music', len: 'crown chakra', c1: '#c9a4f7', c2: '#5a2a8f',
    note: 'The crown chakra Solfeggio tone. Pair with the chakra page timer if you are working through all seven.'
  },
  {
    id: 'C9hMaqQFKXk', cat: 'frequency', title: 'Inner Balance — 432 Hz + 111 Hz',
    author: 'Inner Lotus Music', len: 'long ambient', c1: '#8ee4d6', c2: '#2f7d74',
    note: 'Natural tuning blended with a low 111 Hz bed. The most "easy listening" track in the collection.'
  },
  {
    id: 'PFsGsmtPz24', cat: 'frequency', title: 'Tibetan healing sounds',
    author: 'Positive Energy Meditation Music', len: 'ambient', c1: '#a8c9e8', c2: '#3f5f8f',
    note: 'Bowl and bell textures rather than a single drone — good when a pure sine tone feels too clinical.'
  },

  // -------- Chakras --------
  {
    id: 'NF35xujl23c', cat: 'chakra', title: 'All 7 chakras — healing music',
    author: 'Tibetan Meditation Music', len: '3 h', c1: '#f7a9c9', c2: '#8f3a63',
    note: 'A long continuous piece cycling the seven chakra tones. Leave it on and let it carry you.'
  },
  {
    id: 'WZ6hDuI23qU', cat: 'chakra', title: 'Sacral chakra awakening — 303 Hz',
    author: 'Meditative Mind', len: 'focused', c1: '#f29a3d', c2: '#8a4b0c',
    note: 'A single-centre track. Sit with orange for the whole length, then switch to your next centre.'
  },

  // -------- Sleep & relaxation --------
  {
    id: 'Jyy0ra2WcQQ', cat: 'sleep', title: 'Sleep meditation — restore your mind',
    author: 'Guided meditation', len: 'long', c1: '#8b98c7', c2: '#2f3864',
    note: 'A guided voice to fall asleep to. Use headphones, low volume, and expect not to hear the end.'
  },
  {
    id: 'N4qCFFBrrgk', cat: 'sleep', title: 'Deep sleep — meditation music',
    author: 'Sleep music', len: 'all night', c1: '#7f8ee0', c2: '#2c356e',
    note: 'Drone-led sleep music with no sudden changes. Keep the volume just under audible.'
  },


  // -------- Studies & practice --------
  {
    id: 'IKzkc3FWx7g', cat: 'practice', title: 'Surya Namaskar — step by step',
    author: 'The Art of Living', len: 'tutorial', c1: '#f7e8c4', c2: '#8a6c25',
    note: 'The sun salutation walkthrough used on the yoga page. Watch it once, then practise along.'
  },
  {
    id: 'Ho68X9QKxfc', cat: 'practice', title: 'Sun salutation mantras',
    author: 'The Art of Living', len: 'chanting', c1: '#f0d9a0', c2: '#8a6c25',
    note: 'The twelve mantras chanted slowly — the audio companion to the mantra list on the yoga page.'
  },
  {
    id: 'eWLVBP3VrO4', cat: 'practice', title: 'Bhramari — humming bee breath',
    author: 'Breath practice', len: 'technique', c1: '#9fd6f5', c2: '#3f82b8',
    note: 'How bhramari actually sounds. Follow along after reading the steps on the breathing page.'
  },
  {
    id: 'A0X61Cukxg0', cat: 'practice', title: 'Guided breathing session',
    author: 'Breathwork', len: 'guided', c1: '#79f2dc', c2: '#2a7d70',
    note: 'A spoken breath count to follow. Nice when you would rather listen than watch an orb.'
  },

  // -------- Ambient / focus --------
  {
    id: 'N5hFNoRcMVU', cat: 'focus', title: 'Deep focus ambient',
    author: 'Ambient meditation', len: 'long', c1: '#a5b8d8', c2: '#3a4a6b',
    note: 'No lyrics, no rhythm to lock onto — good for reading or slow work.'
  },
  {
    id: 'DulNz2CkoHI', cat: 'focus', title: 'Calm ambient — rain and drones',
    author: 'Ambient meditation', len: 'long', c1: '#9ecfb8', c2: '#356b52',
    note: 'A softer alternative to the live soundscapes, for when you want one long unbroken bed.'
  },
  {
    id: 'wlN_3cu7Xe4', cat: 'focus', title: 'Candlelight ambient',
    author: 'Meditation music', len: 'evening', c1: '#e8b28a', c2: '#8a4b2c',
    note: 'Warm, low and slow. Suits an evening practice or dimming the room early.'
  }
];

const CATS = [
  ['all', 'All'],
  ['mantra', 'Mantra &amp; chant'],
  ['isha', 'Sounds of Isha'],
  ['frequency', 'Frequencies'],
  ['chakra', 'Chakras'],
  ['sleep', 'Sleep &amp; rest'],
  ['practice', 'Practice'],
  ['focus', 'Ambient &amp; focus']
];

/* =========================================================
   SOUNDS OF ISHA
   Every id below was verified live via YouTube oEmbed: it resolves
   to a public, embeddable video on the @soundsofisha channel and the
   title used here matches the real one. Hours come from the title.
   ========================================================= */
const ISHA = [
  {
    id: 'lacf-Wa4o_A', title: 'Guru Paduka Stotram', hours: '1 hour',
    tag: 'Guru', note: 'The verses in praise of the guru\u2019s sandals, extended to an unbroken hour.',
    c1: '#e8c88a', c2: '#8a5f1f'
  },
  {
    id: 'Z1DP7MKH9Rc', title: 'Nirvana Shatakam', hours: '1 hour',
    tag: 'Vairagya', note: 'Adi Shankara\u2019s six verses of disidentification. Long, spacious, very still.',
    c1: '#b9a9e8', c2: '#4a3a8f'
  },
  {
    id: '_Sbm7DSPddk', title: 'Brahmananda Swaroopa', hours: '1 hour',
    tag: 'Vairagya', note: 'A chant of the bliss of the infinite. One of the most-used Sounds of Isha pieces.',
    c1: '#9fd0e8', c2: '#2f6383'
  },
  {
    id: 'DjD4WXMt4No', title: 'Shambho — by Sadhguru', hours: '1 hour',
    tag: 'Shiva', note: 'The Shambho invocation sung by Sadhguru with Sounds of Isha.',
    c1: '#e8a87a', c2: '#8f4a1f'
  },
  {
    id: 'ijpTQkFCjW8', title: 'Yoga Yoga Yogeshwaraya', hours: '1 hour',
    tag: 'Adiyogi', note: 'The Adiyogi chant, one full hour — a staple of Satsang and practice.',
    c1: '#c9b0e8', c2: '#573f83'
  },
  {
    id: 'dJON7OZYHcY', title: 'Na Hi Shiva Sneha', hours: 'Damaru',
    tag: 'Adiyogi Chants', note: 'From the Damaru / Adiyogi chants collection.',
    c1: '#a9c9e8', c2: '#35597f'
  },
  {
    id: 'pv7ZiedzncE', title: 'Guru Ashtakam', hours: 'Damaru',
    tag: 'Adiyogi Chants', note: 'Eight verses in praise of the guru, from the Adiyogi chant series.',
    c1: '#e8cfa0', c2: '#8a6524'
  },
  {
    id: 'GemW0xWAi6c', title: 'Adiyoginam Pranamamyaham', hours: 'Damaru',
    tag: 'Adiyogi Chants', note: 'The first of the Adiyogi chants \u2014 bowing to the first yogi.',
    c1: '#b0c4e8', c2: '#3a5480'
  },
  {
    id: 'iUrjWDnyFCM', title: 'Yogeshwaraya Mahadevaya', hours: 'stotram',
    tag: 'Shiva', note: 'Sadhguru and Sounds of Isha — a Shiva stotram.',
    c1: '#d8b8e8', c2: '#6a3f83'
  },
  {
    id: 'VECfX823mxU', title: 'Chandrashekhara Ashtakam', hours: 'Damaru',
    tag: 'Adiyogi Chants', note: 'Eight verses to Chandrashekhara (Shiva crowned with the moon).',
    c1: '#a8c8e0', c2: '#33587f'
  },
  {
    id: 'sfdQwmgaS1M', title: 'Kalabhairavashtakam', hours: 'Trigun',
    tag: 'Trigun', note: 'The Ashtakam to Kala Bhairava, from the Trigun collection.',
    c1: '#d9a8a8', c2: '#7a3232'
  },
  {
    id: '6rJExE8HGVg', title: 'Bilvashtakam', hours: 'Trigun',
    tag: 'Trigun', note: 'The eight verses offered with bilva leaves, from Trigun.',
    c1: '#c2d9a8', c2: '#46692f'
  },
  {
    id: 'FEGlQt11p4E', title: 'Bhairavi Jaya Bhairavi', hours: 'kirtan',
    tag: 'Devotional', note: 'A flowing homage to Bhairavi.',
    c1: '#e0b8c8', c2: '#83405a'
  },
  {
    id: '41cn42LltI4', title: 'Kya Karun', hours: 'Chandrajeevan',
    tag: 'Devotional', note: 'A quieter, reflective piece with Chandrajeevan.',
    c1: '#c8b8a8', c2: '#6b5340'
  },
  {
    id: 'luwe3NKvxos', title: 'Alakh Niranjan', hours: 'bhajan',
    tag: 'Devotional', note: 'A traditional chant of the formless one, with Ram Miriyala.',
    c1: '#b8c8d8', c2: '#3f5872'
  },
  {
    id: 'yh1uxjP7nYI', title: 'Aum Namah Shivaya', hours: 'Vairagya',
    tag: 'Shiva', note: 'The five-syllable mantra to Shiva.',
    c1: '#a8b8e8', c2: '#35458f'
  },
  {
    id: 'Fh53p0Tnnxg', title: 'Amla — Yoga Padhi', hours: 'instrumental',
    tag: 'Instrumental', note: 'Meditative instrumental music \u2014 no vocals, good for practice.',
    c1: '#b8d9c8', c2: '#2f6b52'
  },
  {
    id: '4smH2362ulU', title: 'Guru Paduka Stotram', hours: 'short',
    tag: 'Guru', note: 'A shorter recording of the same stotram \u2014 use it to learn the melody.',
    c1: '#e8d4a8', c2: '#8a6a2a'
  }
];

/* ---------- More instrumental & chant from Sounds of Isha ---------- */
const ISHA_MORE = [
  {
    id: '4ZtihFRxK28', title: 'Bloom — Yoga Padhi', hours: 'instrumental', tag: 'Yoga Padhi',
    note: 'Meditative instrumental for practice \u2014 no vocals.', c1: '#b8e0c8', c2: '#2f6b4a'
  },
  {
    id: '5XJF56WrFoM', title: 'Desh — Yoga Padhi', hours: 'instrumental', tag: 'Yoga Padhi',
    note: 'The Desh raga as a long meditative instrumental.', c1: '#c8dcb0', c2: '#4a6b2a'
  },
  {
    id: 'wPxyhivAWNU', title: 'Wholeness — Bansuri', hours: 'instrumental', tag: 'Bansuri',
    note: 'Bansuri flute by Sameer Rao with Sounds of Isha.', c1: '#a8d8e0', c2: '#2f6675'
  },
  {
    id: 'z1QDVL_IxI8', title: 'Damaru Wala', hours: 'live', tag: 'Guru',
    note: 'Nihar Shembekar with Sounds of Isha, live at Mahashivratri 2025.', c1: '#e8c0a0', c2: '#8a4f24'
  },
  {
    id: 'TH8Y7DhLPOA', title: 'Ek Nazar Dekha Tujhe', hours: 'Guru Purnima', tag: 'Guru',
    note: 'A tribute to Sadhguru on Guru Purnima.', c1: '#e0cfa8', c2: '#7a6228'
  },
  {
    id: 'vI9st5RjkBw', title: 'Sadhguru Raya', hours: 'live', tag: 'Guru',
    note: 'Ram Miriyala and Parthiv Gohil with Sounds of Isha, live at Guru Purnima 2025.', c1: '#d8b0e0', c2: '#6a3f83'
  },
  {
    id: 'w3IMkVKh5lU', title: 'Sadhguru Raya — high quality audio', hours: 'HQ audio', tag: 'Guru',
    note: 'The high-quality audio version from Guru Purnima 2024.', c1: '#c9b0e8', c2: '#573f83'
  },
  {
    id: '4JcquT3A78o', title: 'Sadhgurum tam Namami', hours: 'HQ audio', tag: 'Guru',
    note: 'Devotional chant from Guru Purnima 2024, high-quality audio.', c1: '#b0c4e8', c2: '#3a5480'
  },
  {
    id: 'xAG4mZmoH1o', title: 'Payoji Maine', hours: 'live', tag: 'Devotional',
    note: 'Swagat Rathod with Sounds of Isha, live at Guru Purnima 2025.', c1: '#e8d0a8', c2: '#8a6a2a'
  },
  {
    id: 'US9FsAA9U0Q', title: 'The Adiyogi Song — Adiguruve', hours: 'ode', tag: 'Adiyogi',
    note: 'An ode to Adiyogi \u2014 the first yogi.', c1: '#a9c9e8', c2: '#35597f'
  },
  {
    id: 'mUcAkCi8Dtw', title: 'Ekam Nityam', hours: 'live', tag: 'Devotional',
    note: 'Live at Guru Purnima 2025.', c1: '#c8d8b0', c2: '#4a6b30'
  },
  {
    id: '_PBzu_-_ul4', title: 'Gauranga', hours: 'Damaru', tag: 'Adiyogi Chants',
    note: 'Adiyogi Chants from the Damaru collection.', c1: '#f0c8a8', c2: '#8a5a2a'
  },
  {
    id: 'e-w7BuYOYKY', title: 'In Is The Only Way Out', hours: 'fusion', tag: 'Musical',
    note: 'An Indian\u2013Western musical fusion on the journey of the self.', c1: '#b8c8e8', c2: '#3f5283'
  },
  {
    id: 'LVojRjzUJLE', title: 'Patanjali Yoga Sutras — musical rendition', hours: 'Sadhguru', tag: 'Yoga Sutras',
    note: 'A musical rendition of Patanjali\u2019s Yoga Sutras, for International Day of Yoga.', c1: '#d8c4a0', c2: '#7f6329'
  },

  /* --- from the Sounds of Isha channel listing (all verified) --- */
  { id: '0OFIjRfNU6E', title: 'Namah Aum Namah Shivaya', hours: 'Mahashivratri', tag: 'Shiva',
    note: 'A devotional Shiva chant released for Mahashivratri.', c1: '#a8b8e8', c2: '#35458f' },
  { id: 'BfCf7pMQNkU', title: 'Shiv Kailasho Ke Vasi', hours: 'Mohit Chauhan', tag: 'Shiva',
    note: 'Sadhguru sings with Mohit Chauhan.', c1: '#a9c9e8', c2: '#35597f' },
  { id: 'd2etuly9Zfc', title: 'Shiva Shiva Shiva Shambho', hours: 'Prithvi Gandharv', tag: 'Shiva',
    note: 'A Mahashivratri chant with Prithvi Gandharv.', c1: '#b0c4e8', c2: '#3a5480' },
  { id: 'uWYdEqdMHYM', title: 'Mera Bhola Hai Bandhari', hours: 'Swagat Rathod', tag: 'Shiva',
    note: 'A folk-flavoured Shiva bhajan.', c1: '#c8b8e8', c2: '#553f83' },
  { id: 'MiwgNHbdMfk', title: 'Babam Bam Lehri', hours: 'Aishwarya Nigam', tag: 'Shiva',
    note: 'A rousing Mahashivratri piece.', c1: '#e8c0a0', c2: '#8a4f24' },
  { id: 'v6OC7H-Gzkw', title: 'Kya Leke Aaya Jagat Mai', hours: 'folk', tag: 'Folk',
    note: 'A folk song asking what any of us brought into this world.', c1: '#d8c8a8', c2: '#7a6030' },
  { id: '6nJ-hWLNCjg', title: 'Jaya Sada Shiva', hours: 'Sachet Tandon', tag: 'Shiva',
    note: 'With Sachet Tandon and Vishal Khatri, for Sawan.', c1: '#b8c8e8', c2: '#3f5283' },
  { id: 'VBkHP4QZU1E', title: 'Kalabhairava Chant', hours: 'Sadhguru', tag: 'Kalabhairava',
    note: 'The Kalabhairava chant, led by Sadhguru.', c1: '#b8c8d8', c2: '#3f5872' },

  { id: '74KWY5lCfD8', title: 'Man Lago Mero Yaar Fakiri Mein', hours: 'Kabir', tag: 'Kabir',
    note: 'A Kabir bhajan about the fakir\u2019s contentment.', c1: '#d8c8b0', c2: '#7a6040' },
  { id: 'reb5fw5RUn8', title: 'Ae Ri Sakhi More', hours: 'Parthiv Gohil', tag: 'Devotional',
    note: 'A devotional with Parthiv Gohil and Prithvi Gandharv.', c1: '#e8c8d8', c2: '#8a4a6a' },
  { id: '4e1nOze-5Yw', title: 'Dam Da Dam — studio version', hours: 'studio', tag: 'Devotional',
    note: 'The studio recording with Aishwarya Nigam.', c1: '#e0b8a0', c2: '#8a4a24' },
  { id: '3zRi2IAbNJs', title: 'Dam Da Dam — Zindagi Jiya Main Yaara', hours: 'live', tag: 'Devotional',
    note: 'The Mahashivratri live version.', c1: '#d8b0a0', c2: '#7a3f24' },
  { id: 'rnE3m446n3Y', title: 'Delulu to Solulu', hours: 'Miracle of Mind', tag: 'Modern',
    note: 'A contemporary piece from the Miracle of Mind series.', c1: '#c8b8e8', c2: '#553f83' },
  { id: 'TWf_eX_wAHA', title: 'Buddham Sharanam Gacchami', hours: 'Buddha Purnima', tag: 'Buddha',
    note: 'The refuge chant, for Buddha Purnima.', c1: '#c8c8d8', c2: '#4a4a60' },
  { id: 'UE8n5NA_DyQ', title: 'Ennappan Allava', hours: 'Tamil', tag: 'Dhyanalinga',
    note: 'Papanasam Sivan\u2019s Tamil song, with Akshit Nirupam.', c1: '#e8d0a8', c2: '#8a6a2a' },
  { id: 'f5rGll4VGQo', title: 'Mei Porul Kandu', hours: 'Tamil', tag: 'Shiva',
    note: 'A Tamil song with Sandeep Narayan.', c1: '#c8d8b0', c2: '#4a6b30' },
  { id: 'D0KdiOJPWTA', title: 'Chandrachooda', hours: 'Purandara Dasa', tag: 'Bhajan',
    note: 'Purandara Dasa\u2019s bhajan, for the Dhyanalinga consecration day.', c1: '#b8c8d8', c2: '#3f5872' },
  { id: 'YntYzVwmI8M', title: 'Sojugada Sooju Mallige', hours: 'Kannada', tag: 'Folk',
    note: 'A Kannada folk song.', c1: '#c8d8b8', c2: '#4a6b3a' },
  { id: '0f2PS-40tjY', title: 'Sneha Tappida', hours: 'Vachana', tag: 'Vachana',
    note: 'A vachana by Basavanna, in Kannada.', c1: '#b8d0c0', c2: '#3a6b52' },
  { id: 'sPlP2N6MD0M', title: 'Nudidare Muttina Haradantirabeku', hours: 'Vachana', tag: 'Vachana',
    note: 'Basavanna\u2019s vachana on speech as a string of pearls.', c1: '#b8ccc0', c2: '#3a6252' },
  { id: 'zrkoAw7On0s', title: 'Ullavaru Shivalaya Maduvaru', hours: 'Vachana', tag: 'Vachana',
    note: 'Basavanna\u2019s vachana on the temple within.', c1: '#b0c8c0', c2: '#355f52' },
  { id: 'kO-EVegh9-E', title: 'Ethana Mamara', hours: 'Allama Prabhu', tag: 'Vachana',
    note: 'A vachana by Allama Prabhu, in Kannada.', c1: '#b8d0c8', c2: '#3a6b60' },
  { id: 'mG9_sKHTcMk', title: 'Vachanadalli Namamruta Tumbi', hours: 'Vachana', tag: 'Vachana',
    note: 'A Basavanna vachana filled with the nectar of the name.', c1: '#b4ccc4', c2: '#386457' },
  { id: 'vSlJwPEA1HM', title: 'Bettada Melondu', hours: 'Akka Mahadevi', tag: 'Vachana',
    note: 'Akka Mahadevi\u2019s vachana, with Ram Miriyala.', c1: '#c0d0c8', c2: '#3f6b60' },
  { id: '8LZgV1tJiEw', title: 'Aigiri Nandini — Bhairavi Stotram', hours: 'Devi', tag: 'Devi',
    note: 'Adi Shankaracharya\u2019s hymn to the Devi, from Ye Devi.', c1: '#f0b8c8', c2: '#8a3f50' },
  { id: '3OqX-c9s2HU', title: 'Ya Devi Sarva Bhuteshu', hours: 'Devi Suktam', tag: 'Devi',
    note: 'The Devi Suktam on the presence of the goddess in all beings.', c1: '#e8b0c8', c2: '#8a3058' },
  { id: 'VKlBYhHkdcg', title: 'Na Taato Na Maata', hours: 'Bhairavi Stavan', tag: 'Devi',
    note: 'Adi Shankaracharya\u2019s stavan — \u201cnot father, not mother\u201d.', c1: '#e8b8c0', c2: '#8a3a48' },
  { id: 'hk7LbfWOomM', title: 'Naga Stotram — Ye Devi reprise', hours: 'Devi', tag: 'Devi',
    note: 'A reprise from the Ye Devi collection, for Navratri.', c1: '#e0b8c0', c2: '#7a3a48' },
  { id: 'yp0bZDSm05Q', title: 'Linga Bhairavi Shayana Arati', hours: 'Arijit Singh', tag: 'Devi',
    note: 'The Linga Bhairavi arati, sung by Arijit Singh.', c1: '#f0b0b8', c2: '#8a3038' }
];

/* ---------- Marathi & devotional from other artists ---------- */
const DEVOTIONAL_MORE = [
  {
    id: 'haGL4d2qCRY', title: 'Anand Potat — Guru Darshan', hours: 'Marathi', by: 'Nihar Shembekar', tag: 'Marathi',
    note: 'A Marathi devotional song by Nihar Shembekar.', c1: '#f0b8c0', c2: '#8a3f4a'
  },
  {
    id: 'oHM4zm8OdGU', title: 'Yei Ho Vitthale — Vitthal Aarti', hours: 'aarti', by: 'Nihar Shembekar', tag: 'Vitthal',
    note: 'A Vitthal aarti, sung by Nihar Shembekar.', c1: '#e8b8a8', c2: '#8a4a35'
  },

  {
    id: 'BlEXTDMsBII', title: 'Adi Tuch Anti Tuch Swami', hours: 'Marathi', by: 'Abhay Jodhpurkar', tag: 'Marathi',
    note: 'Sung by Abhay Jodhpurkar.', c1: '#d8b8c8', c2: '#7a3f5a'
  },
  {
    id: 'sHVUlXAvCd0', title: 'Deh Vitthal', hours: 'WARI 2024', by: 'Avadhoot Gandhi', tag: 'Marathi',
    note: 'From the Wari pilgrimage film, sung by Avadhoot Gandhi.', c1: '#e0c0a0', c2: '#8a5a2a'
  },
  {
    id: 'xaUvx0IILW4', title: 'Jagnyache Deva', hours: 'Marathi', by: 'Swapnil Bandodkar', tag: 'Marathi',
    note: 'A Marathi devotional song by Swapnil Bandodkar.', c1: '#c8b8d8', c2: '#5f4a7a'
  },
  {
    id: 'Y8QyyACKa70', title: 'Majhi Pandharichi Maay', hours: 'film · Mauli', by: 'Ajay-Atul', tag: 'Vitthal',
    note: 'From the film Mauli, composed by Ajay-Atul.', c1: '#e8c8b0', c2: '#8a5230'
  },
  {
    id: 'ycEI-_NXvEo', title: 'Malharvari', hours: 'Marathi', by: 'Shahir Sable', tag: 'Marathi',
    note: 'A traditional Marathi devotional sung by Shahir Sable.', c1: '#c8d0b0', c2: '#536b30'
  },
  {
    id: '1QjDwNpQy88', title: 'Ude Ga Ambe Ude — Gondhal', hours: 'Navratri', by: 'Gondhal song', tag: 'Devi',
    note: 'A gondhal song for Navratri.', c1: '#e8b0b0', c2: '#8a3030'
  },
  {
    id: '8H0HEZDvYVw', title: 'Durge Durgat Bhari', hours: 'Devi aarti', by: 'Ajay-Atul', tag: 'Devi',
    note: 'The Devi aarti, composed by Ajay-Atul.', c1: '#e0a8b8', c2: '#8a3050'
  },
  {
    id: '2pVK0kxgfE4', title: 'Gondhal — Jaundya Na Balasaheb', hours: 'film song', by: 'Ajay-Atul', tag: 'Devi',
    note: 'A gondhal from the film, composed by Ajay-Atul.', c1: '#d8a8c8', c2: '#7a305f'
  },

  {
    id: 'zEGD7ZDcHMo', title: 'Om Namah Shivaya', hours: 'kirtan', by: 'Krishna Das', tag: 'Kirtan',
    note: 'Krishna Das \u2014 long-form kirtan on the five-syllable mantra.', c1: '#a8b8e8', c2: '#35458f'
  },
  {
    id: '3WrImrl2dmI', title: '4AM Chalisa', hours: 'live', by: 'Krishna Das', tag: 'Kirtan',
    note: 'Krishna Das live, with lyrics.', c1: '#b0c0e0', c2: '#3a4a7f'
  },
  {
    id: '-x9Ly8ZjA18', title: "Bernie's Chalisa", hours: 'chalisa', by: 'Krishna Das', tag: 'Kirtan',
    note: 'A chalisa in the Krishna Das repertoire.', c1: '#a8b8d8', c2: '#354563'
  },
  {
    id: 'uV5zVWTz-Dk', title: 'Hare Krishna Krishna Kirtan', hours: 'kirtan', by: 'Hari Om Sharan', tag: 'Kirtan',
    note: 'A Hare Krishna kirtan by Hari Om Sharan.', c1: '#c8b8e0', c2: '#5f3f83'
  },
  {
    id: 'i4BGIBsTWS4', title: 'Prasanna Vadanam Mantra', hours: 'slowed', by: 'slowed + reverb', tag: 'Mantra',
    note: 'The Prasanna Vadanam shloka, slowed and reverbed.', c1: '#f0b8d0', c2: '#8a3f61'
  },
  {
    id: 'nRJD6kldukQ', title: 'Raghupathi Raghava Rajaram', hours: 'with lyrics', by: 'Rama mantra', tag: 'Ram',
    note: 'The Rama mantra with original lyrics.', c1: '#e8c8a8', c2: '#8a5a24'
  },
  {
    id: 'gsuskHo4Bqk', title: 'Radhe Radhe Shyamal Pyari', hours: 'bhajan', by: 'Hari Om Sharan', tag: 'Radha-Krishna',
    note: 'A Radha\u2013Krishna bhajan by Hari Om Sharan and Nandini Sharan.', c1: '#f0b8c8', c2: '#8a3f50'
  },
  {
    id: 'tZKHQD6oC2s', title: 'Ram Ram Jai Raja Ram', hours: 'Ram dhun', by: 'Shankar Mahadevan', tag: 'Ram',
    note: 'The Shri Ram dhun, sung by Shankar Mahadevan.', c1: '#e8c0a0', c2: '#8a4f24'
  },
  {
    id: 'CH8sA9Pd6Gc', title: 'Raghunandana', hours: 'film · HanuMan', by: 'GowraHari & ensemble', tag: 'Hanuman',
    note: 'From the film HanuMan, for Hanuman Jayanti.', c1: '#f0c8a0', c2: '#8a5520'
  },
  {
    id: 'VJ-o8y8JqCQ', title: 'Jai Shri Ram', hours: 'film · Adipurush', by: 'Ajay-Atul', tag: 'Ram',
    note: 'From Adipurush, composed by Ajay-Atul.', c1: '#e0b898', c2: '#8a5024'
  },
  {
    id: '2aJJ28mIrco', title: 'Gangadhara Shankara', hours: 'film · Akhanda 2', by: 'Thaman S', tag: 'Shiva',
    note: 'A Shiva song from the film Akhanda 2, by Thaman S.', c1: '#a8c8e0', c2: '#33587f'
  },
  {
    id: 'MvNyxxK07H4', title: 'Kalbhairavastakam', hours: 'ashtakam', by: 'Shankar Mahadevan', tag: 'Shiva',
    note: 'The Kalabhairava Ashtakam, sung by Shankar Mahadevan.', c1: '#b8c8d8', c2: '#3f5872'
  },
  {
    id: 'PaoeGgJs3Ac', title: 'Har Har Gange', hours: 'with lyrics', by: 'Arijit Singh', tag: 'Ganga',
    note: 'A Ganga devotional sung by Arijit Singh.', c1: '#a8c8d8', c2: '#2f5a75'
  },
  {
    id: 'kJkaEOaNM4A', title: 'Slow yoga practice video', hours: 'slow practice', by: 'Craig Prues', tag: 'Practice',
    note: 'A slow, meditative yoga practice film — good to follow along with or keep in the background while you sit.', c1: '#b8d8c8', c2: '#2f6b52'
  }
].filter((v) => !v.skip);

/* Same list, but from other channels \u2014 kept separate so attribution is honest */
const OTHER_DEVOTIONAL = [
  {
    id: 'GePN4-Cajvk', title: 'Vedic Chanting', hours: 'Manish Vyas', tag: 'Chant',
    note: 'Traditional Vedic recitation by Manish Vyas.', c1: '#e0cfa8', c2: '#7a6228'
  },
  {
    id: 'l3CunU4M0jQ', title: 'Prasanna Vadanam Shloka', hours: 'shloka', tag: 'Radha-Krishna',
    note: 'A short shloka offered to Radha and Krishna.', c1: '#f0b8d0', c2: '#8a3f61'
  },
  {
    id: 'CYT7WfoTZZ4', title: 'Bhaja Govindam — with lyrics & meaning', hours: 'with lyrics', tag: 'Vedanta',
    note: 'Adi Shankara\u2019s Moha Mudgaram, sung with text and translation.', c1: '#d8b8a8', c2: '#7a4a35'
  },
  {
    id: 'IdLhCGU78j4', title: 'Ram Siya Ram', hours: 'Sonu Nigam', tag: 'Ramayan',
    note: 'The Ramayan chaupai, sung by Sonu Nigam.', c1: '#e8c0a0', c2: '#8a4f24'
  },
  {
    id: 'dJON7OZYHcY', title: 'Na Hi Shiva Sneha', hours: 'Damaru', tag: 'Shiva',
    note: 'Kept here as it also appears in the Isha playlist.', c1: '#a9c9e8', c2: '#35597f', hidden: true
  }
].filter((v) => !v.hidden);

/* A video may appear in several of the source playlists \u2014 show it once. */
function uniqueById(list) {
  const seen = new Set();
  return list.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}

const ISHA_LIST = uniqueById([...ISHA, ...ISHA_MORE]);
const OTHER_LIST = uniqueById([...OTHER_DEVOTIONAL, ...DEVOTIONAL_MORE]);

/* The main shelf must not repeat anything already featured above. */
const FEATURED_IDS = new Set([...ISHA_LIST, ...OTHER_LIST].map((v) => v.id));
const SHELF = VIDEOS.filter((v) => !FEATURED_IDS.has(v.id));

/* =========================================================
   The Sounds of Isha card: portrait thumbnail + tag + note
   ========================================================= */
const ishaCard = (v, i) => `
      <article class="isha-card reveal" data-song="${v.id}" data-delay="${(i % 3) * 70}"
        style="--ic1:${v.c1};--ic2:${v.c2}">
        <button class="isha-card__thumb" data-video="${v.id}"
          data-title="${v.title.replace(/"/g, '')}" data-author="${v.by || 'Sounds of Isha'}"
          aria-label="Play ${v.title.replace(/"/g, '')} by ${v.by || 'Sounds of Isha'}">
          <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" />
          <span class="isha-card__play"><svg viewBox="0 0 24 24" class="ico"><use href="#i-play"></use></svg></span>
          <span class="isha-card__len">${v.hours}</span>
        </button>
        <div class="isha-card__meta">
          <span class="isha-card__tag">${v.tag}</span>
          <h3>${v.title}</h3>
          ${v.by ? `<p class="isha-card__by">${v.by}</p>` : ''}
          <p>${v.note}</p>
          <a class="isha-card__yt" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener noreferrer">Open on YouTube</a>
        </div>
      </article>`;

const card = (v, i) => `
      <article class="track reveal" data-cat="${v.cat}" data-delay="${(i % 3) * 70}"
        style="--c1:${v.c1};--c2:${v.c2}">
        <button class="track__thumb" data-video="${v.id}" data-title="${v.title.replace(/"/g, '')}" data-author="${v.author.replace(/"/g, '')}"
          aria-label="Play ${v.title.replace(/"/g, '')} by ${v.author.replace(/"/g, '')}">
          <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" />
          <span class="track__play"><svg viewBox="0 0 24 24" class="ico"><use href="#i-play"></use></svg></span>
          <span class="track__len">${v.len}</span>
        </button>
        <div class="track__meta">
          <h3>${v.title}</h3>
          <p class="track__by">${v.author}</p>
          <p class="track__note">${v.note}</p>
        </div>
      </article>`;

const body = `
  <section class="page-hero">
    <div>
      <p class="breadcrumb reveal"><a href="index.html">Home</a><span>/</span>Music</p>
      <h1 class="page-hero__title reveal" data-delay="80">Music to <em>sit in</em>.</h1>
      <p class="page-hero__lead reveal" data-delay="160">
        Sounds of Isha chants and stotrams, plus a hand-picked shelf of YouTube meditations —
        mantra, healing frequencies, chakra music, sleep drones and ambient.
        Press a cover to play it here, or open it on YouTube to support the creator.
      </p>
    </div>
    <div class="page-hero__aside">
      <div class="stat-pill reveal" data-delay="220"><span>Tracks</span><b>${SHELF.length + ISHA_LIST.length + OTHER_LIST.length}</b></div>
      <div class="stat-pill reveal" data-delay="300"><span>Categories</span><b>${CATS.length - 1}</b></div>
      <div class="stat-pill reveal" data-delay="380"><span>Playback</span><b>YouTube</b></div>
    </div>
  </section>

  <nav class="subnav" aria-label="Music sections">
    <a href="#isha" class="is-current">Sounds of Isha</a>
    <a href="#shelf">The shelf</a>
    <a href="#devotional">Other devotional</a>
    <a href="#also">Also on Sōma</a>
  </nav>

  <section class="section" id="isha">
    <div class="section__head">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Featured channel</p>
      <h2 class="section__title reveal">Sounds of <em>Isha</em></h2>
      <p class="section__lead reveal">
        The chant and stotram collection from Isha, including the one-hour versions.
        Press a cover to play it here, or open it on YouTube to support the channel directly.
      </p>
    </div>

    <div class="isha-grid">
${ISHA_LIST.map(ishaCard).join('\n')}
    </div>

    <div class="isha-credit reveal">
      <svg viewBox="0 0 24 24" class="ico"><use href="#i-music"></use></svg>
      <p>
        All music in this section is by
        <a href="https://www.youtube.com/@soundsofisha" target="_blank" rel="noopener noreferrer">Sounds of Isha</a>
        and plays through YouTube's own player, so views and credit go to them.
        We host none of these audio files.
      </p>
    </div>
  </section>

  <section class="section" id="shelf">
    <div class="section__head">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> The collection</p>
      <h2 class="section__title reveal">Pick a <em>mood</em></h2>
      <p class="section__lead reveal">Everything here plays from YouTube, so the audio quality and length are the original creator's. Support them if something helps.</p>
    </div>

    <div class="track-filters reveal" role="group" aria-label="Filter music">
      ${CATS.map(([k, label], i) => `<button class="chip${i === 0 ? ' is-active' : ''}" data-filter="${k}">${label}</button>`).join('\n      ')}
    </div>

    <div class="track-grid" id="trackGrid">
${SHELF.map(card).join('\n')}
    </div>

    <p class="track-empty" id="trackEmpty" hidden>No tracks in this category yet.</p>
  </section>

  <section class="section" id="devotional">
    <div class="section__head">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> From elsewhere on YouTube</p>
      <h2 class="section__title reveal">Other <em>devotional</em></h2>
      <p class="section__lead reveal">Chants and shlokas from other channels, kept separate so each creator gets their own credit.</p>
    </div>

    <div class="isha-grid">
${OTHER_LIST.map((v, i) => `
      <article class="isha-card reveal" data-song="${v.id}" data-delay="${(i % 3) * 70}"
        style="--ic1:${v.c1};--ic2:${v.c2}">
        <button class="isha-card__thumb" data-video="${v.id}"
          data-title="${v.title.replace(/"/g, '')}" data-author="${(v.by || v.hours).replace(/<[^>]+>/g, '')}"
          aria-label="Play ${v.title.replace(/"/g, '')}">
          <img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" />
          <span class="isha-card__play"><svg viewBox="0 0 24 24" class="ico"><use href="#i-play"></use></svg></span>
          <span class="isha-card__len">${v.hours}</span>
        </button>
        <div class="isha-card__meta">
          <span class="isha-card__tag">${v.tag}</span>
          <h3>${v.title}</h3>
          ${v.by ? `<p class="isha-card__by">${v.by}</p>` : ''}
          <p>${v.note}</p>
          <a class="isha-card__yt" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener noreferrer">Open on YouTube</a>
        </div>
      </article>`).join('\n')}
    </div>
  </section>

  <section class="section" id="also">
    <div class="section__head section__head--center">
      <p class="eyebrow reveal"><span class="eyebrow__dot"></span> Meanwhile</p>
      <h2 class="section__title reveal">Made on <em>this site</em></h2>
      <p class="section__lead reveal">Everything that isn't YouTube is generated live in your browser — no files, no streaming, no ads.</p>
    </div>

    <div class="paths">
      <a href="frequencies.html" class="path-card reveal" style="--pc:rgba(139,123,247,.32); --pc-h:rgba(139,123,247,.9); --pcfg:#b4a6ff">
        <span class="path-card__icon"><svg viewBox="0 0 24 24"><use href="#i-wave"></use></svg></span>
        <h3>Pure tones</h3>
        <p>Every Solfeggio frequency from 174 to 963 Hz as a clean sine tone you can leave running.</p>
        <span class="path-card__more">Open frequencies <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"></use></svg></span>
      </a>

      <a href="breathing.html#sounds" class="path-card reveal" data-delay="90" style="--pc:rgba(121,242,220,.3); --pc-h:rgba(121,242,220,.85); --pcfg:#79f2dc">
        <span class="path-card__icon"><svg viewBox="0 0 24 24"><use href="#i-wind"></use></svg></span>
        <h3>Soundscapes</h3>
        <p>Rain, ocean, forest and singing bowl — layered live, so they never loop or repeat.</p>
        <span class="path-card__more">Open soundscapes <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"></use></svg></span>
      </a>

      <a href="chakras.html" class="path-card reveal" data-delay="180" style="--pc:rgba(247,169,201,.28); --pc-h:rgba(247,169,201,.85); --pcfg:#f7a9c9">
        <span class="path-card__icon"><svg viewBox="0 0 24 24"><use href="#i-flame"></use></svg></span>
        <h3>Chakra tones</h3>
        <p>The same seven frequencies, matched to their colours, each with a timer you set.</p>
        <span class="path-card__more">Open chakras <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"></use></svg></span>
      </a>
    </div>
  </section>

  <section class="cta">
    <div class="cta__ring" aria-hidden="true"></div>
    <div class="cta__inner reveal">
      <svg viewBox="0 0 48 48" class="cta__mark"><use href="#logo-mark"></use></svg>
      <h2>Sound is easier<br /><em>with a breath.</em></h2>
      <p>Put a pattern on underneath and let the orb keep time for you.</p>
      <a href="breathing.html" class="btn btn--primary">
        <span>Start breathing</span><span class="btn__ripple"></span>
        <svg viewBox="0 0 24 24" class="ico"><use href="#i-arrow"></use></svg>
      </a>
    </div>
  </section>`;

console.log(page({
  file: 'music.html',
  title: 'Music — Sōma',
  desc: 'Hand-picked YouTube meditations: Om chanting, healing frequencies, chakra music, sleep drones and ambient focus music, plus live tones and soundscapes made on Sōma.',
  page: 'music',
  body,
  scripts: ['assets/js/music.js'],
  modals: true
}));
