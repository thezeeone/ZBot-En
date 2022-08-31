import { ApplicationCommandOptionType, bold, ChatInputCommandInteraction, inlineCode, italic } from "discord.js";
import { EconomyModel } from "../database";
import { Cmd, tipsAndTricks } from "./command-exports";

const withdrawCommand: Cmd = {
    data: {
        name: 'withdraw',
        description: 'Withdraw money from your bank',
        options: [
            {
                name: 'number',
                description: 'The amount of ZCoins to withdraw',
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

        if (amount > userBalance.bank) return await interaction.reply('How do you withdraw more from your bank than you have?!')

        userBalance.increment({
            wallet: amount,
            bank: -amount
        })
        .then(async () => {
            return await interaction.reply(`Successfully withdrawn ${bold(`${inlineCode(amount.toString())} Z🪙`)} from your bank.\n${
                Math.random() < 0.1
                ? `💡 **Did you know?** ${italic(tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)])}`
                : ''
            }`)
        })
        .catch(async () => {
            return await interaction.reply('Couldn\'t withdraw money from bank.')
        })
    }
}

export {
    withdrawCommand
}