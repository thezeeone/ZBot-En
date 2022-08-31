import { ApplicationCommandOptionType, bold, ChatInputCommandInteraction, inlineCode, italic } from "discord.js";
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

        userBalance.increment({
            wallet: -amount,
            bank: amount
        })
        .then(async () => {
            return await interaction.reply(`Successfully deposited ${bold(`${inlineCode(amount.toString())} Z🪙`)} into your bank.\n${
                Math.random() < 0.1
                ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                : ''
            }`)
        })
        .catch(async () => {
            return await interaction.reply('Couldn\'t deposit money to bank.')
        })
    }
}

export {
    depositCommand
}