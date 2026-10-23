const RoleScript = require('../models/RoleScript');

const roleScriptsData = [
  {
    role: 'TMOD',
    title: 'Toastmaster of the Day',
    description: 'The genial host and conductor of the entire educational meeting program.',
    script: `“Good Evening fellow Toastmasters, Gaveliers, and welcomed guests! I am your Toastmaster of the Day for this meeting. Our theme today is '[THEME]'. The purpose of our meeting is to practice and hone our communication and leadership skills in a warm, friendly, and supportive environment. Let us begin this exciting journey together!”`,
    timingRules: {
      greenMin: 0,
      yellowMin: 0,
      redMin: 0,
      description: 'Presides throughout the meeting, manages transitions, introduces speakers and General Evaluator.'
    },
    tips: [
      'Confirm all speakers and roleplayers at least 48 hours prior to the meeting.',
      'Prepare brief, engaging introductions highlighting speaker goals and backgrounds.',
      'Always lead applause before and after each speaker and role player.'
    ]
  },
  {
    role: 'Timer',
    title: 'Timer Script and Log',
    description: 'Responsible for monitoring speech and meeting role durations and operating timing signals (Green, Yellow, Red).',
    script: `“Greetings Mr./Madam Toastmaster, fellow Toastmasters, and guests. As Timer, I will time the Table Topics speakers, formal speeches, and the evaluations. I will also alert each speaker of the time they have left, using the green, yellow, and red cards, which denote specific times remaining.

First we have the round robin session and I will ring the bell every 15 / 20 seconds for each speaker.

Those giving speeches should limit their remarks to their specific speech times:
• Ice Breaker speeches should be 4–6 minutes in length:
  - At 4 minutes, I will raise the green card.
  - At 5 minutes, I will raise the yellow card.
  - At 6 minutes, I will raise the red card.

• Most other speeches should be 5–7 minutes in length:
  - At 5 minutes, I will raise the green card.
  - At 6 minutes, I will raise the yellow card.
  - At 7 minutes, I will raise the red card.

• The individual evaluations should be between 2–3 minutes:
  - At 2 minutes, I will raise the green card.
  - At 2 minutes and 30 seconds, I will raise the yellow card.
  - At 3 minutes, I will raise the red card.

• Table Topics Speakers should limit their remarks to no more than 2 minutes:
  - At 1 minute, I will raise the green card.
  - At 1 minute and 30 seconds, I will raise the yellow card.
  - At 2 minutes, I will raise the red card.

Thank you Mr./Madam Toastmaster.”`,
    logTemplate: {
      columns: ['Speaker Name', 'Role / Speech Project', 'Time Taken', 'Within Time (Y/N)'],
      description: 'Record each participant name and time used. State those eligible for awards.'
    },
    timingRules: {
      greenMin: 4,
      yellowMin: 5,
      redMin: 6,
      description: 'Icebreaker: 4/5/6 min; Standard CC: 5/6/7 min; Evaluation: 2/2.5/3 min; Table Topics: 1/1.5/2 min.'
    },
    tips: [
      'Sit where the signal cards or timing lights are clearly visible to the speaker.',
      'Do not lower the red card once raised until the speaker completes their speech or sits down.',
      'Announce disqualified speakers gently (outside the 30-second leeway) when reporting.'
    ]
  },
  {
    role: 'Ah-Counter',
    title: 'Ah-Counter Script and Log',
    description: 'Notes overused words, crutch sounds, and pause fillers to help speakers gain speaking polish.',
    script: `“Greetings Madam/Mr. Toastmaster, fellow Toastmasters and guests. The purpose of the ah-counter is to note words and sounds that are used as a “crutch” or “pause filler” by anyone who speaks.

During the meeting I will listen for overused words including and, well, but, so and you know. I will also listen for filler sounds including ah, um and er. I will also note when a speaker repeats a word or phrase such as “I, I” or “this means, this means”.

At the end of the meeting, I will report the number of times each speaker used these expressions.

Thank you.”`,
    logTemplate: {
      columns: ['Name', 'Ah / Umm / Er', 'Well', 'So', 'Like', 'But', 'Repeats', 'Long Pauses'],
      description: 'Tally crutch words and sounds throughout the meeting.'
    },
    tips: [
      'Maintain an encouraging, supportive spirit—we learn by noticing our verbal habits!',
      'Give positive feedback when a speaker used zero crutch words or improved notably.'
    ]
  },
  {
    role: 'Grammarian',
    title: 'Grammarian Script and Log',
    description: 'Introduces the Word of the Day and comments on English language usage, vocabulary, and grammar gems.',
    script: `“Good Evening Mr./Madam Toastmaster, fellow Toastmasters, and welcomed guests.

As the Grammarian for today’s meeting, my role is to pay close attention to the use of language throughout the session. I will be listening carefully to each speaker’s use of English — noting both excellent examples of grammar, vocabulary, and word usage, as well as any incorrect or ineffective language.

I will also be introducing the Word of the Day, which is: [WORD_OF_DAY]
Definition: [DEFINITION]
Example usage: [EXAMPLE]

I encourage all speakers, including role players and guests, to use this word during the meeting. Each time it’s used correctly I want all of you to give one clap and acknowledge the usage of the word of the day and I will make a note of it and acknowledge you in my report as well.

At the end of the meeting, I will present my report, highlighting the effective use of language, the number of times the Word of the Day was used, and any areas where improvement is needed.

Thank you, Mr./Madam Toastmaster.”`,
    logTemplate: {
      columns: ['Speaker Name', 'Word of Day Used (Count)', 'Memorable Quotes & Sayings', 'Grammar Suggestions / Improvements'],
      description: 'Record Word of the Day hits, beautiful metaphors, and grammatical corrections.'
    },
    tips: [
      'Choose an inspiring, accessible Word of the Day.',
      'Show positive phrasing corrections rather than harsh critique.'
    ]
  },
  {
    role: 'General Evaluator',
    title: 'General Evaluator Script and Log',
    description: 'Evaluates the overall conduct of the meeting and leads the evaluation team.',
    script: `“Good Evening fellow Toastmasters and guests! I am [NAME], and I have the privilege of serving as your General Evaluator for today’s meeting.

As the General Evaluator, my role is to evaluate the overall conduct of the meeting and to help us reflect on how we can improve as a club. I’ll be observing everything — from how the meeting is run, to how transitions are handled, to the timing, energy, and engagement throughout.

I will also be calling on the reports of the rest of the tag team members along with the evaluations later in the meeting.

So, sit back, enjoy the speeches and roles, and remember: the goal is not perfection, but progress. I look forward to celebrating what went well today — and offering gentle suggestions on what we can do even better next time.

Thank you, and let’s have a fantastic meeting!”`,
    logTemplate: {
      columns: ['Role', 'Excelled At', 'Points of Improvement'],
      description: 'Log table covering TMOD, Ah-Counter, Timer, Grammarian, Round Robin Master, Table Topics Master, Speakers, Evaluators.'
    },
    tips: [
      'Observe promptness: did the meeting start on time?',
      'Check room setup, zoom audio/video, banner and gavel decorum.',
      'Praise what went exceptionally well before offering constructive suggestions.'
    ]
  },
  {
    role: 'Round Robin Master',
    title: 'Round Robin Master Script',
    description: 'Leads the warm-up Round Robin session giving every attendee an impromptu 15-20 second speaking turn.',
    script: `“Good Evening Mr./Madam Toastmaster and Gaveliers. As Round Robin Master, my role is to warm up the room and give every single person the chance to speak! I will introduce a quick question or prompt. We will go around the room; each person has 15 to 20 seconds until the timer rings the bell. Let us jump right in!”`,
    tips: [
      'Keep the prompt lighthearted, engaging, and tied to the meeting theme.',
      'Encourage guests and first-timers to chime in freely.'
    ]
  },
  {
    role: 'Table Topics Master',
    title: 'Table Topics Master Script',
    description: 'Directs the impromptu speaking session of the meeting, challenging members to speak for 1-2 minutes on unexpected topics.',
    script: `“Greetings Mr./Madam Toastmaster, fellow Gaveliers and guests. Table Topics helps us think on our feet and communicate coherently without advance preparation. Today’s topics reflect our theme. Each speaker has 1 to 2 minutes. Remember to incorporate today’s Word of the Day! Who would like to be our first brave speaker?”`,
    tips: [
      'Call upon members without speaking roles first before assigning to role players.',
      'Phrase questions clearly and keep your own explanations concise.'
    ]
  }
];

async function seedRoleScripts() {
  await RoleScript.deleteMany({});
  for (const s of roleScriptsData) {
    await RoleScript.create(s);
  }
  console.log(`[Seed] Seeded ${roleScriptsData.length} Role Scripts & Logs.`);
}

module.exports = { roleScriptsData, seedRoleScripts };
