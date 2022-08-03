import { ApplicationCommandOptionType, bold, ChatInputCommandInteraction, EmbedBuilder, GuildMember, inlineCode, italic, PermissionsBitField } from "discord.js"
import { commaList, ordinalNumber, pluralise } from "../util"
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
        const subcmd = interaction.options.getSubcommand(true) as "set" | "remove"

        // Avoid repetition
        const botMember = <GuildMember>interaction.guild.members.me

        if (subcmd === "remove") {
            // Remove a user's ban

            // Input
            const user = interaction.options.getUser('user', true)
            const reason = interaction.options.getString('reason', true)

            // Check if the user exists
            if (!user) return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`${inlineCode('/ban remove')} - User not found`)
                    .setDescription(`Couldn't find that user.`)
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })

            // Check if the user is already banned
            if (!interaction.guild.bans.cache.has(user.id)) return await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`${inlineCode('/ban remove')} - User not banned`)
                    .setDescription('This user isn\'t banned.')
                    .setColor(0xff0000)
                ], 
                ephemeral: true 
            })

            // Required permissions
            const perms = new PermissionsBitField('BanMembers').toArray()

            if (
                !perms.every(perm => botMember.permissions.has(perm))
                ) {
                const missingPerms = perms.filter(p => !botMember.permissions.has(p))
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(`${inlineCode('/ban remove')} - Missing Permissions`)
                        .setDescription(`Bot is missing permissions.\nThis command requires the bot to have the ${
                            bold(
                                `${commaList(
                                    perms
                                    .map(
                                        s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                    )
                                )} ${
                                    pluralise(perms.length, 'permissions')
                                }`
                            )
                        }.\nThe bot has the ${
                            bold(
                                `${commaList(
                                    perms
                                    .filter(
                                        p => !missingPerms.includes(p)
                                    )
                                    .map(
                                        s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                    )
                                )} ${
                                    pluralise(perms.filter(p => !missingPerms.includes(p)).length, 'permissions')
                                }`
                            )
                        }, however is __missing__ the ${
                            bold(
                                `${commaList(
                                    missingPerms
                                    .map(
                                        s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                    )
                                )} ${
                                    pluralise(missingPerms.length, 'permissions')
                                }`
                            )
                        }.`)
                        .setColor(0xff0000)
                    ],
                    ephemeral: true
                })
            }

            // Check if the user exists
            if (!user) return await interaction.reply({ embeds: [
                new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.user.tag} (${interaction.user.id})`,
                    iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                })
                .setTitle(`${inlineCode('/ban remove')} - User ID incorrect`)
                .setDescription(`Couldn't find that user, check the user ID is correct.`)
                .setColor(0xff0000)
            ], 
            ephemeral: true })

            // Unban the user
            user.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('Unban')
                    .setDescription(`Your ban has been removed in ${bold(interaction.guild.name)}.`)
                    .addFields([
                        {
                            name: 'Reason',
                            value: reason
                                ? reason
                                : italic(inlineCode('No reason provided'))
                        }
                    ])
                ]
            })
            .then(async () => {
                await interaction.reply({
                    content: 'Unban successful. Member has been messaged.',
                    embeds: [
                        EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                        .setColor(0x00ff00)
                        .setTitle('Unban Successful')
                        .setDescription(`Successfully unbanned ${
                            bold(user.tag)
                        } (${inlineCode(user.id)}) from ${
                            bold(interaction.guild.name)  
                        } ${
                            reason
                            ? `with reason ${bold(reason)}`
                            : 'without a reason'
                        }.`)
                        .setAuthor(null)
                        .setFields([])
                    ]
                })
            })
            .catch(async () => {
                await interaction.reply({
                    content: 'Unban removal successful. Couldn\'t send the member a message.',
                    embeds: [
                        EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                        .setColor(0x00ff00)
                        .setTitle('Unban Successful')
                        .setDescription(`Successfully unbanned ${
                            bold(user.tag)
                        } (${inlineCode(user.id)}) from ${
                            bold(interaction.guild.name)
                        } ${
                            reason
                            ? `with reason ${bold(reason)}`
                            : 'without a reason'
                        }.`)
                        .setAuthor(null)
                        .setFields([])
                    ]
                })
            })
            .finally(async () => {
                await interaction.guild.members.unban(user, `Unbanned by ${
                        interaction.user.tag
                    } (${
                        interaction.user.id
                    }) ${
                        reason 
                        ? `with reason ${reason}` 
                        : 'without a reason'
                    }.`
                )
            })
        } else {
            // Ban a user/member

            const user = interaction.options.getUser('user', true)
            const reason = interaction.options.getString('reason')
            const userAsMember = interaction.guild.members.cache.get(user.id)
            const days = interaction.options.getInteger('clear') || 0

            if (userAsMember) {
                // Check if the bot's highest role is higher than the member's highest, IF the member is in the server
                if (userAsMember.roles.highest.position >= botMember.roles.highest.position) {
                    const memberRolePos = userAsMember.roles.highest.position
                    const botRolePos = botMember.roles.highest.position
                    const numRoles = interaction.guild.roles.cache.size - 1
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setAuthor({
                                name: `${interaction.user.tag} (${interaction.user.id})`,
                                iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                            })
                            .setTitle(`${inlineCode('/ban set')} - Role Hierarchy`)
                            .setDescription(`Unable to ban member. Member's highest permission (${
                                bold(userAsMember.roles.highest.name)
                            } ${
                                inlineCode(userAsMember.roles.highest.id)
                            }, ${
                                numRoles - memberRolePos === 0 
                                ? bold('highest role')
                                : bold(`${
                                    inlineCode(ordinalNumber(numRoles - memberRolePos))
                                } highest role`)
                            }) is ${
                                memberRolePos === botRolePos
                                ? bold('the same role as')
                                : bold(`${inlineCode(
                                    pluralise(memberRolePos - botRolePos, 'role')
                                )}`)
                            } higher than my highest role (${
                                bold(botMember.roles.highest.name)
                            } ${
                                inlineCode(botMember.roles.highest.id)
                            }, ${
                                numRoles - memberRolePos === 0 
                                ? bold('highest role')
                                : bold(`${
                                    inlineCode(ordinalNumber(numRoles - memberRolePos))
                                } highest role`)
                            }).`)
                            .setColor(0xff0000)
                        ],
                        ephemeral: true
                    })
                }

                // Check if the member is bannable apart from any other conditions
                // This will stop the bot from throwing errors when it bans the member afterwards
                if (!userAsMember.bannable) return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(`${inlineCode('/ban set')} - Member unbannable`)
                        .setDescription('This member cannot be unbanned. Reason unknown.')
                        .setColor(0xff0000)
                    ],
                    ephemeral: true
                })
            }
            
            // Check if the user exists
            if (!user) return await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`${inlineCode('/ban set')} - User unknown`)
                    .setDescription('Couldn\'t find that user.')
                    .setColor(0xff0000)
                ], ephemeral: true 
            })

            // Check if the user is already banned
            if (interaction.guild.bans.cache.has(user.id)) return await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`${inlineCode('/ban set')} - User already banned`)
                    .setDescription('This user is already banned.')
                    .setColor(0xff0000)
                ],
                ephemeral: true
            })

            // Required permissions
            const perms = new PermissionsBitField('BanMembers').toArray()

            if (
                !perms.every(perm => botMember.permissions.has(perm))
            ) {
                const missingPerms = perms.filter(p => !botMember.permissions.has(p))
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.user.tag} (${interaction.user.id})`,
                            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                        })
                        .setTitle(`${inlineCode('/ban set')} - Missing Permissions`)
                        .setDescription(`Bot is missing permissions.\nThis command requires the bot to have the ${
                            bold(
                                `${commaList(
                                    perms
                                    .map(
                                        s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                    )
                                )} ${
                                    pluralise(perms.length, 'permissions')
                                }`
                            )
                        }.\nThe bot has the ${
                            bold(
                                `${commaList(
                                    perms
                                    .filter(
                                        p => !missingPerms.includes(p)
                                    )
                                    .map(
                                        s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                    )
                                )} ${
                                    pluralise(perms.filter(p => !missingPerms.includes(p)).length, 'permissions')
                                }`
                            )
                        }, however is __missing__ the ${
                            bold(
                                `${commaList(
                                    missingPerms
                                    .map(
                                        s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                                    )
                                )} ${
                                    pluralise(missingPerms.length, 'permissions')
                                }`
                            )
                        }.`)
                        .setColor(0xff0000)
                    ],
                    ephemeral: true
                })
            }    

            // Directly message the user (if possible) and reply, if it doesn't work the bot will inform, and ban anyways
            user.send({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('Ban')
                    .setDescription(`You have been banned in ${bold(interaction.guild.name)}.`)
                    .addFields([
                        {
                            name: 'Reason',
                            value: reason
                                ? reason
                                : italic(inlineCode('No reason provided'))
                        }
                    ])
                ]
            })
            .then(async () => {
                await interaction.reply({
                    content: 'Ban successful. Member has been messaged.',
                    embeds: [
                        EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                        .setColor(0x00ff00)
                        .setTitle('Ban Successful')
                        .setDescription(`Successfully banned ${
                            bold(user.tag)
                        } (${inlineCode(user.id)}) from ${
                            bold(interaction.guild.name)  
                        } ${
                            reason
                            ? `with reason ${bold(reason)}`
                            : 'without a reason'
                        }, clearing ${
                            days === 0
                            ? bold('no message history')
                            : bold(`${inlineCode(pluralise(days, 'day'))} of message history`)
                        }.`)
                        .setAuthor(null)
                        .setFields([])
                    ]
                })
            })
            .catch(async () => {
                await interaction.reply({
                    content: 'Ban successful. Couldn\'t send the member a message.',
                    embeds: [
                        EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                        .setColor(0x00ff00)
                        .setTitle('Ban Successful')
                        .setDescription(`Successfully banned ${
                            bold(user.tag)
                        } (${inlineCode(user.id)}) from ${
                            bold(interaction.guild.name)
                        } ${
                            reason
                            ? `with reason ${bold(reason)}`
                            : 'without a reason'
                        }, clearing ${
                            days === 0
                            ? bold('no message history')
                            : bold(`${inlineCode(pluralise(days, 'day'))} of message history`)
                        }.`)
                        .setAuthor(null)
                        .setFields([])
                    ]
                })
            })
            .finally(async () => {
                await interaction.guild.members.unban(user, `Banned by ${
                        interaction.user.tag
                    } (${
                        interaction.user.id
                    }) ${
                        reason 
                        ? `with reason ${reason}` 
                        : 'without a reason'
                    }, clearing ${
                        days === 0
                        ? 'no message history'
                        : `${pluralise(days, 'day')} of message history`
                    }.`
                )
            })
        }
    }
}

export { banCommand }
