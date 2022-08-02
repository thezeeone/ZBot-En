import { ApplicationCommandOptionType, bold, ChatInputCommandInteraction, EmbedBuilder, GuildMember, inlineCode, italic, PermissionsBitField } from "discord.js"
import { commaList, ordinalNumber, pluralise } from "../util"
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
        const member = interaction.options.getMember('member')
        const reason = interaction.options.getString('reason')

        // Avoid repetition
        const botMember = <GuildMember>interaction.guild.members.me

        // Check if the member is in the server
        if (!member) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.user.tag} (${interaction.user.id})`,
                    iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                })
                .setTitle(`${inlineCode('/kick')} - Member not found`)
                .setDescription(`Couldn't find that member.`)
                .setColor(0xff0000)
            ],
            ephemeral: true
        })

        // Check if the bot's highest role is higher than the member's highest
        if (member.roles.highest.position >= (<GuildMember>interaction.guild.members.me).roles.highest.position) {
            const memberRolePos = member.roles.highest.position
            const botRolePos = botMember.roles.highest.position
            const numRoles = interaction.guild.roles.cache.size - 1
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.user.tag} (${interaction.user.id})`,
                        iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                    })
                    .setTitle(`${inlineCode('/kick')} - Role Hierarchy`)
                    .setDescription(`Unable to kick member. Member's highest permission (${
                        bold(member.roles.highest.name)
                    } ${
                        inlineCode(member.roles.highest.id)
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

        // Required permissions
        const perms = new PermissionsBitField('KickMembers').toArray()

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
                    .setTitle(`${inlineCode('/kick')} - Missing Permissions`)
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

        // Check if the member is manageable apart from any other conditions
        // This will stop the bot from throwing errors when it kicks the member afterwards
        if (!member.kickable) return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.user.tag} (${interaction.user.id})`,
                    iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                })
                .setTitle(`${inlineCode('/kick')} - Member unkickable`)
                .setDescription(`Member unkickable.\nCannot kick this member, reason unknown.`)
                .setColor(0xff0000)
            ],
            ephemeral: true
        })

        // Directly message the member and reply, if it doesn't work the bot will inform, and kick anyways
        member.send({
            embeds: [
                new EmbedBuilder()
                .setColor(0xff7700)
                .setTitle('Kick')
                .setDescription(`You have been kicked from ${bold(interaction.guild.name)}.`)
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
                content: 'Kick successful. Member has been messaged.',
                embeds: [
                    EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                    .setColor(0x00ff00)
                    .setTitle('Kick Successful')
                    .setDescription(`Successfully kicked ${
                        bold(member.user.tag)
                    } (${member.user.id}) from ${
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
                content: 'Kick successful. Couldn\'t send the member a message.',
                embeds: [
                    EmbedBuilder.from((await interaction.fetchReply()).embeds[0])
                    .setColor(0x00ff00)
                    .setTitle('Kick Successful')
                    .setDescription(`Successfully kicked ${
                        bold(member.user.tag)
                    } (${member.user.id}) from ${
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
            await member.kick(`Kicked by ${
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
    }
}

export { kickCommand }
