import { ApplicationCommandOptionType, ChatInputCommandInteraction, Formatters, GuildMember, PermissionsBitField } from "discord.js"
import { ordinalNumber, pluralisation } from "../util"
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
        // Input
        const subcmd = (<ChatInputCommandInteraction<"cached">>interaction).options.getSubcommand(true) as "set" | "remove"

        if (subcmd === "remove") {
            // Remove a user's ban

            const user = (<ChatInputCommandInteraction<"cached">>interaction).options.getUser('user')
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
            // Ban a user/member

            const user = interaction.options.getUser('user', true)
            const reason = interaction.options.getString('reason')
            const userAsMember = interaction.guild.members.cache.get(user.id)
            const days = interaction.options.getInteger('clear') || 0

            if (userAsMember) {
                // Check if the bot's highest role is higher than the member's highest, IF the member is in the server
                if (userAsMember.roles.highest.position >= (<GuildMember>interaction.guild.members.me).roles.highest.position) {
                    const memberRolePos = userAsMember.roles.highest.position
                    const botRolePos = (<GuildMember>interaction.guild.members.me).roles.highest.position
                    const numRoles = interaction.guild.roles.cache.size - 1
                    return await interaction.reply({
                        content: `I cannot ban ${
                            Formatters.bold(userAsMember.user.tag)
                        } (${
                            Formatters.inlineCode(userAsMember.id)
                        }) because their highest role (${
                            Formatters.inlineCode(userAsMember.roles.highest.name)
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

                // Check if the member is bannable apart from any other conditions
                // This will stop the bot from throwing errors when it bans the member afterwards
                if (!userAsMember.bannable) return await interaction.reply({
                    content: 'This member is unbannable.',
                    ephemeral: true
                })
            }
            
            // Check if the user exists
            if (!user) return await interaction.reply({ content: 'Cannot find that user, check the user ID is correct.', ephemeral: true })

            // Check if the user is already banned
            if (interaction.guild.bans.cache.has(user.id)) return await interaction.reply({ content: 'That user has already been banned!', ephemeral: true })

            // Required permissions
            const perms = new PermissionsBitField('BanMembers').toArray()

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

            // Directly message the user (if possible) and reply, if it doesn't work the bot will inform, and ban anyways
            user.send(`You have been banned from ${
                Formatters.bold(interaction.guild.name)
            } ${
                reason 
                ? `with reason ${Formatters.bold(reason)}` 
                : 'without a reason'
            }.`)
            .then(async () => {
                await interaction.reply({
                    content: `Successfully banned ${
                        Formatters.bold(user.tag)
                    } (${
                        Formatters.inlineCode(user.id)
                    }) from the server ${
                        reason
                        ? `with reason ${Formatters.bold(reason)}`
                        : 'without a reason'
                    }${
                        days === 0
                        ? '. **No message history** has been cleared'
                        : `, clearing **${Formatters.inlineCode(pluralisation(days, 'day'))} of message history**`
                    }.`
                })
            })
            .catch(async () => {
                await interaction.reply({
                    content: `Successfully banned ${
                        Formatters.bold(user.tag)
                    } (${
                        Formatters.inlineCode(user.id)
                    }) from the server ${
                        reason
                        ? `with reason ${Formatters.bold(reason)}`
                        : 'without a reason'
                    }${
                        days === 0
                        ? '. **No message history** has been cleared'
                        : `, clearing **${Formatters.inlineCode(pluralisation(days, 'day'))} of message history**`
                    }. I could not DM them.`
                })
            })
            .finally(async () => {
                await interaction.guild.bans.create(user, {
                    deleteMessageDays: days,
                    reason: `Banned by ${
                        interaction.user.tag
                    } (${
                        interaction.user.id
                    }) ${
                        reason 
                        ? `with reason ${reason}` 
                        : 'without a reason'
                    }. ${
                        days === 0 
                        ? 'No message history cleared' 
                        : `${pluralisation(days, 'day')} of message history cleared`
                    }.`
                })
            })
        }
    }
}

export { banCommand }
