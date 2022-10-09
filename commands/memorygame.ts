import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, User, ApplicationCommandOptionType, ButtonStyle, ComponentType, ChatInputCommandInteraction, bold, inlineCode, italic, time } from "discord.js"
import { LevelModel } from "../database"
import { pluralise } from "../util"
import { Cmd } from "./command-exports"

const memoryGameCommand: Cmd = {
    data: {
        name: 'memory-game',
        description: 'Test your memory with this game! (Two-player)',
        options: [
            {
                name: 'opponent',
                description: 'The opponent you want to play with',
                type: ApplicationCommandOptionType.User,
                required: true
            }
        ],
        dmPermission: false
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const opponent = interaction.options.getMember('opponent')
        if (!opponent) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`Member not found`)
                    .setDescription(`Couldn't find that member.`)
                    .setColor(0xff0000)
            ],
            ephemeral: true
        })
        let playerTurn: 0 | 1 = 0 as 0 | 1
        let opponentChoices: number[] = []

    if (opponent.user.id === interaction.user.id || opponent.user.id === interaction.client.user?.id) return await interaction.reply({
        content: 'You can\'t play with yourself or the bot, find someone else to play with!',
        ephemeral: true
    })

    const confirmationEmbed = new EmbedBuilder()
    .setColor(0x00ffff)
    .setTitle('Memory Game - Request')
    .setDescription(`${interaction.user} wants to play memory game with you! Click ${
        bold(inlineCode('Accept'))
    } to accept and start playing, or ${
        bold(inlineCode('Reject'))
    } to reject.\n\n${
        italic(`A response is required ${time(Math.floor(Date.now() / 1000 + 91), 'R')}.`)
    }`)
    .setFooter({
        text: `${interaction.user.username} will start first, and is currently playing.`
    })

    const acceptButton = new ButtonBuilder()
    .setCustomId('accept')              
    .setStyle(ButtonStyle.Success)
    .setLabel('Accept')

        const rejectButton = new ButtonBuilder()
            .setCustomId('reject')
            .setStyle(ButtonStyle.Danger)
            .setLabel('Reject')

        const requestMessage = await interaction.reply({
            content: opponent.user.toString(),
            embeds: [confirmationEmbed],
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents([acceptButton, rejectButton])
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
        if (requestBtn.customId === 'reject') {
            await requestBtn.reply({ content: 'You rejected the request.', ephemeral: true })
            confirmationEmbed
            .setColor(0xff0000)
            .setTitle('Memory Game - Request Rejected')
            .setDescription(`${opponent.user} rejected the request, too bad.`)
            // @ts-ignore
            .setFooter({ text: '' })
            return await requestMessage.edit({
                embeds: [confirmationEmbed],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(acceptButton.setDisabled(true), rejectButton.setDisabled(true))
                ]
            })
        } else {
            await requestBtn.reply({ content: `You accepted the request, now let the game begin!`, ephemeral: true })
            requestCollector.stop()

            let numArr: Array<number> = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]
            let numArrRandomised: Array<number> = []
            let numArrRandomisedCopy: Array<number> = []
    
            do {
                let randomNum = Math.floor(Math.random() * numArr.length)
                numArrRandomised.push(numArr[randomNum])
                numArrRandomisedCopy.push(numArr[randomNum])
                numArr.splice(numArr.indexOf(numArr[randomNum]), 1)
            } while (numArr.length !== 0)
    
            let foundPairs: Array<{
                user: User, 
                customId1: number, 
                    customId2: number,
                    numberFound: number
                }> = []

                let grid: ActionRowBuilder<ButtonBuilder>[] = [
                    new ActionRowBuilder<ButtonBuilder>(),
                    new ActionRowBuilder<ButtonBuilder>(),
                    new ActionRowBuilder<ButtonBuilder>(),
                    new ActionRowBuilder<ButtonBuilder>()
                ].map(
                    (_, rindex) => new ActionRowBuilder<ButtonBuilder>({
                        components:
                            (numArrRandomised.splice(0, 5))
                                .map(
                                    (_item, iindex) => new ButtonBuilder()
                                        .setCustomId(String(rindex * 5 + iindex))
                                        .setDisabled(false)
                                        .setStyle(ButtonStyle.Secondary)
                                        .setLabel('\u200b')
                                )
                    })
                )

            await requestMessage.edit({
                embeds: [
                    (EmbedBuilder.from((await interaction.fetchReply()).embeds[0]))
                    .setColor(0x00ffff)
                    .setTitle('Memory Game Match')
                    .setDescription(`${playerTurn === 0 ? interaction.user : opponent.user} It is now your turn, please select ${bold(`${inlineCode('2')} cards`)}.`)
                    // @ts-ignore
                    .setFooter({ text: '' })
                ],
                content: bold('Let the game begin!'),
                components: grid
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

                opponentChoices.push(Number(collectedBtn.customId))

                if (opponentChoices.length === 1) {
                    grid = grid.map(
                        (_, rindex) => new ActionRowBuilder<ButtonBuilder>({ components:
                            (grid[rindex].components as ButtonBuilder[]).map((btn, bindex) => {
                                return btn
                                .setDisabled(opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                    (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex) 
                                ) 
                                ? true 
                                : false)
                                .setStyle(
                                    foundPairs.some(
                                        (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                    )
                                    ? ButtonStyle.Success
                                    : (opponentChoices.includes(rindex * 5 + bindex) ? ButtonStyle.Primary : ButtonStyle.Secondary)
                                )
                                .setLabel(
                                    opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                        (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                    )
                                    ? String(numArrRandomisedCopy[rindex * 5 + bindex]) 
                                    : '\u200b'
                                )
                            })
                        })
                    )

                    await requestMessage.edit({
                        content: '',
                        embeds: [
                            (EmbedBuilder.from((await interaction.fetchReply()).embeds[0]))
                            .setColor(0x00ffff)
                            .setTitle('Memory Game Match')
                            .setDescription(`${playerTurn === 0 ? interaction.user : opponent.user} It is now your turn, please select ${bold(`${inlineCode('1 more')} card`)}.`)
                        ],
                        components: grid
                    })

                    return await collectedBtn.reply({ 
                        content: `Select **\`1\` more** card.`,
                        fetchReply: true
                    }).then((rpl) => {
                        setTimeout(() => rpl.delete(), 1000)
                    })
                } else if (opponentChoices.length === 2) {
                    grid = grid.map(
                        (_, rindex) => new ActionRowBuilder<ButtonBuilder>({ components:
                            (grid[rindex].components as ButtonBuilder[]).map((btn, bindex) => {
                                return btn
                                .setDisabled(
                                    opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                        (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                    )
                                    ? true 
                                    : false
                                )
                                .setStyle(
                                    foundPairs.some(
                                        (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                    )
                                    ? ButtonStyle.Success
                                    : (opponentChoices.includes(rindex * 5 + bindex) ? ButtonStyle.Primary : ButtonStyle.Secondary)
                                )
                                .setLabel(
                                    opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                        (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                    )
                                    ? String(numArrRandomisedCopy[rindex * 5 + bindex]) 
                                    : '\u200b'
                                )
                            })
                        })
                    )

                    if (
                        opponentChoices
                        .map(choice => (grid[Math.floor(choice / 5)].components[choice % 5] as ButtonBuilder).data.label as string)
                        .every((s, _, arr) => s === arr[0])
                    ) {
                        foundPairs.push({
                            user: playerTurn === 0 ? interaction.user : opponent.user,
                            customId1: opponentChoices[0],
                            customId2: opponentChoices[1],
                            numberFound: Number((grid[Math.floor((opponentChoices[0] || opponentChoices[1]) / 5)].components[(opponentChoices[0] || opponentChoices[1]) % 5] as ButtonBuilder).data.label)
                        })
                        await collectedBtn.reply({ 
                            content: 'Nice match!', 
                            fetchReply: true 
                        }).then((rpl) => {
                            setTimeout(() => rpl.delete(), 500)
                        });
                        grid = grid.map(
                            (_, rindex) => new ActionRowBuilder<ButtonBuilder>({ components: (grid[rindex].components as ButtonBuilder[]).map((btn, bindex) => {
                                return btn
                                    .setDisabled(
                                        opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                            (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                        )
                                        ? true 
                                        : false
                                    )
                                    .setStyle(
                                        foundPairs.some(
                                            (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                        )
                                        ? ButtonStyle.Success
                                        : (opponentChoices.includes(rindex * 5 + bindex) ? ButtonStyle.Primary : ButtonStyle.Secondary)
                                    )
                                    .setLabel(
                                        opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                            (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                        )
                                        ? String(numArrRandomisedCopy[rindex * 5 + bindex]) 
                                        : '\u200b'
                                    )
                                })
                            })
                        )
                        await requestMessage.edit({
                            content: '',
                            embeds: [
                                (EmbedBuilder.from((await interaction.fetchReply()).embeds[0]))
                                .setColor(0x00ff00)
                                .setTitle('Memory Game Match')
                                .setDescription(`${playerTurn === 0 ? interaction.user : opponent.user} Nice match!`)
                            ],
                            components: grid
                        })
                    } else {
                        await collectedBtn.reply({ 
                            content: 'Not quite...', 
                            fetchReply: true
                        }).then((rpl) => {
                            setTimeout(() => rpl.delete(), 500)
                        });
                        grid = grid.map(
                            (_, rindex) => new ActionRowBuilder<ButtonBuilder>({ components: (grid[rindex].components as ButtonBuilder[]).map((btn, bindex) => {
                                return btn
                                    .setDisabled(
                                        opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                            (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                        )
                                        ? true 
                                        : false
                                    )
                                    .setStyle(
                                        foundPairs.some(
                                            (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                        )
                                        ? ButtonStyle.Success
                                        : (opponentChoices.includes(rindex * 5 + bindex) ? ButtonStyle.Danger : ButtonStyle.Secondary)
                                    )
                                    .setLabel(
                                        opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                            (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                        )
                                        ? String(numArrRandomisedCopy[rindex * 5 + bindex]) 
                                        : '\u200b'
                                    )
                                })
                            })
                        )
                        await requestMessage.edit({
                            content: '',
                            embeds: [
                                (EmbedBuilder.from((await interaction.fetchReply()).embeds[0]))
                                .setColor(0xff0000)
                                .setTitle('Memory Game Match')
                                .setDescription(`${playerTurn === 0 ? interaction.user : opponent.user} Not quite...`)
                            ],
                            components: grid
                        })
                    }
                    if (foundPairs.length === 10) {
                        const userFoundPairs = foundPairs.filter(s => s.user.id === interaction.user.id)
                        const opponentFoundPairs = foundPairs.filter(s => s.user.id === opponent.user.id)
                        if (userFoundPairs.length === opponentFoundPairs.length) {
                            requestMessage.edit({
                                content: '',
                                embeds: [
                                    (EmbedBuilder.from((await interaction.fetchReply()).embeds[0]))
                                    .setColor(0x00ff00)
                                    .setTitle('Memory Game Match - Draw!')
                                    .setDescription(`Congratulations, you both drew!\n\nYou will both gain **\`75\` experience points**.`)
                                    .setFooter({
                                        text: `Both players matched 5 pairs of numbers.`
                                    })
                                ]
                            })
                            LevelModel.increment({
                                xp: 125
                            }, {
                                where: {
                                    id: interaction.user.id
                                }
                            })
                            LevelModel.increment({
                                xp: 125
                            }, {
                                where: {
                                    id: opponent.user.id
                                }
                            })
                        } else return await requestMessage.edit({
                            content: '',
                            embeds: [
                                (EmbedBuilder.from((await interaction.fetchReply()).embeds[0]))
                                .setColor(0x00ff00)
                                .setTitle('Memory Game Match - Winner!')
                                .setDescription(`Congratulations ${
                                    userFoundPairs.length > opponentFoundPairs.length
                                    ? interaction.user
                                    : opponent.user
                                }, you won the game!\n\nYou will gain **${
                                    inlineCode(
                                        userFoundPairs.length > opponentFoundPairs.length
                                        ? String(userFoundPairs.length * 25)
                                        : String(opponentFoundPairs.length * 25)
                                    )
                                } experience points**.`)
                                .setFields([
                                    {
                                        name: `${pluralise(userFoundPairs.length, 'pair')} found by starting player`,
                                        value: userFoundPairs
                                        .map((r, i) => `${bold(inlineCode(String(i + 1)))} ${inlineCode(String(r.numberFound))} and ${inlineCode(String(r.numberFound))}`)
                                            .join('\n'),
                                        inline: true
                                    },
                                    {
                                        name: `${pluralise(opponentFoundPairs.length, 'pair')} found by opponent`,
                                        value: opponentFoundPairs
                                        .map((r, i) => `${bold(inlineCode(String(i + 1)))} ${inlineCode(String(r.numberFound))} and ${inlineCode(String(r.numberFound))}`)
                                            .join('\n'),
                                        inline: true
                                    }
                                ])
                                .setFooter({
                                    text: `The winner matched ${userFoundPairs.length > opponentFoundPairs.length ? userFoundPairs.length : opponentFoundPairs.length} pairs of numbers.`
                                })
                            ]
                        })
                        LevelModel.increment({
                            xp: (userFoundPairs.length > opponentFoundPairs.length ? userFoundPairs.length : opponentFoundPairs.length) * 25
                        }, {
                            where: {
                                id: (userFoundPairs.length > opponentFoundPairs.length ? interaction.user : opponent.user).id
                            }
                        })
                    } else {
                        setTimeout(async () => {
                            grid = grid.map(
                                (_, rindex) => new ActionRowBuilder<ButtonBuilder>({ components: (grid[rindex].components as ButtonBuilder[]).map((btn, bindex) => {
                                    return btn
                                        .setDisabled(
                                            foundPairs.some(
                                                (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                            )
                                            ? true 
                                            : false
                                        )
                                        .setStyle(
                                            foundPairs.some(
                                                (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                            )
                                            ? ButtonStyle.Success
                                            : ButtonStyle.Secondary
                                        )
                                        .setLabel(
                                            foundPairs.some(
                                                (n) => (n.customId1 === rindex * 5 + bindex) || (n.customId2 === rindex * 5 + bindex)
                                            )
                                            ? String(numArrRandomisedCopy[rindex * 5 + bindex]) 
                                            : '\u200b'
                                        )
                                    })
                                })
                            )
                            opponentChoices = []
                            playerTurn = (playerTurn === 0) ? 1 : 0
                            return await requestMessage.edit({
                                content: '',
                                embeds: [
                                    (EmbedBuilder.from((await interaction.fetchReply()).embeds[0]))
                                    .setColor(0x00ffff)
                                    .setTitle('Memory Game Match')
                                    .setDescription(`${playerTurn === 0 ? interaction.user : opponent.user} It is now your turn, please select ${bold(`${inlineCode('2')} cards`)}.`)
                                ],
                                components: grid
                            })
                        }, 750)
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
                    .setTitle('Memory Game - No Response Received')
                    .setDescription('A response wasn\'t received in time.')
                    // @ts-ignore
                    .setFooter({ text: '' })
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(acceptButton.setDisabled(true), rejectButton.setDisabled(true))
                ]
            })
            }
        })
    }
}

export {
    memoryGameCommand
}