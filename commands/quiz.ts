import { ChatInputCommandInteraction } from "discord.js"
import { Cmd } from "./command-exports"

const enum Difficulty {
    Easy,
    Medium,
    Hard,
    Challenging,
    Strenuous
}

// const prizes = new Array<{ user: string, coins: number, XP: number }>()

/*
const questions: ({ question: string, options: string[], correctAnswer: number | number[], note: string, difficulty: Difficulty })[] = [
    {
        question: 'What is ZBot\'s theme colour?',
        options: ['Blue (#00ff00)', 'Cyan (#00ffff)', 'Dark Blue (#00008B)', 'Turquoise (#40E0D0)'],
        correctAnswer: 1,
        note: 'ZBot\'s theme colour is, and always has been, cyan.',
        difficulty: Difficulty.Easy
    },
    {
        question: 'Who was the first member to join the support server?',
        options: ['ZBot', 'thezeeone'],
        correctAnswer: 1,
        note: 'How does the bot join before the owner does??!?',
        difficulty: Difficulty.Easy
    },
    {
        question: 'Who was the first person to hit level 5+?',
        options: ['thezeeone', 'PHX397', 'Void', 'ngolo_kante365', 'apple juice'],
        correctAnswer: 0,
        note: 'Yup!',
        difficulty: Difficulty.Easy
    },
    {
        question: 'ZBot\'s currency is coins.',
        options: ['True', 'False'],
        correctAnswer: 1,
        note: 'No, a full ZEconomy System doesn\'t exist.',
        difficulty: Difficulty.Easy
    },
    {
        question: 'What\'s ZBot\'s mascot\'s name?',
        options: ['Stormy', 'Fish', 'Buttons', 'Remus', 'Whaaa...???'],
        correctAnswer: 4,
        note: 'We\'re serious! ZBot has a mascot, but it has no name! Waiting for one...',
        difficulty: Difficulty.Easy
    },
    {
        question: 'How many servers is ZBot moderating?',
        options: ['17', '18', '19', '20', '21'],
        correctAnswer: 3,
        note: 'ZBot is moderating 18 servers as of the making of the quiz.',
        difficulty: Difficulty.Easy
    },
    {
        question: 'The bot is older than the support server itself.',
        options: ['True', 'False'],
        correctAnswer: 0,
        note: 'Wonder why...',
        difficulty: Difficulty.Medium
    },
    {
        question: 'ZBot once had a music system.',
        options: ['True', 'False'],
        correctAnswer: 0,
        note: 'We did have a music system, however we deemed it a failure and we had to stop it anyways.',
        difficulty: Difficulty.Medium
    },
    {
        question: 'Who was the first mod to be promoted?',
        options: ['PHX397', 'apple juice', 'ngolo_kante365', 'RQ', 'Violet?'],
        correctAnswer: 3,
        note: 'May not have been what you thought it was!',
        difficulty: Difficulty.Medium
    },
    {
        question: 'ZBot\'s funding comes from advertising but also on a website called Kofi.',
        options: ['Both are true', 'Only the advertising is true', 'Only the Kofi site is true', 'Neither is true'],
        correctAnswer: 3,
        note: 'We don\'t have any funding at all! Although we could, there is no place for the funds to be stored. Now imagine ZPremium becomes a thing...',
        difficulty: Difficulty.Medium
    },
    {
        question: 'What is ZBot\'s developer\'s current GitHub username?',
        options: ['ZBot', 'thezeeone', 'thezeebot', 'Z1', 'zeeone'],
        correctAnswer: 1,
        note: 'All the little small details matter.',
        difficulty: Difficulty.Medium
    },
    {
        question: 'There are more than 15 staff members in the support server.',
        options: ['True', 'False'],
        correctAnswer: 1,
        note: 'There\'s only 13!',
        difficulty: Difficulty.Medium
    },
    {
        question: 'When was ZBot created?',
        options: ['2021', '3rd January 2022', '24th March 2022', '19th May 2022', '20th July 2022'],
        correctAnswer: 2,
        note: 'Did you know ZBot was created months ago back in March?',
        difficulty: Difficulty.Hard
    },
    {
        question: 'What was ZBot\'s original purpose?',
        options: ['Gaming', 'Fun', 'Single-Server Moderation', 'Level System', 'Global Moderation'],
        correctAnswer: 2,
        note: 'ZBot was first designed to moderate only one server - that\'s why it was created so long ago!',
        difficulty: Difficulty.Hard
    },
    {
        question: 'There is an economy system fully developed.',
        options: ['True', 'False', 'How ya expect me to know?'],
        correctAnswer: 1,
        note: 'No! All you can do is exchange XP for coins, withdraw and deposit, and give coins to other users.',
        difficulty: Difficulty.Hard
    },
    {
        question: 'Memory Game was the first mini-game to be created.',
        options: ['True', 'False'],
        correctAnswer: 1,
        note: 'It was tic-tac-toe! Mini-games were very hard to program back then, and it required a lot of fixing.',
        difficulty: Difficulty.Hard
    },
    {
        question: 'Since when did ZBot first become compatible globally?',
        options: ['1 month ago', '1½ months ago', '2 months ago', '3 months ago', '4 months ago'],
        correctAnswer: 1,
        note: 'ZBot was only designed to be compatible globally right before the server was created!',
        difficulty: Difficulty.Hard
    },
    {
        question: 'For what reason was ZBot\'s music system discontinued ever so early?',
        options: ['Forced by Discord', 'My friends didn\'t like it', 'Terms of Service', 'Bugginess', 'Unpopularity'],
        correctAnswer: 2,
        note: 'The music system used something known as "video scraping" where it downloaded videos illegally off of YouTube. You can read more [here](https://www.google.com/search?q=youtube+tos+rule+on+bots&rlz=1C1ONGR_en-GBGB997GB997&oq=youtube+tos+rule+on+bots&aqs=chrome..69i57j69i64.3681j0j1&sourceid=chrome&ie=UTF-8#:~:text=access%20the%20Service%20using%20any%20automated%20means%20(such%20as%20robots%2C%20botnets%20or%20scrapers)).',
        difficulty: Difficulty.Hard
    },
    {
        question: 'How many users is ZBot moderating?',
        options: ['320', '330', '340', '350', '360'],
        correctAnswer: 2,
        note: 'That was tough.',
        difficulty: Difficulty.Challenging
    },
    {
        question: 'What does the previously-called `/pic` command show you?',
        options: ['A picture of my dog', 'A template rank card', 'A couple of cat pics', 'Face reveal', 'Your profile picture'],
        correctAnswer: 1,
        note: 'It was previously to test out the canvas - only later did we use it to make the new rank cards!',
        difficulty: Difficulty.Challenging
    },
    {
        question: 'Which system was developed first?',
        options: ['Level System', 'Rank System', 'Music System', 'Mini-game System', 'Economy System'],
        correctAnswer: 0,
        note: 'Also another tough one.',
        difficulty: Difficulty.Challenging
    },
    {
        question: 'How often does ZBot\'s custom status (aka activity) change?',
        options: ['Every minute', 'Every 2 minutes', 'Every 3 minutes', 'Every 5 minutes', 'Every 10 minutes'],
        correctAnswer: 2,
        note: 'It was previously every 6 minutes - however 6 was quite long! So we made it every 3.',
        difficulty: Difficulty.Challenging
    },
    {
        question: 'What\'s the **maximum** amount of XP you can gain per message?',
        options: ['25 XP', '40 XP', '30 XP', '50 XP', '100 XP'],
        correctAnswer: 1,
        note: 'The limit is 40 XP.',
        difficulty: Difficulty.Challenging
    },
    {
        question: 'What was the developer\'s original GitHub username?',
        options: ['thezeeone', 'Z1', 'Zahid556', 'notZahid01', 'zee01'],
        correctAnswer: 2,
        note: 'I cringed. Never ever going with GitHub username suggestions ever again.',
        difficulty: Difficulty.Challenging
    },
    {
        question: 'The lowest level on the leaderboard is 22.',
        options: ['True', 'False'],
        correctAnswer: 1,
        note: 'It\'s 25 - but that **can** change quickly!',
        difficulty: Difficulty.Strenuous
    },
    {
        question: 'How big is the biggest server ZBot is moderating?',
        options: ['196', '390', '700', '1,300', '3,900'],
        correctAnswer: 0,
        note: 'I\'d be lucky. Luckier if it was any of the others.',
        difficulty: Difficulty.Strenuous
    },
    {
        question: 'When was <#1000079781041275080> (ZBot Announcements Channel) created?',
        options: ['21st July', '22nd July', '23rd July', '24th July', '25th July'],
        correctAnswer: 1,
        note: 'You couldn\'t\'ve-',
        difficulty: Difficulty.Strenuous
    },
    {
        question: 'On what day did ZBot move from normal messages to embeds?',
        options: ['29th July', '30th July', '31st July', '1st August', '2nd August'],
        correctAnswer: 2,
        note: 'Funny enough we called it a "revamp", did anyone remember!',
        difficulty: Difficulty.Strenuous
    },
    {
        question: 'What programming language(s) is ZBot coded in?',
        options: ['Java', 'C#', 'JavaScript', 'C++', 'TypeScript'],
        correctAnswer: [2, 4],
        note: 'ZBot is coded in TypeScript to get 90% of errors fixed - but also TypeScript can be compiled into JavaScript, so JavaScript could also count!',
        difficulty: Difficulty.Strenuous
    },
    {
        question: 'How many people are competing in ZBot\'s leaderboard?',
        options: ['129', '133', '128', '131', '130'],
        correctAnswer: 1,
        note: 'You couldn\'t\'ve gotten this right... or am I famous?',
        difficulty: Difficulty.Strenuous
    },
]
*/

// let questionNumber = 0

const quizCommand: Cmd = {
    data: {
        name: 'quiz',
        description: 'Not until Zalloween!'
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        return await interaction.reply({
            content: 'The next Quiz Night is Zalloween on the 31st of October!',
            ephemeral: true
        })

        /*
        if (
            !interaction.client.guilds.cache.get('1000073833551769600')
                ?.members.cache.get(interaction.user.id)
                ?.roles.cache.has('1023228765934981230')
        ) return await interaction.reply({
            content: 'You must be ZStaff in the [official support server](https://discord.gg/6tkn6m5g52) to be able to run this command!',
            ephemeral: true
        })

        if (interaction.user.id !== '786984851014025286') {
            if (interaction.guild.id !== '1000073833551769600') {
                return await interaction.reply({
                    content: 'You can only use this in the [official support server](https://discord.gg/6tkn6m5g52) (the developer himself can use it anywhere).',
                    ephemeral: true
                })
            }
        }

        const reply = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('ZBoctober Quiz Night')
                    .setDescription(`Hello and welcome to the ZBoctober Quiz Night! This is an event where we have prepared 30 questions about ZBot for you to answer. Could you get through them all?\n\nYou will get rewards for replying fast - but **only** when replying with the **right** answer. This test is divided into 5 sections of 6 questions each, all harder than the last. You get 10 to 20 seconds to answer each question, depending on the section - the faster you reply, the more XP and ZCoins you get (and you get more XP and ZCoins the harder the sections get) **only** if you get it right!\n\nGive this a try - you could be getting loads out of it!\n\nIf you want to leave the event or cannot participate, you can press the red \'I Quit\' button, however in doing so **you cannot reparticipate in the event.**\n\nThis quiz will start ${bold(time(Math.floor(Date.now() / 1000) + 60, 'R'))}.`)
                    .setColor(0xff7700)
            ],
            fetchReply: true
        })

        setTimeout(async () => {
            await reply.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('ZBoctober Quiz Night Begun!')
                        .setDescription(`The event has started ${time(Math.floor(Date.now() / 1000), 'R')} - go go go!`)
                ]
            })
            nextQuestion(interaction)
        }, 59000)
    }
    */
}

/*
async function nextQuestion(interaction: ChatInputCommandInteraction<"cached">) {
    const channel = interaction.channel as GuildTextBasedChannel

    const quitButton = new ButtonBuilder()
        .setCustomId('quit')
        .setLabel('I Quit')
        .setStyle(ButtonStyle.Danger)

    const [
        optionsRow,
        quitRow
    ] = [
            new ActionRowBuilder<ButtonBuilder>(),
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    quitButton
                )
        ]

    const usersQuitted = new Array<string>()

    quitButton.setDisabled(true)

    const embed = new EmbedBuilder()
        .setTitle(`Question ${questionNumber + 1} of 30`)
        .setDescription(`Question starts ${time(Math.ceil(Date.now() / 1000 + 7.5), 'R')}...`)
        .setColor(0x00ffff)
    const msg = await channel.send({
        embeds: [
            embed
        ]
    })

    embed
        .setDescription(`Can you select the right answer as fast as you can? Question ends ${time(Math.ceil(Date.now() / 1000 + 7.5) + [10, 10, 15, 20, 20][questions[questionNumber].difficulty], 'R')}.`)
        .setFields([
            {
                name: 'Question',
                value: questions[questionNumber].question
            },
            {
                name: 'Difficulty',
                value: ['Easy', 'Medium', 'Hard', 'Challenging', 'Strenuous'][questions[questionNumber].difficulty]
            }
        ])
        .setColor([0x00ff00, 0xffff00, 0xff7700, 0xff4400, 0xff0000][questions[questionNumber].difficulty])

    optionsRow.setComponents(
        questions[questionNumber].options.map((option, index) => {
            return new ButtonBuilder()
                .setStyle((option === 'True' ? ButtonStyle.Success : (option === 'False' ? ButtonStyle.Danger : ButtonStyle.Primary)))
                .setLabel(option)
                .setCustomId(String(index))
        })
    )

    setTimeout(async () => {
        quitButton.setDisabled(false)

        const answers = new Map<string, { time: number, answer: number }>()

        await msg.edit({
            embeds: [
                embed
            ],
            components: [
                optionsRow,
                quitRow
            ]
        })


        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: async (btn) => {
                const isUserBlacklisted = await BlacklistModel.findOne({
                    where: {
                        id: btn.user.id
                    }
                })

                if (isUserBlacklisted) {
                    await btn.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(underscore('You are blacklisted from using this bot.'))
                                .setDescription(`⛔ **You are not allowed to use the bot, or interact with its commands or message components.**`)
                                .setColor(0x000000)
                        ]
                    })
                    return false
                }

                if (usersQuitted.includes(btn.user.id)) {
                    await btn.reply({
                        content: 'You quitted this quiz night event - now you want to rejoin? Absolutely no way.',
                        ephemeral: true
                    })
                    return false
                } else {
                    return true
                }
            },
            time: 1000 * ([10, 10, 15, 20, 20][questions[questionNumber].difficulty])
        })

        collector.on('collect', async (btn) => {
            if (btn.customId === 'quit') {
                usersQuitted.push(btn.user.id)
                if (prizes.map(p => p.user).indexOf(btn.user.id) !== -1) prizes.slice(prizes.map(p => p.user).indexOf(btn.user.id), 1)
                await btn.reply({
                    content: 'You quitted the event - you can\'t gain any XP anymore.',
                    ephemeral: true
                })
            } else {
                const previous = answers.has(btn.user.id)
                answers.set(btn.user.id, { time: Math.ceil(((msg.editedTimestamp as number) - Date.now()) / 1000), answer: Number(btn.customId) })
                await btn.reply({
                    content: `You ${previous ? 'changed your mind and ' : ''}selected ${inlineCode(questions[questionNumber].options[Number(btn.customId)])}. ${[
                        'Intelligent?',
                        'Genius...?',
                        'Lightning fast?',
                        'Sharp mind?',
                        'Brainy?',
                        'We\'ll see...',
                        'Ya sure about that?'
                    ][Math.floor(Math.random() * 7)]}`,
                    ephemeral: true
                })
            }
        })

        collector.on('end', async () => {
            try {
                embed
                    .setDescription('Did you get it right?')
                    .addFields([
                        {
                            name: 'Correct Answer(s)',
                            value: `The ${Array.isArray(questions[questionNumber].correctAnswer) && (<number[]>questions[questionNumber].correctAnswer).length > 1 ? 'correct answers were' : 'correct answer was'}...\n${commaList(questions[questionNumber].options.filter(
                                (_, i) => {
                                    if (typeof questions[questionNumber].correctAnswer === "number") {
                                        if (i === (<number>questions[questionNumber].correctAnswer)) return true
                                        else return false
                                    } else {
                                        if ((<number[]>questions[questionNumber].correctAnswer).includes(i)) return true
                                        else return false
                                    }
                                }
                            )
                                .map(
                                    s => inlineCode(s)
                                )
                            )
                                }\n${questions[questionNumber].note}`
                        },
                        {
                            name: 'Selected Answers',
                            value: Boolean(answers.size)
                                ? questions[questionNumber].options
                                    .map((answer, index) => {
                                        const collectedAnswers = [...answers.values()].filter((s) => s.answer === index)
                                        return `${[...collectedAnswers.values()].length ? bold(pluralise([...collectedAnswers.values()].length, 'person', 'people')) : 'Nobody'} selected ${answer}`
                                    })
                                    .join('\n')
                                : 'Come on, at least try...'
                        }
                    ])

                // const collectedAnswers = [...answers.values()]
                const collectedAnswers = Array.from(answers)
                collectedAnswers.forEach((ans) => {
                    const user = ans[0]
                    if (
                        Array.isArray(questions[questionNumber].correctAnswer) && (<number[]>questions[questionNumber].correctAnswer).includes(ans[1].answer)
                        || (<number>questions[questionNumber].correctAnswer) === ans[1].answer
                    ) {
                        if (usersQuitted.includes(user)) return
                        const userPrizes = prizes.find(p => p.user === user)

                        if (!userPrizes) prizes.push(
                            {
                                user,
                                coins: Math.ceil(
                                    [500, 625, 750, 875, 1000][questions[questionNumber].difficulty] *
                                    (
                                        ([10, 10, 15, 20, 20][questions[questionNumber].difficulty] - ans[1].time) / [10, 10, 15, 20, 20][questions[questionNumber].difficulty]
                                    )
                                ),
                                XP: Math.ceil(
                                    [1000, 1250, 1500, 1750, 2000][questions[questionNumber].difficulty] * (
                                        ([10, 10, 15, 20, 20][questions[questionNumber].difficulty] - ans[1].time) / [10, 10, 15, 20, 20][questions[questionNumber].difficulty]
                                    )
                                )
                            }
                        )
                        else {
                            userPrizes.coins += Math.ceil(
                                [500, 625, 750, 875, 1000][questions[questionNumber].difficulty] *
                                (
                                    ([10, 10, 15, 20, 20][questions[questionNumber].difficulty] - ans[1].time) / [10, 10, 15, 20, 20][questions[questionNumber].difficulty]
                                )
                            )
                            userPrizes.XP += Math.ceil(
                                [1000, 1250, 1500, 1750, 200][questions[questionNumber].difficulty] * (
                                    ([10, 10, 15, 20, 20][questions[questionNumber].difficulty] - ans[1].time) / [10, 10, 15, 20, 20][questions[questionNumber].difficulty]
                                )
                            )
                        }
                    }
                })

                console.log(prizes)

                quitButton.setDisabled(true)

                optionsRow.components
                    .map((b, i) => {
                        if (
                            Array.isArray(questions[questionNumber].correctAnswer) && (<number[]>questions[questionNumber].correctAnswer).includes(i)
                            || (<number>questions[questionNumber].correctAnswer) === i
                        ) {
                            b.setStyle(ButtonStyle.Success)
                        } else if (
                            !(Array.isArray(questions[questionNumber].correctAnswer) && (<number[]>questions[questionNumber].correctAnswer).includes(i)
                                || (<number>questions[questionNumber].correctAnswer) === i)
                            && [...answers.values()].some(s => s.answer === i)
                        ) {
                            b.setStyle(ButtonStyle.Danger)
                        } else {
                            b.setStyle(ButtonStyle.Secondary)
                        }
                        b.setDisabled(true)
                    })

                await msg.edit({
                    embeds: [
                        embed
                    ],
                    components: [
                        optionsRow,
                        quitRow
                    ]
                })

                setTimeout(async () => {
                    await msg.channel.send({
                        content: `**__LEADERBOARD__**\n${prizes.length
                                ? prizes
                                    .sort((a, b) => {
                                        if (a.XP > b.XP) return -1
                                        else if (a.XP < b.XP) return 1
                                        else return 0
                                    })
                                    .filter(notEmpty)
                                    .slice(0, 5)
                                    .map((pos, ind) => {
                                        return `${ind === 0 ? `**TOP ${prizes.length < 3 ? prizes.length : 3}**\n` : (ind === 3 ? `**RUNNER(S) UP**\n` : '')}${ind < 3
                                                ? ['🥇', '🥈', '🥉'][ind]
                                                : inlineCode(ordinalNumber(ind + 1, true))
                                            } <@${pos.user
                                            }>: ${pos.XP} experience points and ${pos.coins} zcoins`
                                    })
                                    .join('\n')
                                : 'There are no participants yet!'
                            }`
                    })
                }, 2500)
            } catch {
                return
            } finally {
                setTimeout(async () => {
                    questionNumber++

                    if (questionNumber < 30) {
                        nextQuestion(interaction)
                    } else {
                        await msg.channel.send('The event is over - what a start to October! Did your knowledge of ZBot increase?')

                        const winners = await msg.channel.send('The winner is... *drum roll*')

                        const leaders = prizes
                            .sort((a, b) => {
                                if (a.XP > b.XP) return -1
                                else if (a.XP < b.XP) return 1
                                else return 0
                            })
                            .filter(notEmpty)

                        setTimeout(() => {
                            winners.edit(`The winner is... ${leaders.length
                                    ? `<@${leaders[0].user}> with **${leaders[0].XP} experience points** and **${leaders[0].coins} ZCoins**!`
                                    : '\nWaii... *There is no leader...* (cricketing noises)'
                                }`)

                            if (!leaders.length) return
                            else {
                                setTimeout(async () => {
                                    await msg.channel.send({
                                        content: `**__LEADERBOARD__**\n${leaders.length
                                                ? leaders
                                                    .sort((a, b) => {
                                                        if (a.XP > b.XP) return -1
                                                        else if (a.XP < b.XP) return 1
                                                        else return 0
                                                    })
                                                    .filter(notEmpty)
                                                    .slice(0, 5)
                                                    .map((pos, ind) => {
                                                        if (ind < 6) {
                                                            return `${ind === 0 ? `**TOP ${leaders.length < 3 ? leaders.length : 3}**\n` : (ind === 3 ? `**RUNNER(S) UP**\n` : '')}${ind < 3
                                                                    ? ['🥇', '🥈', '🥉'][ind]
                                                                    : inlineCode(ordinalNumber(ind + 1, true))
                                                                } <@${pos.user
                                                                }>: ${pos.XP} experience points and ${pos.coins} zcoins`
                                                        } else {
                                                            if (ind === 6) return `\nand ${leaders.length - 5} more...`
                                                            else return ''
                                                        }
                                                    })
                                                    .join('\n') + '\nThe top 3 users will get an extra 6000 XP and 3000 ZCoins; 4000 XP and 2000 ZCoins; and 2000 XP and 1000 ZCoins, the 4th- and 5th-place runners-up will get 1000 XP and 500 ZCoins; and everyone else 500 XP and 250 ZCoins. **Double rewards!**'
                                                : 'Nobody participated... why. 😭'
                                            }`
                                    })

                                    leaders.forEach(async (pos, ind, arr) => {
                                        switch (ind) {
                                            case 0:
                                                await LevelModel.increment({
                                                    xp: pos.XP + 6000
                                                }, {
                                                    where: {
                                                        id: pos.user
                                                    }
                                                })
                                                await EconomyModel.increment({
                                                    wallet: pos.coins + 6000
                                                }, {
                                                    where: {
                                                        id: pos.user
                                                    }
                                                })
                                                break
                                            case 1:
                                                await LevelModel.increment({
                                                    xp: pos.XP + 4000
                                                }, {
                                                    where: {
                                                        id: pos.user
                                                    }
                                                })
                                                await EconomyModel.increment({
                                                    wallet: pos.coins + 2000
                                                }, {
                                                    where: {
                                                        id: pos.user
                                                    }
                                                })
                                                break
                                            case 2:
                                                await LevelModel.increment({
                                                    xp: pos.XP + 2000
                                                }, {
                                                    where: {
                                                        id: pos.user
                                                    }
                                                })
                                                await EconomyModel.increment({
                                                    wallet: pos.coins + 1000
                                                }, {
                                                    where: {
                                                        id: pos.user
                                                    }
                                                })
                                                break
                                            case 3:
                                            case 4:
                                                await LevelModel.increment({
                                                    xp: pos.XP + 1000
                                                }, {
                                                    where: {
                                                        id: pos.user
                                                    }
                                                })
                                                await EconomyModel.increment({
                                                    wallet: pos.coins + 500
                                                }, {
                                                    where: {
                                                        id: pos.user
                                                    }
                                                })
                                                break
                                            default:
                                                await LevelModel.increment({
                                                    xp: pos.XP + 500
                                                }, {
                                                    where: {
                                                        id: pos.user
                                                    }
                                                })
                                                await EconomyModel.increment({
                                                    wallet: pos.coins + 250
                                                }, {
                                                    where: {
                                                        id: pos.user
                                                    }
                                                })
                                                break
                                        }
                                        if (ind === arr.length - 1) {
                                            await msg.channel.send('Everyone\'s coins and XP have been given. Sheesh - that was fun.')
                                        }
                                    })
                                }, 2500)
                            }
                        }, 5000)
                    }
                }, 5000)
            }
        })
    }, 7500)

    return
    */
}

function notEmpty<T>(value: T | null | undefined): value is T {
    return value !== undefined && value !== null
}

export {
    quizCommand
}