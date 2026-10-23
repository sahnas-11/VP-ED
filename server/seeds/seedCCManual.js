const CCProject = require('../models/CCProject');

const ccProjectsData = [
  {
    number: 1,
    code: 'CC1',
    name: 'The Ice Breaker',
    executiveSummary: 'For your first speech project, you will introduce yourself to your fellow club members and give them some information about your background, interests and ambitions. Strive to make eye contact. You may use notes.',
    objectives: [
      'To begin speaking before an audience.',
      'To discover speaking skills you already have and skills that need some attention.'
    ],
    timeMin: 4,
    timeMax: 6,
    evaluationCriteria: [
      'Did the speech reflect adequate preparation?',
      'Did the speaker talk clearly and audibly?',
      'Did the speech have a definite opening, body, and conclusion?',
      'How well did the audience get to know the speaker?'
    ]
  },
  {
    number: 2,
    code: 'CC2',
    name: 'Organize Your Speech',
    executiveSummary: 'Good speech organization is essential if your audience is to follow and understand your presentation. Choose the outline that best suits your topic. Opening catches attention, body supports ideas, conclusion reinforces them.',
    objectives: [
      'Select an appropriate outline which allows listeners to easily follow and understand your speech.',
      'Make your message clear, with supporting material directly contributing to that message.',
      'Use appropriate transitions when moving from one idea to another.',
      'Create a strong opening and conclusion.'
    ],
    timeMin: 5,
    timeMax: 7,
    evaluationCriteria: [
      'Speech Value (Interesting, meaningful to audience)',
      'Organization (Logical, clear flow)',
      'Effective transitions between points',
      'Strong opening and memorable conclusion'
    ]
  },
  {
    number: 3,
    code: 'CC3',
    name: 'Get to the Point',
    executiveSummary: 'Every speech must have a general and a specific purpose (to inform, persuade, entertain, or inspire). Organize the speech to achieve that purpose. Strive not to use notes.',
    objectives: [
      'Select a speech topic and determine its general and specific purposes.',
      'Organize the speech in a manner that best achieves those purposes.',
      'Ensure the beginning, body, and conclusion reinforce the purposes.',
      'Project sincerity and conviction and control nervousness.',
      'Strive not to use notes.'
    ],
    timeMin: 5,
    timeMax: 7,
    evaluationCriteria: [
      'Was the general and specific purpose clear?',
      'Did the main points support the specific purpose?',
      'Did the speaker project confidence and sincerity without notes?'
    ]
  },
  {
    number: 4,
    code: 'CC4',
    name: 'How to Say It',
    executiveSummary: 'Words are powerful. Select clear, accurate, descriptive, and short words that best communicate your ideas. Eliminate jargon, clichés, and unnecessary words. Use rhetorical devices and correct grammar.',
    objectives: [
      'Select the right words and sentence structure to communicate your ideas clearly, accurately, and vividly.',
      'Use rhetorical devices (metaphors, triads, similes, alliteration) to enhance and emphasize ideas.',
      'Eliminate jargon and unnecessary words. Use correct grammar.'
    ],
    timeMin: 5,
    timeMax: 7,
    evaluationCriteria: [
      'Did the speaker use vivid, descriptive action verbs?',
      'Were rhetorical devices effectively integrated?',
      'Was grammar accurate and free of jargon?'
    ]
  },
  {
    number: 5,
    code: 'CC5',
    name: 'Your Body Speaks',
    executiveSummary: 'Body language enhances your message and gives you more credibility. Stance, purposeful movement, gestures, facial expressions, and eye contact should be smooth, natural, and reinforce your words.',
    objectives: [
      'Use stance, movement, gestures, facial expressions, and eye contact to express your message and achieve your speech’s purpose.',
      'Make your body language smooth, purposeful, and natural.'
    ],
    timeMin: 5,
    timeMax: 7,
    evaluationCriteria: [
      'Poised posture and purposeful movement',
      'Natural, evocative gestures above the elbow',
      'Established visual bonds through direct eye contact',
      'Animated facial expressions consistent with message'
    ]
  },
  {
    number: 6,
    code: 'CC6',
    name: 'Vocal Variety',
    executiveSummary: 'A lively, exciting voice keeps listeners attention. Use volume, pitch, rate, and vocal quality as well as well-timed pauses to reflect and add meaning and emotion to your message.',
    objectives: [
      'Use voice volume, pitch, rate, and quality to reflect and add meaning and interest to your message.',
      'Use pauses to enhance your message and attract attention.',
      'Use vocal variety smoothly and naturally.'
    ],
    timeMin: 5,
    timeMax: 7,
    evaluationCriteria: [
      'Audible volume and conversational pitch variation',
      'Effective rate of speech (125-160 wpm) with impactful pauses',
      'Expressive vocal quality showing genuine emotion'
    ]
  },
  {
    number: 7,
    code: 'CC7',
    name: 'Research Your Topic',
    executiveSummary: 'Support your main points with statistics, expert testimony, stories, visual aids, and verifiable facts collected from varied credible sources rather than only opinions.',
    objectives: [
      'Collect information about your topic from numerous reliable sources.',
      'Carefully support your points and opinions with specific facts, examples, and illustrations gathered through research.'
    ],
    timeMin: 5,
    timeMax: 7,
    evaluationCriteria: [
      'Was the topic thoroughly researched and credible?',
      'Were statistics and evidence clearly related to listeners everyday lives?',
      'Did the speaker cite sources smoothly?'
    ]
  },
  {
    number: 8,
    code: 'CC8',
    name: 'Get Comfortable with Visual Aids',
    executiveSummary: 'Visual aids help an audience understand and remember what they hear. Select slides, props, flipcharts, or models that fit your message and display them with confidence and ease.',
    objectives: [
      'Select visual aids that are appropriate for your message and the audience.',
      'Use visual aids correctly with ease, proper timing, and confidence.'
    ],
    timeMin: 5,
    timeMax: 7,
    evaluationCriteria: [
      'Were the visual aids clearly visible, clean, and legible?',
      'Did the visuals reinforce rather than replace the spoken message?',
      'Did the speaker maintain audience eye contact while displaying visuals?'
    ]
  },
  {
    number: 9,
    code: 'CC9',
    name: 'Persuade with Power',
    executiveSummary: 'Influence the thinking or behavior of listeners using credibility, logic, and emotion. Organize with Monroe\'s Motivated Sequence or Problem/Solution, appeal to audience self-interest, and speak without notes.',
    objectives: [
      'Persuade listeners to adopt your viewpoint or ideas or to take some action.',
      'Appeal to the audience’s interests ("what\'s in it for me").',
      'Use logic and emotion to support your position.',
      'Avoid using notes.'
    ],
    timeMin: 5,
    timeMax: 7,
    evaluationCriteria: [
      'Did the speaker establish strong credibility and sincerity?',
      'Was the emotional and logical appeal compelling?',
      'Did the speech drive listeners toward decisive action?'
    ]
  },
  {
    number: 10,
    code: 'CC10',
    name: 'Inspire Your Audience',
    executiveSummary: 'Motivate listeners to achieve higher goals, noble ideals, and personal growth. Connect with Maslow\'s human needs, use vivid stories and dynamic emotional appeal, and deliver without notes.',
    objectives: [
      'To inspire the audience by appealing to noble motives and challenging the audience to achieve a higher level of beliefs or achievement.',
      'Appeal to the audience’s needs and emotions, using stories, anecdotes, and quotes to add drama.',
      'Avoid using notes.'
    ],
    timeMin: 8,
    timeMax: 10,
    evaluationCriteria: [
      'Did the speech uplift the audience and motivate them?',
      'Were stories and quotes used to generate inspirational energy?',
      'Was the conclusion powerful, dynamic, and memorable?'
    ]
  }
];

async function seedCCProjects() {
  await CCProject.deleteMany({});
  for (const proj of ccProjectsData) {
    await CCProject.create(proj);
  }
  console.log(`[Seed] Seeded ${ccProjectsData.length} CC Projects from Competent Communicator manual.`);
}

module.exports = { ccProjectsData, seedCCProjects };
