import { ApplicationCommandOptionType, ChatInputCommandInteraction, Formatters, GuildMember, PermissionsBitField } from "discord.js"
import { ordinalNumber, pluralisation } from "../util"
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
        // Input
        const member = (<ChatInputCommandInteraction<"cached">>interaction).options.getMember('member')
        const reason = (<ChatInputCommandInteraction<"cached">>interaction).options.getString('reason')

        // Check if the member is in the server
        if (!member) return await interaction.reply({
            content: 'Cannot find that member.',
            ephemeral: true
        })

        // Check if the bot's highest role is higher than the member's highest
        if (member.roles.highest.position >= (<GuildMember>interaction.guild.members.me).roles.highest.position) {
            const memberRolePos = member.roles.highest.position
            const botRolePos = (<GuildMember>interaction.guild.members.me).roles.highest.position
            const numRoles = interaction.guild.roles.cache.size - 1
            return await interaction.reply({
                content: `I cannot kick ${
                    Formatters.bold(member.user.tag)
                } (${
                    Formatters.inlineCode(member.id)
                }) because their highest role (${
                    Formatters.inlineCode(member.roles.highest.name)
                }, ${
                    numRoles - memberRolePos === 0 ? 'highest role' : `${
                        Formatters.inlineCode(ordinalNumber(numRoles - memberRolePos))
                    } highest role`
                }) is higher than or the same as my highest role (${
                    Formatters.inlineCode((<GuildMember>interaction.guild.members.me).roles.highest.name)
                }, ${
                    memberRolePos === botRolePos 
                    ? 'same role' 
                    : `${memberRolePos - botRolePos} ${pluralisation(memberRolePos - botRolePos, 'role')} higher`
                }).`,
                ephemeral: true
            })
        }

        // Required permissions
        const perms = new PermissionsBitField('KickMembers').toArray()

        if (
            !perms.every(perm => (<GuildMember>interaction.guild.members.me).permissions.has(perm))
        ) {
            return await interaction.reply({
                content: `Bot is missing permissions.\nThis command requires the bot to have the ${
                    perms
                    .map(
                        s => Formatters.inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                    )
                } ${
                    pluralisation(
                        perms.length,
                        'permission'
                    )
                }. The bot is missing ${
                    Formatters.bold('this permission')
                }.`
            })
        }

        // Check if the member is kickable apart from any other conditions
        // This will stop the bot from throwing errors when it kicks the member afterwards
        if (!member.kickable) return await interaction.reply({
            content: 'This member is unkickable.',
            ephemeral: true
        })

        // Directly message the member and reply, if it doesn't work the bot will inform, and kick anyways
        member.send(`You have been kicked from ${
            Formatters.bold(interaction.guild.name)
        } ${
            reason 
            ? `with reason ${Formatters.bold(reason)}` 
            : 'without a reason'
        }.`)
        .then(async () => {
            await interaction.reply({
                content: `Successfully kicked ${
                    Formatters.bold(member.user.tag)
                } (${
                    Formatters.inlineCode(member.id)
                }) from the server ${
                    reason
                    ? `with reason ${Formatters.bold(reason)}`
                    : 'without a reason'
                }.`
            })
        })
        .catch(async () => {
            await interaction.reply({
                content: `Successfully kicked ${
                    Formatters.bold(member.user.tag)
                } (${
                    Formatters.inlineCode(member.id)
                }) from the server ${
                    reason
                    ? `with reason ${Formatters.bold(reason)}`
                    : 'without a reason'
                }. I could not DM them.`
            })
        })
        .finally(async () => {
            await member.kick(`Kicked by ${interaction.user.tag} (${interaction.user.id}) ${reason ? `with reason ${reason}` : 'without a reason'}`)
        })
    }
}

export { kickCommand }
