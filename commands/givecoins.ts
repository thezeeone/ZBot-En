import { ApplicationCommandOptionType, ChatInputCommandInteraction, inlineCode, ButtonBuilder, ButtonStyle, ActionRowBuilder, bold, italic, time, ComponentType, EmbedBuilder, underscore } from "discord.js"
import { LevelModel, EconomyModel, BlacklistModel } from "../database"
import { Cmd, tipsAndTricks } from "./command-exports"

const giveCommand: Cmd = {
    data: {
        name: 'give-coins',
        description: 'Give your ZCoins to another user (from your wallet)',
        options: [
            {
                name: 'coins',
                description: 'How many ZCoins you want to give away',
                type: ApplicationCommandOptionType.Integer,
                minValue: 1,
                required: true
            },
            {
                name: 'user',
                description: 'The user you want to give your XP to',
                type: ApplicationCommandOptionType.User,
                required: true
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const amount = interaction.options.getInteger('coins', true)
        const member = interaction.options.getMember('user')

        if (!member) return await interaction.reply({
            content: 'Member not found.',
            ephemeral: true
        })

        const userBalance = await EconomyModel.findOne({
            where: {
                id: interaction.user.id
            }
        })

        if (!userBalance) return await interaction.reply('How do you give away money if you don\'t have any at all?!')

        if (amount > userBalance.wallet) return await interaction.reply('How do you give more than what you have in your wallet?!')        

        const [
            yesButton,
            noButton
        ] = [
            new ButtonBuilder()
            .setCustomId('yes')
            .setStyle(ButtonStyle.Success)
            .setLabel('Yes'),
            new ButtonBuilder()
            .setCustomId('no')
            .setStyle(ButtonStyle.Danger)
            .setLabel('No')
        ]

        const confirmationRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([yesButton, noButton])

        await interaction.reply({
            content: `Are you sure you would like to give ${bold(`${inlineCode(String(amount))} Z🪙`)} to ${
                bold(member.user.tag)
            } (${inlineCode(member.id)})?\n\n${
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
                
                if (btn.user.id !== interaction.user.id) {
                    await btn.reply({
                        content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!',
                        ephemeral: true
                    })
                    return false
                } else if (btn.customId !== 'yes' && btn.customId !== 'no') return false

                if (btn.user.id !== interaction.user.id) {
                    await btn.reply({
                        content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!',
                        ephemeral: true
                    })
                    return false
                } else if (btn.customId !== 'yes' && btn.customId !== 'no') return false

                else return true
            },
            time: 120000
        })

        confirmationCollector.on('collect', async (button): Promise<any> => {
            if (button.customId === 'yes') {
                const original = await interaction.fetchReply()
                yesButton.setDisabled(true)
                noButton.setDisabled(true)
                original.edit({
                    content: `Successfully given ${bold(`${inlineCode(String(amount))} Z🪙`)} to ${
                        bold(member.user.tag)
                    } (${inlineCode(member.id)}).\n${
                        Math.random() < 0.1
                        ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                        : ''
                    }`,
                    components: []
                })

                const userBankAndWallet = await EconomyModel.findOne({
                    where: {
                        id: member.user.id
                    }
                })

                if (userBankAndWallet) await EconomyModel.increment({
                    wallet: amount
                }, {
                    where: {
                        id: member.user.id
                    }
                }) 
                else await EconomyModel.create({
                    wallet: amount,
                    maxBank: ((await LevelModel.findOne({ where: { id: interaction.user.id } }))?.lvl || 1) * 50,
                    bank: 0,
                    id: member.user.id,
                    maxWallet: (((await LevelModel.findOne({ where: { id: interaction.user.id } }))?.lvl || 1) + 3) * 50
                })

                await EconomyModel.increment({
                    wallet: -amount,
                }, {
                    where: {
                        id: interaction.user.id
                    }
                })
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
    }
}

export {
    giveCommand
}