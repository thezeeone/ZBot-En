import { ApplicationCommandOptionType, ChatInputCommandInteraction, Formatters } from "discord.js"
import { Cmd } from "./command-exports"

const banCommand: Cmd = {
    data: {
        name: 'ban',
        description: 'Ban or unban a user',
        options: [
            {
                name: 'set',
                description: 'Ban a user',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'user',
                        description: 'The user to ban',
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        name: 'reason',
                        description: 'The reason for banning this user',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: 'clear',
                        description: 'How long to clear from the user\'s message history',
                        type: ApplicationCommandOptionType.Integer,
                        required: false,
                        minValue: 0,
                        maxValue: 7
                    }
                ]
            },
            {
                name: 'remove',
                description: 'Unban a user',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'user',
                        description: 'The user to unban (using ID)',
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                    { 
                        name: 'reason',
                        description: 'The reason for unbanning this user',
                        type: ApplicationCommandOptionType.String,
                        required: true
                    }
                ]
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const subcmd = (<ChatInputCommandInteraction<"cached">>interaction).options.getSubcommand(true) as "set" | "remove"

        if (subcmd === "remove") {
            const user = (<ChatInputCommandInteraction<"cached">>interaction).options.getUser('user', true)
            const reason = (<ChatInputCommandInteraction<"cached">>interaction).options.getString('reason')
            if (!user) return await interaction.reply({ content: 'Cannot find that user, check the user ID is correct.', ephemeral: true })
            interaction.guild.bans.fetch({ user })
            .then(
                async () => {
                    await interaction.guild.bans.remove(user, `Unbanned by ${interaction.user.tag} (${interaction.user.id}) ${reason ? `with reason ${reason}` : 'without reason'}`)
                    return await interaction.reply(`Successfully unbanned ${Formatters.bold(user.tag)} (${Formatters.inlineCode(user.id)}) from this server ${reason ? `with reason ${Formatters.bold(reason)}` : 'without a reason'}. They can now rejoin using an existing invite.`)
                }
            )
            .catch(
                async () => {
                    return await interaction.reply({ content: 'That user isn\'t banned.', ephemeral: true })
                }
            )
        } else {
            const user = (<ChatInputCommandInteraction<"cached">>interaction).options.getUser('user', true)
            const reason = (<ChatInputCommandInteraction<"cached">>interaction).options.getString('reason')
            if (!user) return await interaction.reply({ content: 'Cannot find that user, check the user ID is correct.', ephemeral: true })
            if (interaction.guild.bans.cache.has(user.id)) return await interaction.reply({ content: 'That user has already been banned!', ephemeral: true })
            interaction.guild.bans.create(user, { deleteMessageDays: (<ChatInputCommandInteraction<"cached">>interaction).options.getInteger('days') || 0, reason: `Banned by ${interaction.user.tag} (${interaction.user.id}) ${reason ? `with reason ${reason}` : 'without reason'}` })
            .then(
                async () => {
                    await interaction.guild.bans.remove(user)
                    return await interaction.reply(`Successfully banned ${Formatters.bold(user.tag)} (${Formatters.inlineCode(user.id)}) from this server ${reason ? `with reason ${Formatters.bold(reason)}` : 'without a reason'}. They are unable to join this server until they are unbanned.`)
                }
            )
            .catch(
                async () => {
                    return await interaction.reply({ content: 'Unable to ban that user.', ephemeral: true })
                }
            )
        }
    }
}

export { banCommand }