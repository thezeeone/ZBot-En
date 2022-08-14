import { ChatInputCommandInteraction, ContextMenuCommandInteraction, EmbedBuilder, inlineCode } from "discord.js"
import { Cmd } from "./command-exports"

const pingCommand: Cmd = {
    data: {
        name: 'ping',
        description: 'Pong! Check latency and API roundtrip time for bot'
    },
    async execute(interaction: ChatInputCommandInteraction<"cached"> | ContextMenuCommandInteraction<"cached">) {
        const sent = await interaction.reply({
            content: 'Ping... 🏓',
            fetchReply: true
        })
        const wsPing = interaction.client.ws.ping
        interaction.editReply({
            content: '',
            embeds: [
                new EmbedBuilder()
                .setTitle('🏓 Pong!')
                .setFields([
                    {
                        name: 'Round-trip to API and back',
                        value: `${inlineCode(
                            String(sent.createdTimestamp - interaction.createdTimestamp)
                        )} milliseconds`,
                        inline: true
                    },
                    {
                        name: 'API latency',
                        value: `${inlineCode(
                            String(wsPing)
                        )} milliseconds`,
                        inline: true
                    },
                    {
                        name: '\u200b',
                        value: '\u200b',
                        inline: true
                    }
                ])
                .setFooter({
                    text: `The colour changes depending on the speed of the response to the interaction. ${
                        (
                            Math.floor(
                                (sent.createdTimestamp - interaction.createdTimestamp) / 100
                            ) / 10
                        ) <= 1.25
                        ? `${(
                            Math.floor(
                                (sent.createdTimestamp - interaction.createdTimestamp) / 100
                            ) / 10
                        )} s is a fast response time. The bot takes shorter than usual, and it seems like it is responding instantly.`
                        : (
                            (
                                Math.floor(
                                    (sent.createdTimestamp - interaction.createdTimestamp) / 100
                                ) / 10
                            ) > 1.25 && (
                                Math.floor(
                                    (sent.createdTimestamp - interaction.createdTimestamp) / 100
                                ) / 10
                            ) <= 2.5
                            ? `${(
                                Math.floor(
                                    (sent.createdTimestamp - interaction.createdTimestamp) / 100
                                ) / 10
                            )} s is an average response time. Most bots are in this range.`
                            : `${(
                                Math.floor(
                                    (sent.createdTimestamp - interaction.createdTimestamp) / 100
                                ) / 10
                            )} s is a slow response time. The bot takes longer than normal to respond, and should be in the "Medium" or "Fast" range.`
                        )
                    }`
                })
                .setColor(
                    Math.floor((sent.createdTimestamp - interaction.createdTimestamp) / 100) / 10 >= 2.5
                    ? 0xff0000
                    : [
                        0x00ff00,
                        0x33ff00,
                        0x66ff00,
                        0x99ff00,
                        0xccff00,
                        0xffff00,
                        0xffcc00,
                        0xff9900,
                        0xff6600,
                        0xff3300,
                    ][
                        Math.round(
                            (
                                (
                                    Math.floor(
                                        (sent.createdTimestamp - interaction.createdTimestamp) / 100
                                    ) / 10
                                )
                            ) / 2.5 * 10
                        ) >= 10
                        ? 9
                        : Math.round(
                            (
                                (
                                    Math.floor(
                                        (sent.createdTimestamp - interaction.createdTimestamp) / 100
                                    ) / 10
                                )
                            ) / 2.5 * 10
                        ) 
                    ]
                )
            ]
        })
    }
}

export {
    pingCommand
}