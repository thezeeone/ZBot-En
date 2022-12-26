import { ChatInputCommandInteraction, EmbedBuilder, bold, time, GuildTextBasedChannel, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, underscore, inlineCode } from "discord.js"
import { BlacklistModel, LevelModel, EconomyModel, ZCentralBankModel } from "../database"
import { commaList, pluralise, ordinalNumber } from "../util"
import { Cmd } from "./command-exports"

enum Difficulty {
    Easy,
    Medium,
    Hard,
    Challenging,
    Strenuous
}

enum QuestionTypes {
    Question,
    Surprises
}

interface Question {
    type: QuestionTypes.Question,
    question: string,
    options: string[],
    correctAnswers: number[],
    note: string,
    difficulty: Difficulty
}

interface Surprises {
    type: QuestionTypes.Surprises,
    gifts: ({
        type: 'XP' | 'ZCoins',
        amount: number
    } | null)[]
}

type QuestionType = Question | Surprises

const prizes = new Array<{ user: string, coins: number, XP: number }>()
const questions: QuestionType[] = [
    {
        type: QuestionTypes.Question,
        question: 'ZBot\'s theme colour has recently changed to suit the Christmas theme.',
        options: ['True', 'False'],
        correctAnswers: [1],
        note: 'ZBot\'s theme colour stays as is!',
        difficulty: Difficulty.Easy
    },
    {
        type: QuestionTypes.Question,
        question: 'Updates are still being made to ZBot.',
        options: ['True', 'False'],
        correctAnswers: [0],
        note: 'We still got a [hell lot](https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804) to get on with - they haven\'t ended yet!',
        difficulty: Difficulty.Easy
    },
    {
        type: QuestionTypes.Question,
        question: 'ZBot Sudoku is expected to be fully complete by...',
        options: ['28th Dec', '29th Dec', '30th Dec', '31st Dec', '1st Jan'],
        correctAnswers: [3],
        note: 'Not like I\'ll meet that deadline :smiling_face_with_tear:',
        difficulty: Difficulty.Easy
    },
    {
        type: QuestionTypes.Question,
        question: 'ZBot was created on...',
        options: ['21st March', '22nd March', '23rd March', '24th April', '25th April'],
        correctAnswers: [2],
        note: 'This question comes up again. And again. And again. And again.',
        difficulty: Difficulty.Easy
    },
    {
        type: QuestionTypes.Question,
        question: 'How many quiz nights have happened before?',
        options: ['1', '2', '3', '4', 'but why?'],
        correctAnswers: [2],
        note: 'Don\'t get excited for prizes yet!',
        difficulty: Difficulty.Easy
    },
    {
        type: QuestionTypes.Question,
        question: 'There are two members with level 100+.',
        options: ['True', 'False'],
        correctAnswers: [1],
        note: 'One member is on level 97, another 126.',
        difficulty: Difficulty.Easy
    },
    {
        type: QuestionTypes.Question,
        question: 'Using macros on ZBot result in...',
        options: ['warning', 'kick', 'ban from server', 'blacklist (permanent ban from bot)'],
        correctAnswers: [3],
        note: '**DON\'T.** You. **Dare.**',
        difficulty: Difficulty.Medium
    },
    {
        type: QuestionTypes.Question,
        question: 'Currency?',
        options: ['money', 'coins', 'ZBot Coins', 'ZDots', 'ZCoins'],
        correctAnswers: [4],
        note: 'If you didn\'t get this... I\'ll kill you.',
        difficulty: Difficulty.Medium
    },
    {
        type: QuestionTypes.Question,
        question: 'This server hit 100,000 messages on the...',
        options: ['1st Nov', '2nd Nov', '3rd Nov', '4th Nov', '5th Nov'],
        correctAnswers: [1],
        note: 'Hats off to you if you got it right.',
        difficulty: Difficulty.Medium
    },
    {
        type: QuestionTypes.Question,
        question: 'The maximum money stored in the wallet is...',
        options: ['100,000 ZCoins', '200,000 ZCoins', '1,000,000 ZCoins', '5,000,000 ZCoins', 'Unlimited'],
        correctAnswers: [4],
        note: 'The maximum amount is stored as a binary number - the more "bits" (digits), the **bigger** these numbers get - and that means a LOT.',
        difficulty: Difficulty.Medium
    },
    {
        type: QuestionTypes.Surprises,
        gifts: [
            { type: "XP", amount: 1500 },
            { type: "ZCoins", amount: 1500 },
            null,
            { type: "ZCoins", amount: 2500 },
            { type: "XP", amount: 2000 },
        ]
    },
    {
        type: QuestionTypes.Question,
        question: 'When did the **Nozember** quiz night take place?',
        options: ['1st Nov', '2nd Nov', '15th Nov', '20th Nov', '31st Nov'],
        correctAnswers: [2],
        note: 'If you picked 31st... slap your own face.',
        difficulty: Difficulty.Medium
    },
    {
        type: QuestionTypes.Question,
        question: 'ZBot is moderating...',
        options: ['20 servers', '21 servers', '22 servers', '23 servers', '24 servers'],
        correctAnswers: [2],
        note: 'If you noticed the custom status...',
        difficulty: Difficulty.Medium
    },
    {
        type: QuestionTypes.Question,
        question: 'The newest mini-game still under development is...',
        options: ['Chess', 'Backgammon', 'Minesweeper', 'Sudoku'],
        correctAnswers: [3],
        note: 'Can\'t lie, I wish Minesweeper was a mini-game though.',
        difficulty: Difficulty.Hard
    },
    {
        type: QuestionTypes.Question,
        question: 'ZBot is moderating...',
        options: ['480 users', '490 users', '500 users', '510 users', '520 users'],
        correctAnswers: [0, 1, 2],
        note: 'You can technically say 500 though.',
        difficulty: Difficulty.Hard
    },
    {
        type: QuestionTypes.Question,
        question: '`/rank display` is the equivalent as the new...',
        options: ['rank-card', '/level', '/rank', '/rank user', '/rank card'],
        correctAnswers: [2],
        note: 'If you showed your rank card, you would know!',
        difficulty: Difficulty.Hard
    },
    {
        type: QuestionTypes.Question,
        question: 'Rank card images were completed...',
        options: ['24th Nov', '25th Nov', '26th Nov', '27th Nov', '28th Nov'],
        correctAnswers: [2],
        note: 'Yikes, that one was...',
        difficulty: Difficulty.Hard
    },
    {
        type: QuestionTypes.Question,
        question: 'When calculating the number of moderated users, ZBot...',
        options: ['counts repeat members', 'ignores repeat members', 'adds member counts of all its servers', 'ignores bots', 'counts repeat members only once'],
        correctAnswers: [1, 3, 4],
        note: 'Epic. Fyi inviting it to multiple servers with the same members doesn\'t increase the count.',
        difficulty: Difficulty.Hard
    },
    {
        type: QuestionTypes.Question,
        question: 'ZBot\'s maintenance hours are...',
        options: ['03:00-06:00', '09:00-12:00', '12:00-15:00', '15:00-21:00', 'random'],
        correctAnswers: [4],
        note: 'ZBot\'s maintenance hours are completely random and can happen at any time! Not good, is it...',
        difficulty: Difficulty.Hard
    },
    {
        type: QuestionTypes.Question,
        question: 'You can skip the "Are you sure..." part of a punishment.',
        options: ['True', 'False'],
        correctAnswers: [0],
        note: 'You can do so by setting the `skip-confirmation` value to `True`.',
        difficulty: Difficulty.Challenging
    },
    {
        type: QuestionTypes.Question,
        question: 'No Rules Day is...',
        options: ['on New Year\'s Day', 'tomorrow', 'in 3 weeks', 'unpredictable', 'when ZBot hits 500 moderated users'],
        correctAnswers: [3, 4],
        note: 'No Rules Day will happen when ZBot hits 500 moderated users. You can also say it\'s unpredictable.',
        difficulty: Difficulty.Challenging
    },
    {
        type: QuestionTypes.Surprises,
        gifts: [
            null,
            { type: "XP", amount: 10000 },
            { type: "ZCoins", amount: 10000 },
            null,
            { type: "ZCoins", amount: 20000 },
        ]
    },
    {
        type: QuestionTypes.Question,
        question: 'This server was created on...',
        options: ['my birthday', 'the day of my account creation', 'during the summer holidays', 'in schooltime', 'during the easter holidays'],
        correctAnswers: [2],
        note: 'It was created on the 22nd of July 2022 - it comes up again. and again. and again. and again. and ag- Ok, I\'ll stop now.',
        difficulty: Difficulty.Challenging
    },
    {
        type: QuestionTypes.Question,
        question: 'ZAdmin was deleted due to...',
        options: ['excess ZAdmins', 'role abuse', 'change in hierarchial structure', 'arguing', 'ZHeadAdmin being created'],
        correctAnswers: [0, 1, 2, 3],
        note: 'ZHeadAdmin wasn\'t meant to be created in the first place anyways!',
        difficulty: Difficulty.Challenging
    },
    {
        type: QuestionTypes.Question,
        question: 'This server first hit 90 members...',
        options: ['less than a month ago', 'less than a fortnight ago', 'less than a week ago', 'less than a day ago', 'never'],
        correctAnswers: [4],
        note: 'Still stuck at 80 lmao :smiling_face_with_tear:',
        difficulty: Difficulty.Challenging
    },
    {
        type: QuestionTypes.Question,
        question: 'How many servers are following ZBot announcements?',
        options: ['9', '10', '11', '12', '13'],
        correctAnswers: [2],
        note: 'That was a tough one.',
        difficulty: Difficulty.Challenging
    },
    {
        type: QuestionTypes.Question,
        question: 'The minimum level required to be ZStaff.',
        options: ['15', '20', '25', '30'],
        correctAnswers: [1],
        note: 'It *used* to be 15 but is now 20.',
        difficulty: Difficulty.Strenuous
    },
    {
        type: QuestionTypes.Question,
        question: 'There are plans to convert ZBot\'s database from Sequelize to Prisma.',
        options: ['True', 'False'],
        correctAnswers: [0],
        note: 'It was planned... and forgotten. :joy:',
        difficulty: Difficulty.Strenuous
    },
    {
        type: QuestionTypes.Question,
        question: 'Sudoku has been complete.',
        options: ['True', 'False'],
        correctAnswers: [1],
        note: 'Nope!',
        difficulty: Difficulty.Strenuous
    },
    {
        type: QuestionTypes.Question,
        question: 'How many custom statuses does ZBot loop through?',
        options: ['2', '3', '4', '5', '6'],
        correctAnswers: [3],
        note: 'I know... hard to pay attention.',
        difficulty: Difficulty.Strenuous
    },
    {
        type: QuestionTypes.Question,
        question: 'Which **staff** role was the first to be made?',
        options: ['ZAdmin', 'ZMod', 'ZHeadMod', 'ZStaff', 'ZAdmin'],
        correctAnswers: [1],
        note: 'You thought it\'d be ZStaff since it\'s the main role - but ZMod was made first!',
        difficulty: Difficulty.Strenuous
    },
    {
        type: QuestionTypes.Question,
        question: 'Sigma Rule 69 (Σ69)',
        options: ['Never disrespect Top Σ', 'Don\'t be a goat or u\'ll die in Eid that\'s why u should be a Σ', 'Don\'t be haram, be a Σ', 'Σ Sigma Balls', 'Dick, Dickhead, Dickman, Dickwoman and Dickdaddy'],
        correctAnswers: [1],
        note: 'Sigma Rule 10: Never disrespect the sigma',
        difficulty: Difficulty.Strenuous
    },
    {
        type: QuestionTypes.Surprises,
        gifts: [
            { type: "ZCoins", amount: 50000 },
            { type: "ZCoins", amount: 50000 },
            { type: "ZCoins", amount: 50000 },
            { type: "ZCoins", amount: 50000 },
            { type: "ZCoins", amount: 50000 }
        ]
    },
]
let questionNumber: number = 0

const quizCommand: Cmd = {
    data: {
        name: 'quiz',
        description: 'Snowwy freezy Nozembery!'
    },
    // @ts-ignore
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
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
                    .setTitle('❄ Chrizmas Quiz Night ☃')
                    .setDescription(`Hello and welcome to the Chrizmas Quiz Night - Sigma rule 3 (no haram stuff) doesn\'t apply here. **Chriz**mas. **Chriz**. not **Christ**. Get it? or no... Ok anyways, this is a slightly harder one with 30 questions. **There is a twist - __Strenuous__ has been brought in for this Quiz Night.** Try not to die.\n\nYou will get rewards for replying fast - but **only** when replying with the **right** answer. This test is divided into 5 sections of 6 questions each, all harder than the last. You get 10 to 30 seconds to answer each question, depending on the section - the faster you reply, the more XP and ZCoins you get (and you get more XP and ZCoins the harder the sections get) **only** if you get it right!\n\nGive this a try - you could be getting loads out of it! Yea well you won\'t get loads of snow though. :cry:\n\nOh and there\'s two surprises at the end: one video and one charity event.\n\n**SINCE NOZEMBER, WE HAVE STOPPED RUNNING PRIVATE/EXTRA QUIZZES FOR MEMBERS AND FREE REWARDS FOR THOSE WHO HAVE MISSED THE QUIZ NIGHT BECAUSE WE MUST BE FAIR WITH ALL USERS AND THE PRIZES THEY RECEIVE.**\n\nThis quiz will start ${bold(time(Math.floor(Date.now() / 1000) + 300, 'R'))}.`)
                    .setColor(0x00ffff)
            ],
            fetchReply: true
        })

        setTimeout(async () => {
            await reply.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setTitle('Chrizmas Quiz Night Begun!')
                        .setDescription(`The event has started ${time(Math.floor(Date.now() / 1000), 'R')} - go go go!`)
                ]
            })
            nextQuestion(interaction)
        }, 300000)
    }
}

async function nextQuestion(interaction: ChatInputCommandInteraction<"cached">) {
    const channel = interaction.channel as GuildTextBasedChannel

    const [
        optionsRow,
    ] = [
            new ActionRowBuilder<ButtonBuilder>(),
        ]

    const embed = new EmbedBuilder()
        .setTitle(
            questions[questionNumber].type === QuestionTypes.Question
                ? `Question ${questions.filter((q: QuestionType): q is Question => q.type === QuestionTypes.Question).map(q => q.question).indexOf((questions[questionNumber] as Question).question) + 1
                } of 30`
                : 'Gifts'
        )
        .setDescription(`${questions[questionNumber].type === QuestionTypes.Question
            ? 'Question starts'
            : 'You can collect your prizes'
            } ${time(Math.ceil(Date.now() / 1000 + 7.5), 'R')}...`)
        .setColor(0x0077ff)


    const question = questions[questionNumber]

    if (question.type === QuestionTypes.Question) {
        const msg = await channel.send({
            embeds: [
                embed
            ]
        })

        embed
            .setDescription(`Can you select the right answer as fast as you can? Question ends ${time(Math.ceil(Date.now() / 1000 + 7.5) + [10, 10, 15, 20, 20][question.difficulty], 'R')}.`)
            .setFields([
                {
                    name: 'Question',
                    value: question.question
                },
                {
                    name: 'Difficulty',
                    value: ['Easy', 'Medium', 'Hard', 'Challenging', 'Strenuous'][question.difficulty]
                }
            ])
            .setColor([0x00ff00, 0xffff00, 0xff7700, 0xff4400, 0xff0000][question.difficulty])

        optionsRow.setComponents(
            question.options.map((option, index) => {
                return new ButtonBuilder()
                    .setStyle((option === 'True' ? ButtonStyle.Success : (option === 'False' ? ButtonStyle.Danger : ButtonStyle.Primary)))
                    .setLabel(option)
                    .setCustomId(String(index))
            })
        )

        setTimeout(async () => {
            const answers = new Map<string, { time: number, answer: number }>()

            await msg.edit({
                embeds: [
                    embed
                ],
                components: [
                    optionsRow
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

                    return true
                },
                time: 1000 * ([10, 10, 15, 20, 20][question.difficulty])
            })

            collector.on('collect', async (btn) => {
                const previous = answers.has(btn.user.id)
                answers.set(btn.user.id, { time: Math.ceil(((msg.editedTimestamp as number) - Date.now()) / 1000), answer: Number(btn.customId) })
                await btn.reply({
                    content: `You ${previous ? 'changed your mind and ' : ''}selected ${inlineCode(question.options[Number(btn.customId)])}. ${[
                        'Intelligent?',
                        'Genius...?',
                        'Lightning fast?',
                        'Sharp mind?',
                        'Brainy?',
                        'We\'ll see...',
                        'Ya sure about that?',
                        'Waiting for it to snow?',
                        'Wanting to build a snowman?'
                    ][Math.floor(Math.random() * 9)]}`,
                    ephemeral: true
                })
            })

            collector.on('end', async () => {
                try {
                    embed
                        .setDescription('Did you get it right?')
                        .addFields([
                            {
                                name: 'Correct Answer(s)',
                                value: `The ${question.correctAnswers.length !== 1 ? 'correct answers were' : 'correct answer was'}...\n${commaList(question.options.filter(
                                    (_, i) => {
                                        if (question.correctAnswers.includes(i)) return true
                                        else return false
                                    }
                                )
                                    .map(
                                        s => inlineCode(s)
                                    )
                                )
                                    }\n${question.note}`
                            },
                            {
                                name: 'Selected Answers',
                                value: Boolean(answers.size)
                                    ? question.options
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
                            question.correctAnswers.includes(ans[1].answer)
                        ) {
                            const userPrizes = prizes.find(p => p.user === user)

                            if (!userPrizes) prizes.push(
                                {
                                    user,
                                    coins: Math.ceil(
                                        [500, 625, 750, 875, 1000][question.difficulty] *
                                        (
                                            ([10, 10, 15, 20, 20][question.difficulty] - ans[1].time) / [10, 10, 15, 20, 20][question.difficulty]
                                        )
                                    ),
                                    XP: Math.ceil(
                                        [1000, 1250, 1500, 1750, 2000][question.difficulty] * (
                                            ([10, 10, 15, 20, 20][question.difficulty] - ans[1].time) / [10, 10, 15, 20, 20][question.difficulty]
                                        )
                                    )
                                }
                            )
                            else {
                                userPrizes.coins += Math.ceil(
                                    [500, 625, 750, 875, 1000][question.difficulty] *
                                    (
                                        ([10, 10, 15, 20, 20][question.difficulty] - ans[1].time) / [10, 10, 15, 20, 20][question.difficulty]
                                    )
                                )
                                userPrizes.XP += Math.ceil(
                                    [1000, 1250, 1500, 1750, 200][question.difficulty] * (
                                        ([10, 10, 15, 20, 20][question.difficulty] - ans[1].time) / [10, 10, 15, 20, 20][question.difficulty]
                                    )
                                )
                            }
                        }
                    })

                    optionsRow.components
                        .map((b, i) => {
                            if (
                                question.correctAnswers.includes(i) && [...answers.values()].some(s => s.answer === i)
                            ) {
                                b.setStyle(ButtonStyle.Success)
                            } else if (
                                !question.correctAnswers.includes(i) && [...answers.values()].some(s => s.answer === i)
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
                                : 'When\'s anyone gonna participate!'
                                }`
                        })
                    }, 2500)
                } catch {
                    return
                } finally {
                    setTimeout(async () => {
                        questionNumber++

                        if (questionNumber < questions.length) {
                            nextQuestion(interaction)
                        } else {
                            await msg.channel.send('The event is over - I hope it\'s snowing outside this Chrizmas! Did your knowledge of ZBot increase?')

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
                                                    .join('\n') + '\nThe top 3 users will get an extra 3000 XP and 1500 ZCoins; 2000 XP and 1000 ZCoins; and 1000 XP and 500 ZCoins, the 4th- and 5th-place runners-up will get 500 XP and 250 ZCoins; and everyone else 250 XP and 125 ZCoins. **Double rewards have been removed due to full balances.**'
                                                : 'Nobody participated... why. 😭'
                                                }`
                                        })

                                        leaders.forEach(async (pos, ind, arr) => {
                                            switch (ind) {
                                                case 0:
                                                    await LevelModel.increment({
                                                        xp: pos.XP + 3000
                                                    }, {
                                                        where: {
                                                            id: pos.user
                                                        }
                                                    })
                                                    await EconomyModel.increment({
                                                        wallet: pos.coins + 1500
                                                    }, {
                                                        where: {
                                                            id: pos.user
                                                        }
                                                    })
                                                    break
                                                case 1:
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
                                                case 2:
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
                                                case 3:
                                                case 4:
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
                                                default:
                                                    await LevelModel.increment({
                                                        xp: pos.XP + 250
                                                    }, {
                                                        where: {
                                                            id: pos.user
                                                        }
                                                    })
                                                    await EconomyModel.increment({
                                                        wallet: pos.coins + 125
                                                    }, {
                                                        where: {
                                                            id: pos.user
                                                        }
                                                    })
                                                    break
                                            }
                                            if (ind === arr.length - 1) {
                                                let karolinePayments = 0
                                                let hairlinePayments = 0

                                                const [
                                                    hairlineButton,
                                                    karolineButton
                                                ] = [
                                                        new ButtonBuilder()
                                                            .setCustomId('hairlineCharity')
                                                            .setLabel('Donate to help Zahid buy a hairline!')
                                                            .setStyle(ButtonStyle.Primary)
                                                            .setEmoji('💷'),
                                                        new ButtonBuilder()
                                                            .setCustomId('karolineCharity')
                                                            .setLabel('Help poor Karoline buy a new warm house!')
                                                            .setStyle(ButtonStyle.Primary)
                                                            .setEmoji('🏡')
                                                    ]

                                                const [
                                                    five,
                                                    twentyFive,
                                                    fifty,
                                                    hundred,
                                                    twohundredfifty
                                                ] = [
                                                        new ButtonBuilder()
                                                            .setCustomId('5')
                                                            .setLabel('5 ZCoins')
                                                            .setStyle(ButtonStyle.Primary),
                                                        new ButtonBuilder()
                                                            .setCustomId('25')
                                                            .setLabel('25 ZCoins')
                                                            .setStyle(ButtonStyle.Primary),
                                                        new ButtonBuilder()
                                                            .setCustomId('50')
                                                            .setLabel('50 ZCoins')
                                                            .setStyle(ButtonStyle.Primary),
                                                        new ButtonBuilder()
                                                            .setCustomId('100')
                                                            .setLabel('100 ZCoins')
                                                            .setStyle(ButtonStyle.Primary),
                                                        new ButtonBuilder()
                                                            .setCustomId('250')
                                                            .setLabel('250 ZCoins')
                                                            .setStyle(ButtonStyle.Primary)
                                                    ]

                                                const message = await msg.channel.send({
                                                    content: `Everyone\'s coins and XP have been given. Come back for the next Quiz Night!\n\n**Hey!** Before you go... Two surprises:\n1. **The Zahid Hairline Charity** - raise money for a cause, you never know, your actions could help Zahid to pay for a new hairline after suffering from the cost of living crisis.\n2. **Please help to buy <@1014486062309052416> a home** as she is one of the many children living in poverty and suffering from the shivering cold of the winter.\n**You can donate to these users using buttons below.**`,
                                                    components: [
                                                        new ActionRowBuilder<ButtonBuilder>()
                                                            .setComponents(
                                                                hairlineButton,
                                                                karolineButton
                                                            )
                                                    ]
                                                })

                                                const messageCollector = message.createMessageComponentCollector({
                                                    componentType: ComponentType.Button,
                                                    filter: async (button) => {
                                                        const karolineBalance = await EconomyModel.findOne({ where: { id: '1014486062309052416' } })
                                                        if (button.customId === 'karolineCharity' && (karolineBalance?.maxWallet || 0) - (karolineBalance?.wallet || 0) <= 5) {
                                                            await button.reply({
                                                                content: 'You cannot donate to this charity because the user\'s balance is full.',
                                                                ephemeral: true
                                                            })
                                                            return false
                                                        }
                                                        return true
                                                    },
                                                    time: 600000
                                                })

                                                messageCollector.on('collect', async (btn) => {
                                                    const reply = await btn.reply({
                                                        content: `Please select an amount you would like to donate. This will be taken out of your wallet. A response is required <t:${Math.floor(Date.now() / 1000) + 120
                                                            }:R>`,
                                                        components: [
                                                            new ActionRowBuilder<ButtonBuilder>()
                                                                .setComponents(
                                                                    five,
                                                                    twentyFive,
                                                                    fifty,
                                                                    hundred,
                                                                    twohundredfifty
                                                                ),
                                                            new ActionRowBuilder<ButtonBuilder>()
                                                                .setComponents(
                                                                    new ButtonBuilder()
                                                                        .setCustomId('cancel')
                                                                        .setLabel('Cancel')
                                                                        .setStyle(ButtonStyle.Danger)
                                                                )
                                                        ],
                                                        ephemeral: true,
                                                        fetchReply: true
                                                    })

                                                    const replyCollector = reply.createMessageComponentCollector({
                                                        componentType: ComponentType.Button,
                                                        time: 120000
                                                    })

                                                    replyCollector.on('collect', async (replyBtn) => {
                                                        if (btn.customId === 'cancel') {
                                                            replyCollector.stop('CANCEL')
                                                        } else {
                                                            if (btn.customId === 'karolineCharity') {
                                                                karolinePayments += Number(replyBtn.customId)
                                                                await EconomyModel.increment({
                                                                    wallet: Number(replyBtn.customId)
                                                                }, {
                                                                    where: {
                                                                        id: '1014486062309052416'
                                                                    }
                                                                })
                                                                await EconomyModel.decrement({
                                                                    wallet: Number(replyBtn.customId)
                                                                }, {
                                                                    where: {
                                                                        id: replyBtn.user.id
                                                                    }
                                                                })
                                                            } else {
                                                                hairlinePayments += Number(replyBtn.customId)
                                                                await (await ZCentralBankModel.findAll())[0].increment({
                                                                    original: Number(replyBtn.customId),
                                                                    moneyTaken: Number(replyBtn.customId)
                                                                })
                                                                await EconomyModel.decrement({
                                                                    wallet: Number(replyBtn.customId)
                                                                }, {
                                                                    where: {
                                                                        id: replyBtn.user.id
                                                                    }
                                                                })
                                                            }

                                                            await replyBtn.reply(`You have donated **${inlineCode(replyBtn.customId)} Z:coin:** to **${btn.id === 'karolineCharity' ? 'buy <@1014486062309052416> a home' : 'buy Zahid a hairline'}**. Thanks a lot!`)
                                                            replyCollector.stop()
                                                        }
                                                    })

                                                    replyCollector.on('end', async (collected, reason) => {
                                                        await reply.edit({
                                                            content: (collected.size && reason !== 'CANCEL') ? `You have donated ${collected[0].id} Z:coin: to ${btn.customId === 'karolineCharity' ? 'buy <@1014486062309052416> a home' : 'buy <@1014486062309052416> a home'} - thanks a lot!` : 'Didn\'t receive a response in time or was cancelled.',
                                                            components: [
                                                                new ActionRowBuilder<ButtonBuilder>()
                                                                    .setComponents(
                                                                        [five,
                                                                            twentyFive,
                                                                            fifty,
                                                                            hundred,
                                                                            twohundredfifty].map(b => b.setStyle(ButtonStyle.Secondary).setDisabled(true))
                                                                    ),
                                                                new ActionRowBuilder<ButtonBuilder>()
                                                                    .setComponents(
                                                                        new ButtonBuilder()
                                                                            .setCustomId('cancel')
                                                                            .setLabel('Cancel')
                                                                            .setStyle(ButtonStyle.Danger)
                                                                            .setDisabled(true)
                                                                    )
                                                            ]
                                                        })
                                                    })
                                                })
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
    } else {
        embed
            .setTitle(null)
            .setDescription(`Prizes! Lucky or not? They\'ll be gone ${time(Math.ceil(Date.now() / 1000 + 10), 'R')}!`)
            .setFields([])
            .setColor(0x0077ff)

        optionsRow.setComponents(
            question.gifts.map((_, index) => {
                return new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel('\u200b')
                    .setCustomId(String(index))
            })
        )

        const msg = await channel.send({
            embeds: [
                embed
            ],
            components: [
                optionsRow
            ]
        })

        const answers = new Map<string, { time: number, answer: number }>()

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

                return true
            },
            time: 10000
        })

        collector.on('collect', async (btn) => {
            const previous = answers.has(btn.user.id)
            answers.set(btn.user.id, { time: Math.ceil(((msg.editedTimestamp as number) - Date.now()) / 1000), answer: Number(btn.customId) })
            await btn.reply({
                content: `You ${previous ? 'changed your mind and ' : ''}selected a square. Lucky?`,
                ephemeral: true
            })
        })

        collector.on('end', async () => {
            try {
                embed
                    .setDescription('Wonder what you uncovered...')

                // const collectedAnswers = [...answers.values()]
                const collectedAnswers = Array.from(answers)
                collectedAnswers.forEach((ans) => {
                    const user = ans[0]
                    if (
                        question.gifts[ans[1].answer]
                    ) {
                        const userPrizes = prizes.find(p => p.user === user)

                        const timeOrder = collectedAnswers
                            .filter(a => a[1].answer === ans[1].answer)
                            .sort((a, b) => a[1].time > b[1].time ? 1 : -1)

                        if (!userPrizes) {
                            prizes.push(
                                // @ts-ignore
                                {
                                    user,
                                    [question.gifts[ans[1].answer]?.type === "ZCoins" ? 'coins' : 'XP']: Math.round(
                                        (question.gifts[ans[1].answer]?.amount || 0) * (
                                            (timeOrder[0][1].time - ans[1].time) / timeOrder[0][1].time
                                        )
                                    ),
                                    [question.gifts[ans[1].answer]?.type === "ZCoins" ? 'XP' : 'coins']: 0
                                }
                            )
                        } else {
                            userPrizes[question.gifts[ans[1].answer]?.type === "ZCoins" ? 'coins' : 'XP'] += Math.round(
                                (question.gifts[ans[1].answer]?.amount || 0) * (
                                    (timeOrder[0][1].time - ans[1].time) / timeOrder[0][1].time
                                )
                            )
                        }
                    }
                })

                optionsRow.components
                    .map((b, i) => {
                        const questionGifts = question.gifts[i]
                        b
                            .setStyle(questionGifts ? ButtonStyle.Success : ButtonStyle.Secondary)
                            .setLabel(questionGifts ? `${questionGifts.amount} ${questionGifts.type}` : '\u200b')
                        b.setDisabled(true)
                    })

                await msg.edit({
                    embeds: [
                        embed
                    ],
                    components: [
                        optionsRow
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

                    if (questionNumber < questions.length) {
                        nextQuestion(interaction)
                    } else {
                        await msg.channel.send('The event is over - spooky Halloween! Did your knowledge of ZBot increase?')

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
    }

    return
}

function notEmpty<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined
}

export {
    quizCommand
}