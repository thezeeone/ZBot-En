import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, inlineCode, italic } from "discord.js"
import { EconomyModel } from "../database"
import { Cmd, tipsAndTricks } from "./command-exports"

const balanceCommand: Cmd = {
    data: {
        name: 'balance',
        description: 'See how much money you have',
        options: [
            {
                name: 'user',
                description: 'The user you want to display the balance of',
                type: ApplicationCommandOptionType.User,
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const user = interaction.options.getUser('user') || interaction.user

        const userBalance = await EconomyModel.findOne({
            where: {
                id: user.id
            }
        })

        if (!userBalance || (userBalance?.bank === 0 && userBalance?.wallet === 0)) return await interaction.reply({
            content: `${user.id === interaction.user.id
                ? `${user.toString()} you don't`
                : `${inlineCode(user.tag)} doesn't`
                } have any money!`,
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

        if (
            (userBalance.wallet > userBalance.maxWallet || userBalance.bank > userBalance.maxBank)
            && !(userBalance.wallet > userBalance.maxWallet && userBalance.bank > userBalance.maxBank)
        ) {
            if (userBalance.wallet - userBalance.maxWallet <= userBalance.bank - userBalance.maxBank) {
                await EconomyModel.increment({
                    bank: userBalance.wallet - userBalance.maxWallet,
                    wallet: -1 * (userBalance.wallet - userBalance.maxWallet)
                }, {
                    where: {
                        id: user.id
                    }
                })
            } else if (userBalance.bank - userBalance.maxBank <= userBalance.wallet - userBalance.maxWallet) {
                await EconomyModel.increment({
                    bank: -1 * (userBalance.bank - userBalance.maxBank),
                    wallet: userBalance.bank - userBalance.maxBank
                }, {
                    where: {
                        id: user.id
                    }
                })
            }
        }

        await interaction.reply({
            content: `${user.id === interaction.user.id
                ? 'You have'
                : `${user.username} has`
                } ${userBalance.wallet
                    ? `**\`${userBalance.wallet.toLocaleString('ru')}\` Z🪙**`
                    : '**no money**'
                } in ${user.id === interaction.user.id ? 'your' : 'their'} wallet out of maximum ${inlineCode(userBalance.maxWallet.toLocaleString('ru'))} and ${userBalance.bank
                    ? `**\`${userBalance.bank.toLocaleString('ru')}\` Z🪙**`
                    : '**no money**'
                } in ${user.id === interaction.user.id ? 'your' : 'their'} bank out of maximum ${inlineCode(userBalance.maxBank.toLocaleString('ru'))}.${userBalance.wallet / userBalance.maxWallet > 1 || userBalance.bank / userBalance.maxBank > 1
                    ? `\n⚠ ***Warning** ${user.id === interaction.user.id ? 'You' : 'This user'
                    } have more coins than ${user.id == interaction.user.id ? 'you' : 'they'
                    } can store.*`
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

        return
    }
}

export {
    balanceCommand
}