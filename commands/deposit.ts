import { ActionRowBuilder, ApplicationCommandOptionType, bold, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, inlineCode, italic } from "discord.js";
import { EconomyModel } from "../database";
import { Cmd, tipsAndTricks } from "./command-exports";

const depositCommand: Cmd = {
    data: {
        name: 'deposit',
        description: 'Deposit money to your bank',
        options: [
            {
                name: 'number',
                description: 'The amount of ZCoins to deposit',
                type: ApplicationCommandOptionType.Integer,
                required: true
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const amount = interaction.options.getInteger('number', true)

        const userBalance = await EconomyModel.findOne({
            where: {
                id: interaction.user.id
            }
        })

        if (!userBalance) return await interaction.reply('You don\'t have any money!')

        if (amount > userBalance.wallet) return await interaction.reply('How do you deposit more into your bank than you have?!')

        if (userBalance.maxBank - userBalance.bank > 0 && amount > userBalance.maxBank - userBalance.bank) return await interaction.reply(`You only have ${bold(`${inlineCode((userBalance.maxWallet - userBalance.wallet).toLocaleString('ru'))} Z🪙`)} free in your bank.`)

        userBalance.increment({
            wallet: -amount,
            bank: amount
        })
            .then(async () => {
                if (
                    (userBalance.wallet > userBalance.maxWallet || userBalance.bank > userBalance.maxBank)
                    && !(userBalance.wallet > userBalance.maxWallet && userBalance.bank > userBalance.maxBank)
                ) {
                    if (userBalance.wallet - userBalance.maxWallet <= userBalance.maxBank - userBalance.bank) {
                        await EconomyModel.increment({
                            bank: userBalance.wallet - userBalance.maxWallet,
                            wallet: -1 * (userBalance.wallet - userBalance.maxWallet)
                        }, {
                            where: {
                                id: interaction.user.id
                            }
                        })
                    } else if (userBalance.bank - userBalance.maxBank <= userBalance.maxWallet - userBalance.wallet) {
                        await EconomyModel.increment({
                            bank: -1 * (userBalance.bank - userBalance.maxBank),
                            wallet: userBalance.bank - userBalance.maxBank
                        }, {
                            where: {
                                id: interaction.user.id
                            }
                        })
                    }
                }

                return await interaction.reply({
                    content: `Successfully deposited ${bold(`${inlineCode(amount.toLocaleString('ru'))} Z🪙`)} into your bank.${userBalance.wallet / userBalance.maxWallet > 1 || userBalance.bank / userBalance.maxBank > 1
                        ? '\n⚠ ***Warning** You have more coins than you can store. By <t:1668038400:F> (<t:1668038400:R>), excess money will be taken to the central bank - whether it\'s an overloaded bank or overloaded wallet.*'
                        : ''
                        }\nℹ ***ZCoin Autobalancer** is enabled. Any excess coins will be used to fill up available empty spaces. This feature will be disabled <t:1669507200:R>.*\n${Math.random() < 0.1
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
            })
            .catch(async () => {
                return await interaction.reply({
                    content: 'Couldn\'t deposit money to bank.',
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
            })

        return
    }
}

export {
    depositCommand
}