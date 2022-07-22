import { ApplicationCommandOptionType, ChatInputCommandInteraction, Formatters } from "discord.js"
import { Cmd } from "./command-exports"

const kickCommand: Cmd = {
    data: {
        name: 'kick',
        description: 'Kick a member',
        options: [
            {
                name: 'member',
                description: 'The member to kick',
                type: ApplicationCommandOptionType.User,
                required: true
            },
            {
                name: 'reason',
                description: 'The reason for kicking this member',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const member = (<ChatInputCommandInteraction<"cached">>interaction).options.getMember('member')
        const reason = (<ChatInputCommandInteraction<"cached">>interaction).options.getString('reason')

        if (!member) return await interaction.reply({
            content: 'Cannot find that member.',
            ephemeral: true
        })

        member.kick(`Kicked by ${interaction.user.tag} (${interaction.user.id}) ${reason ? `with reason ${reason}` : 'without reason'}`)
        .then(async () => {
            return await interaction.reply({ content: `Successfully kicked ${Formatters.bold(member.user.tag)} (${member.id}) from the server ${reason ? `with reason ${Formatters.bold(reason)}` : 'without a reason'}.`})
        })
        .catch(async () => {
            return await interaction.reply({ content: 'Unable to kick that member.', ephemeral: true })
        })
    }
}

export { kickCommand }