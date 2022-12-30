import { ActionRowBuilder, ApplicationCommandOptionType, bold, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, Collection, italic, SelectMenuBuilder, time, inlineCode } from "discord.js"
import { pluralise } from "../util"
import { Cmd } from "./command-exports"

const questionCommand: Cmd = {
    data: {
        name: 'question',
        description: 'Ask a question!',
        options: [
            {
                name: 'question',
                description: 'The question to ask',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'duration-minutes',
                description: 'The duration users have to reply (minutes)',
                type: ApplicationCommandOptionType.Number,
                minValue: 1,
                maxValue: 60,
                required: true
            },
            {
                name: 'answer-1',
                description: 'The first answer members can select',
                type: ApplicationCommandOptionType.String,
                minLength: 1,
                maxLength: 50,
                required: true
            },
            {
                name: 'answer-2',
                description: 'The second answer members can select',
                type: ApplicationCommandOptionType.String,
                minLength: 1,
                maxLength: 50,
                required: true
            },
            {
                name: 'answer-3',
                description: 'The third answer members can select',
                type: ApplicationCommandOptionType.String,
                minLength: 1,
                maxLength: 50,
                required: false
            },
            {
                name: 'answer-4',
                description: 'The fourth answer members can select',
                type: ApplicationCommandOptionType.String,
                minLength: 1,
                maxLength: 50,
                required: false
            },
            {
                name: 'answer-5',
                description: 'The fifth answer members can select',
                type: ApplicationCommandOptionType.String,
                minLength: 1,
                maxLength: 50,
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const question = interaction.options.getString('question', true)
        const [
            durationM,
            durationS
        ] =[
            Math.floor(interaction.options.getNumber('duration-minutes', true)),
            Math.floor(interaction.options.getNumber('duration-minutes', true) % 1 * 60)
        ]
        const answers = [
            interaction.options.getString('answer-1', true),
            interaction.options.getString('answer-2', true),
            interaction.options.getString('answer-3'),
            interaction.options.getString('answer-4'),
            interaction.options.getString('answer-5')
        ].filter(notEmpty)

        const selectMenuRow = new ActionRowBuilder<SelectMenuBuilder>()

        const selectMenu = new SelectMenuBuilder()
        .setCustomId('answer-selection')
        .setPlaceholder(answers.length === 2 ? 'Select an answer' : `Select 1 to ${answers.length - 1} answers`)
        .addOptions(
            answers
            .map((s, i) => {
                return {
                    label: s,
                    value: String(i + 1)
                }
            })
        )
        .setMinValues(1)
        .setMaxValues(answers.length - 1)

        selectMenuRow.addComponents(selectMenu)

        const reply = await interaction.reply({
            content: `Select the correct answers. ${italic(`A response is required ${time(Math.floor(Date.now() / 1000) + 120, 'R')}.`)}`,
            components: [ selectMenuRow ],
            fetchReply: true,
            ephemeral: true
        })

        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.SelectMenu,
            time: 120000
        })

        collector.on('collect', async (menu) => {
            const values = menu.values

            try {
                const randomPhrases = [
                    'Can you get this right?',
                    'Test your intelligence!',
                    'Genius...?',
                    'Lightning fast?',
                    'Sharp mind?'
                ]

                const embed = new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.member?.nickname ? `${interaction.member.nickname} (${interaction.user.tag})` : interaction.user.tag} (${interaction.user.id})`,
                    iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                })
                .setColor(0x00ffff)
                .setTitle('Question')
                .setDescription(`Question coming up ${time(Math.floor(Date.now() / 1000) + 11, 'R')}... are you ready?`)
                
                const questionMessage = await menu.reply({
                    embeds: [
                        embed
                    ],
                    components: interaction.guild.id !== '1000073833551769600' ? [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji('🔗')
                                    .setLabel('Join ZBot Support Server!')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.gg/6tkn6m5g52')
                            )
                    ] : [],
                    fetchReply: true
                })

                const buttons = new ActionRowBuilder<ButtonBuilder>({
                    components: answers.map((v, i) => {
                        return new ButtonBuilder()
                        .setCustomId(String(i + 1))
                        .setLabel(v)
                        .setStyle(ButtonStyle.Primary)
                    })
                })

                setTimeout(() => {
                    embed
                    .setDescription(`${randomPhrases[Math.floor(randomPhrases.length * Math.random())]} ${italic(`Ends ${time(Math.floor(Date.now() / 1000) + (durationM * 60 + durationS))} (${bold(time(Math.floor(Date.now() / 1000) + (durationM * 60 + durationS), 'R'))})`)}`)
                    .addFields([
                        {
                            name: 'Question',
                            value: question
                        }
                    ])

                    questionMessage.edit({
                        embeds: [embed],
                        components: [buttons]
                    })

                    const collector = questionMessage.createMessageComponentCollector({
                        componentType: ComponentType.Button,
                        time: (durationM * 60 + durationS) * 1000
                    })

                    const userAnswers = new Collection<number, string[]>()

                    answers.forEach((_, i) => userAnswers.set(i + 1, []))

                    collector.on('collect', async (btn) => {
                        const choiceAnswers = userAnswers.get(Number(btn.customId))

                        if (choiceAnswers) {
                            if (userAnswers.some((v) => v.includes(btn.user.id))) {
                                await btn.reply({
                                    content: 'You\'ve already chosen an answer, you can\'t choose another one!',
                                    ephemeral: true
                                })
                                return
                            } else {
                                choiceAnswers.push(btn.user.id)
                                userAnswers.set(Number(btn.customId), choiceAnswers)
                                await btn.reply({
                                    content: `You have selected the ${inlineCode(answers[Number(btn.customId) - 1])} answer. You cannot change your mind.`,
                                    ephemeral: true
                                })
                            }
                        } else {
                            await btn.reply({ content: 'An error occured.', ephemeral: true })
                            return
                        }
                    })

                    collector.on('end', () => {
                        try {
                            embed
                            .setTitle('Question Ended!')
                            .setDescription('Did you get it right?')
                            .setFields([
                                {
                                    name: 'Question Asked',
                                    value: question
                                },
                                {
                                    name: 'Answers',
                                    value: (userAnswers.some(s => Boolean(s.length)))
                                    ? userAnswers
                                    .map((r, k) => `${r.length ? bold(pluralise(r.length, 'person', 'people')) : 'Nobody'} selected ${bold(answers[Number(k) - 1])}`)
                                    .join('\n')
                                    : 'No answers were collected in the time being!'
                                }
                            ])

                            buttons.components.map((b, i) => {
                                if (values.includes(String(i + 1))) {
                                    b.setStyle(ButtonStyle.Success)
                                } else if (!values.includes(String(i + 1)) && userAnswers.get(i + 1)?.length) {
                                    b.setStyle(ButtonStyle.Danger)
                                } else {
                                    b.setStyle(ButtonStyle.Secondary)
                                }
                                b.setDisabled(true)
                                return b
                            })
    
                            questionMessage.edit({
                                embeds: [embed],
                                components: [buttons]
                            })
                        } catch {
                            questionMessage.delete().catch(async () => {
                                return await interaction.channel?.send('An error occured with the original message - question cancelled.')
                            })
                        }
                    })
                }, 10000)
            } catch (error) {
                return console.log(error)
            }
        })

        collector.on('end', async (collected) => {
            if (!collected.size) {
                try {
                    selectMenu
                    .setDisabled(true)
                    .setPlaceholder('No answer was selected!')
                    await reply.edit({
                        content: 'Didn\'t receive a response in time.',
                        components: interaction.guild.id !== '1000073833551769600' ? [
                            selectMenuRow,
                            new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setEmoji('🔗')
                                        .setLabel('Join ZBot Support Server!')
                                        .setStyle(ButtonStyle.Link)
                                        .setURL('https://discord.gg/6tkn6m5g52')
                                )
                        ] : [
                            selectMenuRow
                        ]
                    })
                    return
                } catch (error) {
                    return console.log(error)
                }
            }
        })
    }
}

function notEmpty<T>(v: T | null | undefined): v is T {
    return !!v
}

export {
    questionCommand
}