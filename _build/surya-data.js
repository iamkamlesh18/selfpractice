/* Surya Namaskar — reference data shared by yoga.html and music.html.
   Steps + breathing follow the classical 12-step sequence; mantras and their
   meanings follow Art of Living's Sun Salutation guide. */

const SURYA = [
  {
    n: 1, en: 'Prayer Pose', sk: 'Pranamasana', breath: 'Exhale', chakra: 'Anahata (heart)',
    does: 'Stand at the front of the mat, feet together. Bring the palms together at the heart, shoulders soft, eyes gently closed. Exhale as you arrive.',
    mantra: 'Om Mitraya Namah', meaning: 'Salutations to the friend of all',
    body: 'Balances the body and relaxes the nervous system.'
  },
  {
    n: 2, en: 'Raised Arms', sk: 'Hasta Uttanasana', breath: 'Inhale', chakra: 'Vishuddha (throat)',
    does: 'Inhale and sweep the arms overhead, biceps beside the ears. Reach up from the heels to the fingertips; a small, kind backbend is plenty.',
    mantra: 'Om Ravaye Namah', meaning: 'Salutations to the shining, radiant one',
    body: 'Stretches and tones the abdomen and expands the chest for a fuller breath.'
  },
  {
    n: 3, en: 'Standing Forward Fold', sk: 'Padahastasana', breath: 'Exhale', chakra: 'Svadhisthana (sacral)',
    does: 'Exhale and hinge from the hips, folding forward with a long spine. Keep the knees soft and place the palms beside the feet.',
    mantra: 'Om Suryaya Namah', meaning: 'Salutations to the sun, dispeller of darkness',
    body: 'Makes the waist and spine flexible and stretches the hamstrings.'
  },
  {
    n: 4, en: 'Equestrian Pose', sk: 'Ashwa Sanchalanasana', breath: 'Inhale', chakra: 'Ajna (third eye)',
    does: 'Inhale and take the right leg back, right knee to the floor. The left foot stays between the palms; press the hips forward and look up.',
    mantra: 'Om Bhanave Namah', meaning: 'Salutations to the one who illuminates',
    body: 'Strengthens the legs and makes the spine and neck flexible.'
  },
  {
    n: 5, en: 'Plank / Mountain', sk: 'Dandasana / Parvatasana', breath: 'Exhale', chakra: 'Vishuddha (throat)',
    does: 'Exhale and take the left leg back so the body forms one long line. Arms under the shoulders, hips level, gaze down and slightly forward.',
    mantra: 'Om Khagaya Namah', meaning: 'Salutations to the one who moves through the sky',
    body: 'Strengthens the arms and back and improves posture.'
  },
  {
    n: 6, en: 'Eight-Limbed Salute', sk: 'Ashtanga Namaskara', breath: 'Hold (breath suspended)', chakra: 'Manipura (solar plexus)',
    does: 'Gently lower the knees, chest and chin to the floor — eight points of contact. Keep the hips slightly lifted and the elbows tucked.',
    mantra: 'Om Pushne Namah', meaning: 'Salutations to the nourisher of all',
    body: 'Strengthens the chest and arms and gently tones the abdomen.'
  },
  {
    n: 7, en: 'Cobra', sk: 'Bhujangasana', breath: 'Inhale', chakra: 'Svadhisthana (sacral)',
    does: 'Inhale and slide forward, pressing the palms down to lift the chest. Elbows soft, shoulders away from the ears, gaze forward.',
    mantra: 'Om Hiranyagarbhaya Namah', meaning: 'Salutations to the golden cosmic self',
    body: 'Strengthens the spine, opens the lungs and relieves stiffness.'
  },
  {
    n: 8, en: 'Downward Dog', sk: 'Adho Mukha Svanasana', breath: 'Exhale', chakra: 'Vishuddha (throat)',
    does: 'Exhale and lift the hips high and back into an inverted V. Heels reach for the floor, head relaxed between the arms.',
    mantra: 'Om Marichaye Namah', meaning: 'Salutations to the one with infinite rays',
    body: 'Strengthens arms and legs and increases blood flow to the spine.'
  },
  {
    n: 9, en: 'Equestrian Pose', sk: 'Ashwa Sanchalanasana', breath: 'Inhale', chakra: 'Ajna (third eye)',
    does: 'Inhale and step the right foot forward between the palms, left knee down. This mirrors step four.',
    mantra: 'Om Adityaya Namah', meaning: 'Salutations to the infinite, son of Aditi',
    body: 'Stretches the hips and strengthens the legs.'
  },
  {
    n: 10, en: 'Standing Forward Fold', sk: 'Padahastasana', breath: 'Exhale', chakra: 'Svadhisthana (sacral)',
    does: 'Exhale and step the left foot forward to meet the right. Fold forward once more, palms beside the feet.',
    mantra: 'Om Savitre Namah', meaning: 'Salutations to the one responsible for life',
    body: 'Stretches the hamstrings and opens the hips, shoulders and arms.'
  },
  {
    n: 11, en: 'Raised Arms', sk: 'Hasta Uttanasana', breath: 'Inhale', chakra: 'Vishuddha (throat)',
    does: 'Inhale and roll the spine up, sweeping the arms overhead. Reach up more than you bend back.',
    mantra: 'Om Arkaya Namah', meaning: 'Salutations to the one worthy of praise and glory',
    body: 'Expands the chest and tones the abdominal muscles.'
  },
  {
    n: 12, en: 'Prayer Pose', sk: 'Pranamasana', breath: 'Exhale', chakra: 'Anahata (heart)',
    does: 'Exhale and return the hands to the heart. Stand still for one full breath — one round is complete.',
    mantra: 'Om Bhaskaraya Namah', meaning: 'Salutations to the light that illumines',
    body: 'Grounds the body and settles the breath before the next round.'
  }
];

module.exports = { SURYA };
