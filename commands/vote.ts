import { ActionRowBuilder, ApplicationCommandOptionType, bold, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, inlineCode, Collection, time, italic, APIButtonComponentWithCustomId } from "discord.js"
import { pluralise } from "../util"
import { Cmd } from "./command-exports"

const voteCommand: Cmd = {
    data: {
        name: 'vote',
        description: 'Start a poll for other members! (coming soon!)',
        options: [
            {
                name: 'question',
                description: 'The question to ask',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'duration-minutes',
                description: 'The duration users have to reply (minutes)',
                type: ApplicationCommandOptionType.Number,
                minValue: 1,
                maxValue: 60,
                required: true
            },
            {
                name: 'option-1',
                description: 'The first option members can vote for',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'option-2',
                description: 'The second option members can vote for',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'option-3',
                description: 'The third option members can vote for',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'option-4',
                description: 'The fourth option members can vote for',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'option-5',
                description: 'The fifth option members can vote for',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const question = interaction.options.getString('question', true)
        const [
            durationM,
            durationS
        ] = [
            Math.floor(interaction.options.getNumber('duration-minutes', true)),
            Math.floor(interaction.options.getNumber('duration-minutes', true) % 1 * 60)
        ]
        const options = [
            interaction.options.getString('option-1', true),
            interaction.options.getString('option-2', true),
            interaction.options.getString('option-3'),
            interaction.options.getString('option-4'),
            interaction.options.getString('option-5')
        ].filter(notEmpty)

        const embed = new EmbedBuilder()
        .setAuthor({
            name: `${interaction.user.tag} (${interaction.user.id})`,
            iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
        })
        .setColor(0x00ffff)
        .setTitle('Vote')
        .setDescription(`Place your vote! ${italic(`Ends ${time(Math.floor(Date.now() / 1000) + (durationM * 60 + durationS))} (${bold(time(Math.floor(Date.now() / 1000) + (durationM * 60 + durationS), 'R'))})`)}.`)
        .setFields([
            {
                name: `${interaction.user.username} is running a vote!`,
                value: question
            },
            {
                name: 'Options',
                value: options.map((r, i) => `${bold(String(i + 1))} ${inlineCode(r)}`).join('\n')
            }
        ])

        const buttons = new ActionRowBuilder<ButtonBuilder>({
            components: options.map(
                (r, i) => {
                    return new ButtonBuilder()
                    .setCustomId(String(i + 1))
                    .setLabel(r)
                    .setStyle(ButtonStyle.Primary)
                }
            )
        })

        const voteMessage = await interaction.reply({
            content: `⚠ **__Warning:__ this is an experimental feature and may break while in use; please use this command __at the bot's own risk__.** Some buttons, select menus or features may fail, cause the command to behave strangely, or even worse, cause the bot to crash entirely. If using this command, we advise you use this **at the bot's own risk**.\n\n*Think you know what you're doing? Come and help us out in our GitHub issue, [#22 Vote, question and quiz commands](https://github.com/Zahid556/ZBot-En/issues/22).*`,
            embeds: [embed],
            components: [buttons],
            fetchReply: true
        })

        const collector = voteMessage.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: (durationM * 60 + durationS) * 1000
        })

        const votes = new Collection<string, string[]>()

        options.forEach(s => votes.set(s, []))

        collector.on('collect', async (btn) => {
            const buttonCustomId = btn.customId

            const choiceVotes = votes.get(options[Number(buttonCustomId) - 1])

            if (choiceVotes) {
                if (choiceVotes?.includes(btn.user.id)) {
                    choiceVotes.splice(choiceVotes.indexOf(btn.user.id), 1)
                    votes.set(buttonCustomId, choiceVotes)
                    await btn.reply({
                        content: `You have deselected the ${inlineCode(options[Number(buttonCustomId) - 1])} option. You may click this button again if you want to change your mind.\n\n⚠ **__Warning:__ this is an experimental feature and may break while in use; please use this command __at the bot's own risk__.** Some buttons, select menus or features may fail, cause the command to behave strangely, or even worse, cause the bot to crash entirely. If using this command, we advise you use this **at the bot's own risk**.\n\n*Think you know what you're doing? Come and help us out in our GitHub issue, [#22 Vote, question and quiz commands](https://github.com/Zahid556/ZBot-En/issues/22).*`,
                        ephemeral: true
                    })
                } else {
                    choiceVotes.push(btn.user.id)
                    votes.set(buttonCustomId, choiceVotes)
                    await btn.reply({
                        content: `You have selected the ${inlineCode(options[Number(buttonCustomId) - 1])} option. You may click this button again if you want to change your mind.\n\n⚠ **__Warning:__ this is an experimental feature and may break while in use; please use this command __at the bot's own risk__.** Some buttons, select menus or features may fail, cause the command to behave strangely, or even worse, cause the bot to crash entirely. If using this command, we advise you use this **at the bot's own risk**.\n\n*Think you know what you're doing? Come and help us out in our GitHub issue, [#22 Vote, question and quiz commands](https://github.com/Zahid556/ZBot-En/issues/22).*`,
                        ephemeral: true
                    })
                }
                return
            } else {
                await btn.reply({ content: 'An error occured.', ephemeral: true })
                return
            }
        })

        collector.on('end', () => {
            embed
            .setTitle('Vote Ended!')
            .setDescription('Here are the results below.')
            .setFields([
                {
                    name: 'Question Asked',
                    value: question
                },
                {
                    name: 'Results',
                    value: (votes.some(s => Boolean(s.length)))
                    ? votes
                    .sort((a, b) => {
                        if (a.length > b.length) return -1
                        else if (a.length < b.length) return 1
                        else return 0
                    })
                    .map((r, k) => isNaN(Number(k)) ? `${r.length ? bold(pluralise(r.length, 'person', 'people')) : 'Nobody'} selected ${bold(k)}` : undefined)
                    .filter(notEmpty)
                    .join('\n')
                    : 'No results were collected in the time being!'
                }
            ])

            const sortedVotes = votes.sort((a, b) => a.length + b.length)

            buttons.components.map((b, i) => (votes.some(s => Boolean(s.length))) ? b.setStyle(votes.get(options[Number((b.data as Partial<APIButtonComponentWithCustomId>).custom_id)] as string)?.length ? (
                sortedVotes[i] === sortedVotes[0] ? ButtonStyle.Success : ButtonStyle.Primary
            ) : ButtonStyle.Secondary).setDisabled(true) : b.setDisabled(true).setStyle(ButtonStyle.Secondary))

            voteMessage.edit({
                embeds: [embed],
                components: [buttons]
            })
        })
    }
}

function notEmpty<T>(v: T | null | undefined): v is T {
    return v !== null && v !== undefined
}

export {
    voteCommand
}
