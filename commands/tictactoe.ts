import { Formatters, ButtonBuilder, ActionRowBuilder, ButtonStyle, GuildMember, ComponentType, EmbedBuilder, ChatInputCommandInteraction, ApplicationCommandOptionType } from "discord.js"
import { LevelModel } from "../database"
import { Cmd } from "./command-exports"

const tttCommand: Cmd = {
    data: {
        name: 'tic-tac-toe',
        description: 'Play tic-tac-toe with your friends!',
        options: [
            {
                name: 'play-as',
                description: 'Whether to play as noughts (O) or crosses (X)',
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: 'Noughts (O)',
                        value: 'O'
                    },
                    {
                        name: 'Crosses (X)',
                        value: 'X' 
                    }
                ],
                required: true
            },
            {
                name: 'play-with',
                description: 'The user you want to play with',
                type: ApplicationCommandOptionType.User,
                required: true
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        let playerChoice = (<ChatInputCommandInteraction<"cached">>interaction).options.getString('play-as', true) as "X" | "O"
        let opponentChoice = (playerChoice === "X" ? "O" : "X") as "X" | "O"
        let playerTurn: 0 | 1 = 0 as 0 | 1
        const opponent = (<ChatInputCommandInteraction<"cached">>interaction).options.getMember('play-with') as GuildMember

        if (opponent.user.id === interaction.user.id || opponent.user.id === interaction.client.user?.id) return await interaction.reply({
            content: 'You can\'t play with yourself or the bot, find someone else to play with!',
            ephemeral: true
        })

        const confirmationEmbed = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle('Tic Tac Toe - Request')
        .setDescription(`${interaction.user} wants to play tic-tac-toe with you! Click ${
            Formatters.bold(Formatters.inlineCode('Yes'))
        } to accept and start playing, or ${
            Formatters.bold(Formatters.inlineCode('No'))
        } to reject.\n\n${
            Formatters.italic(`A response is required ${Formatters.time(Math.floor(Date.now() / 1000 + 90), 'R')}.`)
        }`)
        .setFooter({
            text: `${interaction.user.username} will play as ${playerChoice} and will start first, so you will play as ${opponentChoice}.`
        })

        const yesButton = new ButtonBuilder()
        .setCustomId('yes')              
        .setStyle(ButtonStyle.Success)
        .setLabel('Yes')

        const noButton = new ButtonBuilder()
        .setCustomId('no')
        .setStyle(ButtonStyle.Danger)
        .setLabel('No')
        
        const requestMessage = await interaction.reply({
            content: opponent.user.toString(),
            embeds: [confirmationEmbed],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(yesButton, noButton)
            ],
            fetchReply: true
        })

        const requestCollector = requestMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 90000
        })

        requestCollector.on('collect', async (requestBtn): Promise<any> => {
            if (requestBtn.user.id !== interaction.user.id && requestBtn.user.id !== opponent.user.id) return await requestBtn.reply({
                content: 'You aren\'t playing this match! Please start a new game with someone to be able to play a match.',
                ephemeral: true
            })
            if (requestBtn.user.id === interaction.user.id) return await requestBtn.reply({ 
                content: 'Leave it for the other person to reply!',
                ephemeral: true
            })
            if (requestBtn.customId === 'no') {
                await requestBtn.reply({ content: 'You rejected the request.', ephemeral: true })
                confirmationEmbed
                .setColor(0xff0000)
                .setTitle('Tic Tac Toe - Request Rejected')
                .setDescription(`${opponent.user} rejected the request, too bad.`)
                .setFooter(null)
                return await requestMessage.edit({
                    embeds: [confirmationEmbed],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(yesButton.setDisabled(true), noButton.setDisabled(true))
                    ]
                })
            } else {
                await requestBtn.reply({ content: `You accepted the request, now let the game begin!`, ephemeral: true })
                requestCollector.stop()

                type gridSpace = "X" | "O" | null

                const grid: [
                    [gridSpace, gridSpace, gridSpace],
                    [gridSpace, gridSpace, gridSpace],
                    [gridSpace, gridSpace, gridSpace]
                ] = [
                    [null, null, null],
                    [null, null, null],
                    [null, null, null]
                ]
                let mappedGrid = grid
                .map((row, rowNum) => {
                    return row.map((item, itemNum) => {
                        return new ButtonBuilder()
                        .setCustomId(String(rowNum * 3 + itemNum))
                        .setDisabled(Boolean(item))
                        .setLabel(item ? item : '\u200b')
                        .setStyle(item ? ButtonStyle.Primary : ButtonStyle.Secondary)
                    })
                })
                const cancelButton = new ButtonBuilder()
                .setCustomId('cancel')
                .setDisabled(false)
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Danger)
                const combinations: Array<[number, number, number]> = [
                    [0, 1, 2],
                    [3, 4, 5],
                    [6, 7, 8],
                    [0, 3, 6],
                    [1, 4, 7],
                    [2, 5, 8],
                    [0, 4, 8],
                    [2, 4, 6]
                ]

                await requestMessage.edit({
                    embeds: [],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(mappedGrid[0]),
                        new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(mappedGrid[1]),
                        new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(mappedGrid[2]),
                        new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(cancelButton)
                    ],
                    content: `${
                        Formatters.bold('Let the game begin!')
                    }\n${
                        playerTurn === 0 ? interaction.user : opponent.user
                    } It's now your turn.`
                })

                const buttonCollector = requestMessage.createMessageComponentCollector({ componentType: ComponentType.Button })

                buttonCollector.on('collect', async (collectedBtn): Promise<any> => {
                    if (collectedBtn.user.id !== interaction.user.id && collectedBtn.user.id !== opponent.user.id) return await collectedBtn.reply({
                        content: 'You\'re not playing this match! Please start a new game to be able to play a match.',
                        ephemeral: true
                    })
                    if (collectedBtn.user.id === (playerTurn === 0 ? opponent.user : interaction.user).id) return await collectedBtn.reply({
                        content: 'It\'s not your turn.',
                        ephemeral: true
                    })

                    if (collectedBtn.customId === "cancel") {
                        mappedGrid = grid
                        .map((row, rowNum) => {
                            return row.map((item, itemNum) => {
                                return new ButtonBuilder()
                                .setCustomId(String(rowNum * 3 + itemNum))
                                .setDisabled(true)
                                .setLabel(item ? item : '\u200b')
                                .setStyle(item ? ButtonStyle.Primary : ButtonStyle.Secondary)
                            })
                        })
                        requestMessage.edit({
                            components: [
                                new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[0] }),
                                new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[1] }),
                                new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[2] })
                            ],
                            content: 'Game cancelled.'
                        })
                        buttonCollector.stop()
                        return await collectedBtn.reply({
                            content: 'You cancelled the game.',
                            ephemeral: true
                        })
                    } else {
                        const position = Number(collectedBtn.customId)
                        grid[
                            Math.floor(position / 3)
                        ][
                            position % 3
                        ] = (playerTurn === 0 ? playerChoice : opponentChoice)
                        mappedGrid = grid
                        .map((row, rowNum) => {
                            return row.map((item, itemNum) => {
                                return new ButtonBuilder()
                                .setCustomId(String(rowNum * 3 + itemNum))
                                .setDisabled(Boolean(item))
                                .setLabel(item ? item : '\u200b')
                                .setStyle((item || position === rowNum * 3 + itemNum) ? ButtonStyle.Primary : ButtonStyle.Secondary)
                            })
                        })
                        await collectedBtn.reply({
                            content: 'You have made your move, now it\'s the other player\'s turn.',
                            ephemeral: true
                        })
                        
                        playerTurn = (playerTurn === 0 ? 1 : 0)

                        if (
                            combinations
                            .some(
                                cb => cb.map(s => grid[Math.floor(s / 3)][s % 3]).every((it, _, arr) => (arr[0] || it) && it === arr[0])
                            )
                        ) {
                            const combination = combinations
                            .find(
                                c => c.map(n => grid[Math.floor(n / 3)][n % 3]).every((gs, _, arr) => gs === arr[0])
                            ) as [number, number, number]
                            mappedGrid = grid
                            .map((row, rowNum) => {
                                return row.map((item, itemNum) => {
                                    return new ButtonBuilder()
                                    .setCustomId(String(rowNum * 3 + itemNum))
                                    .setDisabled(true)
                                    .setLabel(item ? item : '\u200b')
                                    .setStyle(combination.includes(rowNum * 3 + itemNum) ? ButtonStyle.Success : (item ? ButtonStyle.Primary : ButtonStyle.Secondary))
                                })
                            })
                            requestMessage.edit({
                                content: `${Formatters.bold('We have a winner!')}\nCongratulations ${
                                    grid[
                                        Math.floor(combination[0] / 3)
                                    ][
                                        combination[0] % 3
                                    ] === playerChoice ? interaction.user : opponent.user
                                }, you won the game!\nYou will gain **\`150\` experience points**.`,
                                components: [
                                    new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[0] }),
                                    new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[1] }),
                                    new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[2] })
                                ],
                            })
                            await collectedBtn.followUp('We have a winner!')
                            LevelModel.increment({
                                xp: 150
                            }, {
                                where: {
                                    id: (grid[
                                        Math.floor(combination[0] / 3)
                                    ][
                                        combination[0] % 3
                                    ] === playerChoice ? interaction.user : opponent.user).id
                                }
                            })
                            return buttonCollector.stop()
                        } else if (
                            mappedGrid.flat().every(s => s.data.disabled)
                        ) {
                            requestMessage.edit({
                                components: [
                                    new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[0].map(b => b.setDisabled(true)) }),
                                    new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[1].map(b => b.setDisabled(true)) }),
                                    new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[2].map(b => b.setDisabled(true)) })
                                ],
                                content: `${Formatters.bold('Draw!')}\nNobody won the match, good game!\nYou will both gain **\`75\` experience points**.`
                            })
                            await collectedBtn.followUp('That was a draw, nice game!')
                            LevelModel.increment({
                                xp: 75
                            }, {
                                where: {
                                    id: interaction.user.id
                                }
                            })
                            LevelModel.increment({
                                xp: 75
                            }, {
                                where: {
                                    id: opponent.user.id
                                }
                            })
                            return buttonCollector.stop()
                        } else {
                            requestMessage.edit({
                                content: `${
                                    playerTurn === 0 ? interaction.user : opponent.user
                                } It's now your turn.`,
                                components: [
                                    new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[0] }),
                                    new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[1] }),
                                    new ActionRowBuilder<ButtonBuilder>({ components: mappedGrid[2] }),
                                    new ActionRowBuilder<ButtonBuilder>({ components: [cancelButton] })
                                ],
                            })
                        }
                    }
                })
            }
        })

        requestCollector.on('end', async (collected): Promise<any> => {
            if (collected.size) return
            else {
                return await requestMessage.edit({
                    embeds: [
                        confirmationEmbed
                        .setColor(0xff0000)
                        .setTitle('Tic Tac Toe - No Response Received')
                        .setDescription('A response wasn\'t received in time.')
                        .setFooter(null)
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(yesButton.setDisabled(true), noButton.setDisabled(true))
                    ]
                })
            }
        })

    }
}

export {
    tttCommand
}