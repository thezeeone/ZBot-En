import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction } from "discord.js"
import { Cmd } from "./command-exports"

const punishmentsCommand: Cmd = {
    data: {
        name: 'punishments',
        description: 'View all punishments you or a user has.',
        options: [
            {
                name: 'user',
                description: 'Display this user\'s punishments',
                type: ApplicationCommandOptionType.User,
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const user = interaction.options.getUser('user') || interaction.user

        return await interaction.reply({
            content: 'No one has punishments yet. **But...** Keep an eagle eye! as punishments will be logged and displayed here.',
            components: interaction.guild.id !== '1000073833551769600' ? [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setEmoji('⚠')
                            .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804'),
                        new ButtonBuilder()
                            .setEmoji('🔗')
                            .setLabel('Join ZBot Support Server!')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.gg/6tkn6m5g52')
                    )
            ] : [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setEmoji('⚠')
                            .setLabel('Breaking Changes coming to PSWMEs, Case System, Rank Cards, and Sudoku')
                            .setStyle(ButtonStyle.Link)
                            .setURL('https://discord.com/channels/1000073833551769600/1010853170328633394/1042885833235103804')
                    )
            ]
        })
    }
}

export {
    punishmentsCommand
}