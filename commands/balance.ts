import { ApplicationCommandOptionType, ChatInputCommandInteraction, inlineCode, italic } from "discord.js"
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

        if (!userBalance) return await interaction.reply(`${
            user.id === interaction.user.id
            ? `${user.toString()} you don't`
            : `${inlineCode(user.tag)} doesn't`
        } have any money!`)

        await interaction.reply(`${
            user.id === interaction.user.id
            ? 'You have'
            : `${user.username} has`
        } ${
            userBalance.wallet
            ? `**\`${userBalance.wallet}\` Z🪙**`
            : '**no money**'
        } in ${user.id === interaction.user.id ? 'your' : 'their'} wallet and ${
            userBalance.bank
            ? `**\`${userBalance.bank}\` Z🪙**`
            : '**no money**'
        } in ${user.id === interaction.user.id ? 'your' : 'their'} bank.\n${
            Math.random() < 0.1
            ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
            : ''
        }`)

        return
    }
}

export {
    balanceCommand
}