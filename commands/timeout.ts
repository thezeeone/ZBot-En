import { Formatters, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction, ButtonStyle, ComponentType, GuildMember, PermissionsBitField } from "discord.js"
import { ordinalNumber } from "../util"
import { Cmd } from "./command-exports"

const timeoutCommand: Cmd = {
    data: {
        name: 'timeout',
        description: 'Timeout a member or remove their timeout',
        options: [
            {
                name: 'set',
                description: 'Give a user a timeout',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'member',
                        description: 'The member to timeout',
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        name: 'days',
                        description: 'Between 0 and 27',
                        type: ApplicationCommandOptionType.Integer,
                        required: false,
                        minValue: 0,
                        maxValue: 27
                    },
                    {
                        name: 'hours',
                        description: 'Between 0 and 23',
                        type: ApplicationCommandOptionType.Integer,
                        required: false,
                        minValue: 0,
                        maxValue: 23
                    },
                    {
                        name: 'minutes',
                        description: 'Between 0 and 59',
                        type: ApplicationCommandOptionType.Integer,
                        required: false,
                        minValue: 0,
                        maxValue: 59
                    },
                    {
                        name: 'seconds',
                        description: 'Between 0 and 59',
                        type: ApplicationCommandOptionType.Integer,
                        required: false,
                        minValue: 0,
                        maxValue: 59
                    },
                    {
                        name: 'reason',
                        description: 'The reason for timing out this member',
                        type: ApplicationCommandOptionType.String,
                        required: false
                    }
                ]
            },
            {
                name: 'remove',
                description: 'Remove a timeout from a user',
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: 'member',
                        description: 'The member to remove the timeout from',
                        type: ApplicationCommandOptionType.User,
                        required: true
                    },
                    {
                        name: 'reason',
                        description: 'The reason for removing timeout from this member',
                        type: ApplicationCommandOptionType.String,
                        required: false
                    }
                ]
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        const sc = (<ChatInputCommandInteraction<"cached">>interaction).options.getSubcommand(true) as "set" | "remove"

        if (sc === "set") {
            const member = (<ChatInputCommandInteraction<"cached">>interaction).options.getMember("member")

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
                    content: `I cannot timeout ${
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
                        : `${memberRolePos - botRolePos} role(s) higher`
                    }).`,
                    ephemeral: true
                })
            }

            // Required permissions
            const perms = new PermissionsBitField('ModerateMembers').toArray()

            if (
                !perms.every(perm => (<GuildMember>interaction.guild.members.me).permissions.has(perm))
            ) {
                return await interaction.reply({
                    content: `Bot is missing permissions.\nThis command requires the bot to have the ${
                        perms
                        .map(
                            s => Formatters.inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                        )
                    } permission(s). The bot is missing ${
                        Formatters.bold('this permission')
                    }.`
                })
            }

            // Check if the member is manageable apart from any other conditions
            // This will stop the bot from throwing errors when it kicks the member afterwards
            if (!member.moderatable) return await interaction.reply({
                content: 'This member is unmoderateable/untimeoutable.',
                ephemeral: true
            })

            // Calculate the number of days, hours, minutes, seconds
            const [
                days,
                hours,
                minutes,
                seconds
            ]: number[] = [
                (<ChatInputCommandInteraction<"cached">>interaction).options.getInteger('days', false) || 0,
                (<ChatInputCommandInteraction<"cached">>interaction).options.getInteger('hours', false) || 0,
                (<ChatInputCommandInteraction<"cached">>interaction).options.getInteger('minutes', false) || 0,
                (<ChatInputCommandInteraction<"cached">>interaction).options.getInteger('seconds', false) || 0
            ]

            // Check if it adds up to a value
            if (days + hours + minutes + seconds === 0) return await interaction.reply({
                content: 'You must provide a duration!',
                ephemeral: true
            })

            // Input
            const reason = (<ChatInputCommandInteraction<"cached">>interaction).options.getString('reason', false)

            // CONFIRMATION
            // Buttons
            const [
                yesButton,
                noButton
            ] = [
                new ButtonBuilder()
                .setCustomId('yes')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Yes'),
                new ButtonBuilder()
                .setCustomId('no')
                .setStyle(ButtonStyle.Success)
                .setLabel('No')
            ]

            const confirmationRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([yesButton, noButton])

            // Check if the user wants to timeout
            await interaction.reply({
                content: `Are you sure you would like to timeout ${
                    Formatters.bold(member.user.tag)
                } (${Formatters.inlineCode(member.user.id)}) for a duration of ${Formatters.bold(
                    [days, hours, minutes, seconds].map((i, ind) => `${["day", "hour", "minute", "second"][ind]}${i === 1 ? 's' : ''}`).join(' ')
                )} ${
                    reason 
                    ? `with reason ${Formatters.bold(reason)}` 
                    : `without a reason`
                }? A response is required ${Formatters.time(Math.floor(Date.now()/1000) + 120, 'R')}.`,                
                components: [ confirmationRow ]
            })

            const confirmationCollector = (await interaction.fetchReply()).createMessageComponentCollector({
                componentType: ComponentType.Button,
                maxComponents: 1,
                time: 120000
            })

            confirmationCollector.on('collect', async (button): Promise<any> => {
                if (button.user.id !== interaction.user.id) return await interaction.reply({
                    content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!!',
                    ephemeral: true
                })
                if (button.customId === 'yes') {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        components: [ confirmationRow ]
                    })
                    // Directly message the member and reply, if it doesn't work the bot will inform, and kick anyways
                    member.send(`You have been timed out in ${
                        Formatters.bold(interaction.guild.name)
                    } ${
                        reason 
                        ? `with reason ${Formatters.bold(reason)}` 
                        : 'without a reason'
                    }.`)
                    .then(async () => {
                        await interaction.reply({
                            content: `Successfully timed out ${
                                Formatters.bold(member.user.tag)
                            } (${
                                Formatters.inlineCode(member.id)
                            }) ${
                                reason
                                ? `with reason ${Formatters.bold(reason)}`
                                : 'without a reason'
                            }, for a duration of ${Formatters.bold(
                                [days, hours, minutes, seconds].map((i, ind) => `${["day", "hour", "minute", "second"][ind]}${i === 1 ? 's' : ''}`).join(' ')
                            )}.`
                        })
                    })
                    .catch(async () => {
                        await interaction.reply({
                            content: `Successfully timed out ${
                                Formatters.bold(member.user.tag)
                            } (${
                                Formatters.inlineCode(member.id)
                            }) ${
                                reason
                                ? `with reason ${Formatters.bold(reason)}`
                                : 'without a reason'
                            }, for a duration of ${Formatters.bold(
                                [days, hours, minutes, seconds].map((i, ind) => `${["day", "hour", "minute", "second"][ind]}${i === 1 ? 's' : ''}`).join(' ')
                            )}. I could not DM them.`
                        })
                    })
                    .finally(async () => {
                        await member.timeout(
                            1000 * (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds),
                            `Timed out by ${interaction.user.tag} (${interaction.user.id}) ${reason ? `with reason ${reason}` : 'without reason'} for a duration of ${[days, hours, minutes, seconds].map((i, ind) => `${["day", "hour", "minute", "second"][ind]}${i === 1 ? 's' : ''}`).join(' ')}`
                        )
                    })
                } else {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        components: [ confirmationRow ]
                    })
                    button.reply('Cancelled timeout.')
                }
            })

            confirmationCollector.on('end', async (collected): Promise<any> => {
                if (!collected.size) {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        content: 'Didn\'t receive a response in time.',
                        components: [ confirmationRow ]
                    })
                    return await interaction.followUp('Took too long for a response.')
                }
            })
        } else {
            // Input
            const member = interaction.options.getMember('member')
            const reason = interaction.options.getString('reason')

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
                    content: `I cannot remove the timeout for ${
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
                        : `${memberRolePos - botRolePos} role(s) higher`
                    }).`,
                    ephemeral: true
                })
            }

            // Required permissions
            const perms = new PermissionsBitField('ModerateMembers').toArray()

            if (
                !perms.every(perm => (<GuildMember>interaction.guild.members.me).permissions.has(perm))
            ) {
                return await interaction.reply({
                    content: `Bot is missing permissions.\nThis command requires the bot to have the ${
                        perms
                        .map(
                            s => Formatters.inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))
                        )
                    } permission(s). The bot is missing ${
                        Formatters.bold('this permission')
                    }.`
                })
            }

            // Check if the member is manageable apart from any other conditions
            // This will stop the bot from throwing errors when it kicks the member afterwards
            if (!member.moderatable) return await interaction.reply({
                content: 'This member is unmoderateable/untimeoutable.',
                ephemeral: true
            })

            // A final check to ensure the member IS timed out
            if (!member.communicationDisabledUntil) return await interaction.reply({
                content: 'This user is not timed out.',
                ephemeral: true
            })
         
            const [
                yesButton,
                noButton
            ] = [
                new ButtonBuilder()
                .setCustomId('yes')
                .setStyle(ButtonStyle.Danger)
                .setLabel('Yes'),
                new ButtonBuilder()
                .setCustomId('no')
                .setStyle(ButtonStyle.Success)
                .setLabel('No')
            ]

            const confirmationRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([yesButton, noButton])

            await interaction.reply({
                content: `Are you sure you would like to remove the timeout for ${
                    Formatters.bold(member.user.tag)
                } (${Formatters.inlineCode(member.user.id)}) ${
                    reason 
                    ? `with reason ${Formatters.bold(reason)}` 
                    : `without a reason`
                }? The user's timeout ends ${
                    Formatters.time(member.communicationDisabledUntil, 'R')
                }.\nA response is required ${Formatters.time(Math.floor(Date.now()/1000) + 120, 'R')}.`,                
                components: [ confirmationRow ]
            })

            const confirmationCollector = (await interaction.fetchReply()).createMessageComponentCollector({
                componentType: ComponentType.Button,
                maxComponents: 1,
                time: 120000
            })

            confirmationCollector.on('collect', async (button): Promise<any> => {
                if (button.user.id !== interaction.user.id) return await interaction.reply({
                    content: 'What do you think you\'re doing, you\'re not allowed to use these buttons!!',
                    ephemeral: true
                })
                if (button.customId === 'yes') {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        components: [ confirmationRow ]
                    })
                    member.send(`Your timeout has been removed in ${
                        Formatters.bold(interaction.guild.name)
                    } ${
                        reason 
                        ? `with reason ${Formatters.bold(reason)}` 
                        : 'without a reason'
                    }.`)
                    .then(async () => {
                        await interaction.reply({
                            content: `Successfully removed timeout for ${
                                Formatters.bold(member.user.tag)
                            } (${
                                Formatters.inlineCode(member.id)
                            }) ${
                                reason
                                ? `with reason ${Formatters.bold(reason)}`
                                : 'without a reason'
                            }.`
                        })
                    })
                    .catch(async () => {
                        await interaction.reply({
                            content: `Successfully removed timeout for ${
                                Formatters.bold(member.user.tag)
                            } (${
                                Formatters.inlineCode(member.id)
                            }) ${
                                reason
                                ? `with reason ${Formatters.bold(reason)}`
                                : 'without a reason'
                            }. I could not DM them.`
                        })
                    })
                    .finally(async () => {
                        await member.timeout(
                            null,
                            `Timed out by ${interaction.user.tag} (${interaction.user.id}) ${reason ? `with reason ${reason}` : 'without reason'}`
                        )
                    })
                } else {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        components: [ confirmationRow ]
                    })
                    interaction.followUp('Cancelled timeout removal.')
                }
            })

            confirmationCollector.on('end', async (collected): Promise<any> => {
                if (!collected.size) {
                    const original = await interaction.fetchReply()
                    yesButton.setDisabled(true)
                    noButton.setDisabled(true)
                    original.edit({
                        content: 'Time is up.',
                        components: [ confirmationRow ]
                    })
                    return await interaction.followUp('Took too long for a response.')
                }
            })
        }
    }
}

export {
    timeoutCommand
}
