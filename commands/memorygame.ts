import { Formatters, ActionRowBuilder, ButtonBuilder, EmbedBuilder, User, ApplicationCommandOptionType, ButtonStyle, GuildMember, ComponentType, ChatInputCommandInteraction } from "discord.js"
import { LevelModel } from "../database"
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
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const opponent = (<ChatInputCommandInteraction<"cached">>interaction).options.getMember('opponent') as GuildMember
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
            Formatters.bold(Formatters.inlineCode('Yes'))
        } to accept and start playing, or ${
            Formatters.bold(Formatters.inlineCode('No'))
        } to reject.\n\n${
            Formatters.italic(`A response is required ${Formatters.time(Math.floor(Date.now() / 1000 + 90), 'R')}.`)
        }`)
        .setFooter({
            text: `${interaction.user.username} will start first.`
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
                .addComponents([yesButton, noButton])
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
                .setTitle('Memory Game - Request Rejected')
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

                let numArr: Array<number> = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]
                let numArrRandomised: Array<number> = []
                let numArrRandomisedCopy: Array<number> = []
        
                do {
                    let randomNum = Math.floor(Math.random() * numArr.length)
                    numArrRandomised.push(numArr[randomNum])
                    numArrRandomisedCopy.push(numArr[randomNum])
                    numArr.splice(numArr.indexOf(numArr[randomNum]), 1)
                } while (numArr.length !== 0)
        
                let foundPairs: Array<[User, number, number]> = []
        
                let grid: ActionRowBuilder<ButtonBuilder>[] = [
                    new ActionRowBuilder<ButtonBuilder>(),
                    new ActionRowBuilder<ButtonBuilder>(),
                    new ActionRowBuilder<ButtonBuilder>(),
                    new ActionRowBuilder<ButtonBuilder>()
                ].map(
                    (_, rindex) => new ActionRowBuilder<ButtonBuilder>({ components:
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
                    content: `${
                        playerTurn === 0 ? interaction.user : opponent.user
                    } It is now your turn, please select two cards.`,
                    embeds: [],
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
                                        (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex 
                                    ) 
                                    ? true 
                                    : false)
                                    .setStyle(
                                        foundPairs.some(
                                            (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                        )
                                        ? ButtonStyle.Success
                                        : (opponentChoices.includes(rindex * 5 + bindex) ? ButtonStyle.Primary : ButtonStyle.Secondary)
                                    )
                                    .setLabel(
                                        opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                            (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                        )
                                        ? String(numArrRandomisedCopy[rindex * 5 + bindex]) 
                                        : '\u200b'
                                    )
                                })
                            })
                        )

                        await requestMessage.edit({
                            content: `${
                                playerTurn === 0 ? interaction.user : opponent.user
                            } It is now your turn, please select one more card.`,
                            embeds: [],
                            components: grid
                        })

                        return await collectedBtn.reply({ content: `Select **\`1\` more** card.`, ephemeral: true })
                    } else if (opponentChoices.length === 2) {
                        grid = grid.map(
                            (_, rindex) => new ActionRowBuilder<ButtonBuilder>({ components:
                                (grid[rindex].components as ButtonBuilder[]).map((btn, bindex) => {
                                    return btn
                                    .setDisabled(
                                        opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                            (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                        )
                                        ? true 
                                        : false
                                    )
                                    .setStyle(
                                        foundPairs.some(
                                            (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                        )
                                        ? ButtonStyle.Success
                                        : (opponentChoices.includes(rindex * 5 + bindex) ? ButtonStyle.Primary : ButtonStyle.Secondary)
                                    )
                                    .setLabel(
                                        opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                            (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                        )
                                        ? String(numArrRandomisedCopy[rindex * 5 + bindex]) 
                                        : '\u200b'
                                    )
                                })
                            })
                        )

                        if (
                            opponentChoices
                            .map(choice => (grid[Math.floor(choice / 5)].components[choice % 5] as ButtonBuilder).data.label)
                            .every((s, _, arr) => s as string === arr[0] as string)
                        ) {
                            foundPairs.push([playerTurn === 0 ? interaction.user : opponent.user, opponentChoices[0], opponentChoices[1]])
                            await collectedBtn.reply({ content: 'Nice match!', ephemeral: true });
                            grid = grid.map(
                                (_, rindex) => new ActionRowBuilder<ButtonBuilder>({ components: (grid[rindex].components as ButtonBuilder[]).map((btn, bindex) => {
                                    return btn
                                        .setDisabled(
                                            opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                                (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                            )
                                            ? true 
                                            : false
                                        )
                                        .setStyle(
                                            foundPairs.some(
                                                (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                            )
                                            ? ButtonStyle.Success
                                            : (opponentChoices.includes(rindex * 5 + bindex) ? ButtonStyle.Primary : ButtonStyle.Secondary)
                                        )
                                        .setLabel(
                                            opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                                (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                            )
                                            ? String(numArrRandomisedCopy[rindex * 5 + bindex]) 
                                            : '\u200b'
                                        )
                                    })
                                })
                            )
                            await requestMessage.edit({
                                content: `${
                                    playerTurn === 0 ? interaction.user : opponent.user
                                } Nice match!`,
                                components: grid
                            })
                        } else {
                            await collectedBtn.reply({ content: 'Not quite...', ephemeral: true });
                            grid = grid.map(
                                (_, rindex) => new ActionRowBuilder<ButtonBuilder>({ components: (grid[rindex].components as ButtonBuilder[]).map((btn, bindex) => {
                                    return btn
                                        .setDisabled(
                                            opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                                (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                            )
                                            ? true 
                                            : false
                                        )
                                        .setStyle(
                                            foundPairs.some(
                                                (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                            )
                                            ? ButtonStyle.Success
                                            : (opponentChoices.includes(rindex * 5 + bindex) ? ButtonStyle.Danger : ButtonStyle.Secondary)
                                        )
                                        .setLabel(
                                            opponentChoices.includes(rindex * 5 + bindex) || foundPairs.some(
                                                (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                            )
                                            ? String(numArrRandomisedCopy[rindex * 5 + bindex]) 
                                            : '\u200b'
                                        )
                                    })
                                })
                            )
                            await requestMessage.edit({
                                content: `${
                                    playerTurn === 0 ? interaction.user : opponent.user
                                } Not quite...`,
                                components: grid
                            })
                        }
                        if (foundPairs.length === 10) {
                            const numberUserFoundPairs = foundPairs.filter(s => s[0].id === interaction.user.id)
                            const numberOpponentFoundPairs = foundPairs.filter(s => s[0].id === opponent.user.id)
                            if (numberUserFoundPairs.length === numberOpponentFoundPairs.length) {
                                requestMessage.edit(`${Formatters.bold('Draw!')}\nYou both found the same amount of pairs of numbers, good game!\nBoth of you will gain **\`125\` experience points**.`)
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
                            }
                            else return await requestMessage.edit(`${Formatters.bold('We have a winner!')}\nCongratulations ${
                                numberUserFoundPairs.length > numberOpponentFoundPairs.length
                                ? interaction.user
                                : opponent.user
                            }, you won the game! You matched ${Formatters.bold(`${
                                numberUserFoundPairs.length > numberOpponentFoundPairs.length
                                ? Formatters.inlineCode(String(numberUserFoundPairs.length))
                                : Formatters.inlineCode(String(numberOpponentFoundPairs.length))
                            } pairs`)} of numbers.\nYou will gain **${Formatters.inlineCode(String((numberUserFoundPairs.length > numberOpponentFoundPairs.length) ? numberUserFoundPairs.length * 25 : numberOpponentFoundPairs.length * 25))} experience points**.`)
                            LevelModel.increment({
                                xp: (numberUserFoundPairs.length > numberOpponentFoundPairs.length ? numberUserFoundPairs.length : numberOpponentFoundPairs.length) * 25
                            }, {
                                where: {
                                    id: (numberUserFoundPairs.length > numberOpponentFoundPairs.length ? interaction.user : opponent.user).id
                                }
                            })
                        } else {
                            setTimeout(async () => {
                                grid = grid.map(
                                    (_, rindex) => new ActionRowBuilder<ButtonBuilder>({ components: (grid[rindex].components as ButtonBuilder[]).map((btn, bindex) => {
                                        return btn
                                            .setDisabled(
                                                foundPairs.some(
                                                    (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                                )
                                                ? true 
                                                : false
                                            )
                                            .setStyle(
                                                foundPairs.some(
                                                    (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
                                                )
                                                ? ButtonStyle.Success
                                                : ButtonStyle.Secondary
                                            )
                                            .setLabel(
                                                foundPairs.some(
                                                    (n) => n[1] === rindex * 5 + bindex || n[2] === rindex * 5 + bindex
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
                                    content: `${
                                        playerTurn === 0 ? interaction.user : opponent.user
                                    } It is now your turn, please select two cards.`,
                                    embeds: [],
                                    components: grid
                                })
                            }, 1875)
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
    memoryGameCommand
}