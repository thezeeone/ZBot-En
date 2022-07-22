import { Formatters, ActionRowBuilder, ButtonBuilder, ApplicationCommandOptionType, ChatInputCommandInteraction, ButtonStyle, ComponentType } from "discord.js"
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
            if (!member) return await interaction.reply({
                content: 'Member is not in this server',
                ephemeral: true
            })
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
            if (days + hours + minutes + seconds === 0) return await interaction.reply({
                content: 'You must provide a duration!',
                ephemeral: true
            })
            const reason = (<ChatInputCommandInteraction<"cached">>interaction).options.getString('reason', false)

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
                content: `Are you sure you would like to timeout ${
                    Formatters.bold(member.user.tag)
                } (${Formatters.inlineCode(member.user.id)}) for a duration of ${Formatters.bold(
                    [days, hours, minutes, seconds]
                    .map(
                        (n, i) => n === 1 
                        ? `1 ${["days", "hours", "minutes", "seconds"][i]}` 
                        : `${n} ${["days", "hours", "minutes", "seconds"][i]}`
                    )
                    .filter(s => !s.startsWith('0'))
                    .join(' ')
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
                    try {
                        member.timeout(
                            1000 * (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds),
                            `Timed out by ${interaction.user.tag} (${interaction.user.id}) ${reason ? `with reason: ${reason}` : 'without reason'}`
                        )
                        return await button.reply(`Successfully timed out ${
                            Formatters.bold(member.user.tag)
                        } (${Formatters.inlineCode(member.user.id)}) for a duration of ${
                            Formatters.bold(
                                [days, hours, minutes, seconds]
                                .map(
                                    (n, i) => n === 1 
                                    ? `1 ${["days", "hours", "minutes", "seconds"][i]}` 
                                    : `${n} ${["days", "hours", "minutes", "seconds"][i]}`
                                )
                                .filter(s => !s.startsWith('0'))
                                .join(' '))
                            } ${reason ? `with reason ${Formatters.bold(reason)}` : 'without reason'}.`)
                        } catch (error) {
                            return await button.reply('Unable to timeout this member.')
                        }
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
                        content: 'Time is up.',
                        components: [ confirmationRow ]
                    })
                    return await interaction.followUp('Took too long for a response.')
                }
            })
        } else {
            const member = (<ChatInputCommandInteraction<"cached">>interaction).options.getMember("member")
            if (!member) return await interaction.reply({
                content: 'Member is not in this server',
                ephemeral: true
            })
            const reason = (<ChatInputCommandInteraction<"cached">>interaction).options.getString('reason', false)
         
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
                    try {
                        member.timeout(
                            null,
                            `Timed out by ${interaction.user.tag} (${interaction.user.id}) ${reason ? `with reason: ${reason}` : 'without reason'}`
                        )
                        return await interaction.followUp(`Successfully removed timeout for ${Formatters.bold(member.user.tag)} (${Formatters.inlineCode(member.user.id)}) ${reason ? `with reason ${Formatters.bold(reason)}` : 'without reason'}.`)
                    } catch (error) {
                        return await interaction.followUp('Unable to remove timeout from member.')
                    }
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