import { ChatInputCommandInteraction } from "discord.js"
import { Cmd } from "./command-exports"

/*
const enum Difficulty {
    Easy,
    Medium,
    Hard,
    Challenging,
    Strenuous
}

const prizes = new Array<{ user: string, coins: number, XP: number }>()

const questions: ({ question: string, options: string[], correctAnswers: number[], note: string, difficulty: Difficulty })[] = [
    // Secrets! Next event is on 31st October 2022 at 20:00. Questions to be prepared at 16:00.
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