import { ApplicationCommandOptionType, ChatInputCommandInteraction, inlineCode, ButtonBuilder, ButtonStyle, ActionRowBuilder, bold, italic, time, ComponentType } from "discord.js"
import { LevelModel, EconomyModel } from "../database"
import { Cmd, tipsAndTricks } from "./command-exports"

const exchangeCommand: Cmd = {
    data: {
        name: 'exchange',
        description: 'Trade every 50 XP for 25 ZCoins',
        options: [
            {
                name: 'xp-amounts',
                description: 'How many sets of 50 XP you want to trade (1 to 25)',
                type: ApplicationCommandOptionType.Integer,
                required: true,
                minValue: 1,
                maxValue: 25
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const userRank = await LevelModel.findOne({
            where: {
                id: interaction.user.id
            }
        })

        if (!userRank) return await interaction.reply({
            content: 'You don\'t have a rank card yet!',
            ephemeral: true
        })

        const XPamounts = interaction.options.getInteger('xp-amounts', true) * 50

        const totalUserXP = triangularNumbers(userRank.lvl) * 50 + userRank.xp

        if (XPamounts > totalUserXP) return await interaction.reply({
            content: `You don\'t have enough XP! You need ${inlineCode(String(XPamounts - totalUserXP))} more XP to be able to trade for \`${XPamounts / 2}\` Z🪙.`,
            ephemeral: true
        })

        const [
            yesButton,
            noButton
        ] = [
            new ButtonBuilder()
            .setCustomId('yes')
            .setStyle(ButtonStyle.Danger)
            .setLabel('Yes'),
            new ButtonBuilder()
            .setCustomId('no')
            .setStyle(ButtonStyle.Success)
            .setLabel('No')
        ]

        const confirmationRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([yesButton, noButton])

        await interaction.reply({
            content: `Are you sure you would like to exchange ${bold(`${inlineCode(String(XPamounts))} experience points`)} for ${bold(`${inlineCode(String(XPamounts / 2))} Z🪙`)}? This is irreversible.\n\n${
                italic(`A response is required ${
                    time(Math.floor(Date.now()/1000) + 121, 'R')
                }.`)
            }`,
            components: [
                confirmationRow
            ]
        })

        const confirmationCollector = (await interaction.fetchReply()).createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 120000
        })

        confirmationCollector.on('collect', async (button): Promise<any> => {
            if (button.user.id !== interaction.user.id) {
                confirmationCollector.dispose(button)
                return await button.reply({
                    content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!',
                    ephemeral: true
                })
            }
            if (button.customId === 'yes') {
                const original = await interaction.fetchReply()
                yesButton.setDisabled(true)
                noButton.setDisabled(true)
                original.edit({
                    content: `Successfully exchanged ${bold(`${inlineCode(String(XPamounts))} experience points`)} for ${bold(`${inlineCode(String(XPamounts / 2))} Z🪙`)}. This amount has been added to your wallet.\n${
                        Math.random() < 0.1
                        ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                        : ''
                    }`,
                    components: []
                })

                const userBankAndWallet = await EconomyModel.findOne({
                    where: {
                        id: interaction.user.id
                    }
                })

                if (userBankAndWallet) await EconomyModel.increment({
                    wallet: XPamounts / 2
                }, {
                    where: {
                        id: interaction.user.id
                    }
                }) 
                else await EconomyModel.create({
                    wallet: XPamounts / 2,
                    maxWallet: ((await LevelModel.findOne({ where: { id: interaction.user.id } }))?.lvl || 1) * 50,
                    maxBank:(3 + ((await LevelModel.findOne({ where: { id: interaction.user.id } }))?.lvl || 1)) * 50,
                    bank: 0,
                    id: interaction.user.id
                })

                await LevelModel.increment({
                    xp: -XPamounts,
                }, {
                    where: {
                        id: interaction.user.id
                    }
                })

                if (userRank.xp >= (userRank.lvl + 1) * 50) {
                    do {
                        await userRank.increment({
                            xp: -50 * (userRank.lvl + 1),
                            lvl: 1
                        })
                    } while (userRank.xp >= (userRank.lvl + 1) * 50)
                    return
                } else if (userRank.xp < 0) {
                    do {
                        await userRank.increment({ xp: 50 * userRank.lvl })
                        await userRank.decrement({ lvl: 1 })
                    } while (userRank.xp < 0)
                    if (userRank.lvl < 0) {
                        await userRank.update({ lvl: 0 }, { where: { id: interaction.user.id } })
                    }
                    if (userRank.xp < 0) {
                        await userRank.update({ xp: 0 }, { where: { id: interaction.user.id }})
                    }
                    return
                } else if (userRank.lvl < 0) {
                    await userRank.update({ lvl: 0 }, { where: { id: interaction.user.id } })
                    return
                }
            } else {
                const original = await interaction.fetchReply()
                yesButton.setDisabled(true)
                noButton.setDisabled(true)
                original.edit({
                    content: 'Exchange cancelled.',
                    components: [ confirmationRow ]
                })
                button.reply(`You cancelled the exchange.\n${
                    Math.random() < 0.1
                    ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                    : ''
                }`)
            }
        })

        confirmationCollector.on('end', async (collected): Promise<any> => {
            if (collected.size) return
            else {
                const original = await interaction.fetchReply()
                yesButton.setDisabled(true)
                noButton.setDisabled(true)
                original.edit({
                    content: 'A response wasn\'t received in time.',
                    components: [ confirmationRow ]
                })
                return await interaction.followUp('A response wasn\'t received in time.')
            }
        })

        return
    }
}

function triangularNumbers(num: number): number {
    return ((num + 1) * num) / 2
}

export {
    exchangeCommand
}