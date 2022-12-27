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
            },
            {
                name: 'skip-confirmation',
                description: 'Whether to give coins without confirmation',
                type: ApplicationCommandOptionType.Boolean,
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const amount = interaction.options.getInteger('coins', true)
        const member = interaction.options.getMember('user')
        const skipConfirmation = interaction.options.getBoolean('skip-confirmation')

        if (!member) return await interaction.reply({
            content: 'Member not found.',
            ephemeral: true
        })

        if (member.id === interaction.user.id) return await interaction.reply('How do you give coins to yourself...?')

        if (member.user.bot) return await interaction.reply('Bots don\'t deserve ZCoins! Nevermind, am I being a hypocrite...')

        const userBalance = await EconomyModel.findOne({
            where: {
                id: interaction.user.id
            }
        })

        const memberBalance = await EconomyModel.findOne({
            where: {
                id: member.user.id
            }
        }) || await EconomyModel.create({
            wallet: amount,
            maxWallet: ((await LevelModel.findOne({ where: { id: member.id } }))?.lvl || 1) * 50,
            maxBank: (3 + ((await LevelModel.findOne({ where: { id: member.id } }))?.lvl || 1)) * 50,
            bank: 0,
            id: member.user.id
        })

        if (!userBalance) return await interaction.reply({ content: 'How do you give away money if you don\'t have any at all?!' })

        if (amount > userBalance.wallet) return await interaction.reply({ content: 'How do you give more than what you have in your wallet?!' })

        if ((memberBalance.maxWallet - memberBalance.wallet >= 0) && amount > memberBalance.maxWallet - memberBalance.wallet) return await interaction.reply(
            memberBalance.maxWallet - memberBalance.wallet !== 0
                ? `You can only give this user a maximum of ${bold(`${inlineCode((memberBalance.maxWallet - memberBalance.wallet).toLocaleString('ru'))} Z🪙`)} due to the available space in their wallet.`
                : 'This user has no free space available in their wallet.'
        )

        if (skipConfirmation) {
            await interaction.reply({
                content: `Successfully given ${bold(`${inlineCode(amount.toLocaleString('ru'))} Z🪙`)} to ${bold(member.user.tag)
                    } (${inlineCode(member.id)}). ${italic('Confirmation has been skipped.')}${(userBalance.wallet / userBalance.maxWallet > 1 || userBalance.bank / userBalance.maxBank > 1) || ((memberBalance?.wallet || 0) / (memberBalance?.maxWallet || 0) > 1 || (memberBalance?.bank || 0) / (memberBalance?.maxBank || 0) > 1)
                        ? `\n⚠ ***Warning** Either you, this user, or both of You have more coins than you can store. By <t:1668038400:F> (<t:1668038400:R>), excess money will be taken to the central bank - whether it\'s an overloaded bank or overloaded wallet.*`
                        : ''
                    }\n${Math.random() < 0.1
                        ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                        : ''
                    }`,
                components: interaction.guild.id !== '1000073833551769600'
                    ? [
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji('🔗')
                                    .setLabel('Join ZBot Support Server!')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.gg/6tkn6m5g52')
                            )
                    ]
                    : []
            })


            await EconomyModel.increment({
                wallet: amount
            }, {
                where: {
                    id: member.user.id
                }
            })

            await EconomyModel.increment({
                wallet: -amount,
            }, {
                where: {
                    id: interaction.user.id
                }
            })
        } else {
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
                content: `Are you sure you would like to give ${bold(`${inlineCode(amount.toLocaleString('ru'))} Z🪙`)} to ${bold(member.user.tag)
                    } (${inlineCode(member.id)})?\n\n${italic(`A response is required ${time(Math.floor(Date.now() / 1000) + 121, 'R')
                        }.`)
                    }`,
                components: interaction.guild.id !== '1000073833551769600'
                    ? [
                        confirmationRow,
                        new ActionRowBuilder<ButtonBuilder>()
                            .addComponents(
                                new ButtonBuilder()
                                    .setEmoji('🔗')
                                    .setLabel('Join ZBot Support Server!')
                                    .setStyle(ButtonStyle.Link)
                                    .setURL('https://discord.gg/6tkn6m5g52')
                            )
                    ]
                    : [
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
                if (button.user.id !== interaction.user.id) {
                    confirmationCollector.dispose(button)
                    return await button.reply({
                        content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!',
                        ephemeral: true
                    })
                }
                if (button.customId === 'yes') {
                    const original = await interaction.fetchReply()
                    original.edit({
                        content: `Successfully given ${bold(`${inlineCode(amount.toLocaleString('ru'))} Z🪙`)} to ${bold(member.user.tag)
                            } (${inlineCode(member.id)}).${(userBalance.wallet / userBalance.maxWallet > 1 || userBalance.bank / userBalance.maxBank > 1) || ((memberBalance?.wallet || 0) / (memberBalance?.maxWallet || 0) > 1 || (memberBalance?.bank || 0) / (memberBalance?.maxBank || 0) > 1)
                                ? `\n⚠ ***Warning** Either you, this user, or both of You have more coins than you can store. By <t:1668038400:F> (<t:1668038400:R>), excess money will be taken to the central bank - whether it\'s an overloaded bank or overloaded wallet.*`
                                : ''
                            }\n${Math.random() < 0.1
                                ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                                : ''
                            }`,
                        components: interaction.guild.id !== '1000073833551769600'
                            ? [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji('🔗')
                                            .setLabel('Join ZBot Support Server!')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.gg/6tkn6m5g52')
                                    )
                            ]
                            : []
                    })


                    await EconomyModel.increment({
                        wallet: amount
                    }, {
                        where: {
                            id: member.user.id
                        }
                    })

                    await EconomyModel.increment({
                        wallet: -amount,
                    }, {
                        where: {
                            id: interaction.user.id
                        }
                    })

                    await button.reply(`Coins given.\n${Math.random() < 0.1
                        ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                        : ''
                        }`)
                } else {
                    const original = await interaction.fetchReply()
                    original.edit({
                        content: 'Exchange cancelled.',
                        components: interaction.guild.id !== '1000073833551769600'
                            ? [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji('🔗')
                                            .setLabel('Join ZBot Support Server!')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.gg/6tkn6m5g52')
                                    )
                            ]
                            : []
                    })
                    await button.reply(`Exchange cancelled.\n${Math.random() < 0.1
                        ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                        : ''
                        }`)
                }
            })

            confirmationCollector.on('end', async (collected): Promise<any> => {
                if (collected.size) return
                else {
                    const original = await interaction.fetchReply()
                    original.edit({
                        content: 'A response wasn\'t received in time.',
                        components: interaction.guild.id !== '1000073833551769600'
                            ? [
                                new ActionRowBuilder<ButtonBuilder>()
                                    .addComponents(
                                        new ButtonBuilder()
                                            .setEmoji('🔗')
                                            .setLabel('Join ZBot Support Server!')
                                            .setStyle(ButtonStyle.Link)
                                            .setURL('https://discord.gg/6tkn6m5g52')
                                    )
                            ]
                            : []
                    })
                    return await interaction.followUp('A response wasn\'t received in time.')
                }
            })
        }

        return
    }
}

export {
    giveCommand
}