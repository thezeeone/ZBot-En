import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, bold, inlineCode, time } from "discord.js"
import { commaList } from "../util"
import { Cmd, tipsAndTricks } from "./command-exports"

const userInfoCommand: Cmd = {
    data: {
        name: 'user-info',
        description: 'Display information about a user',
        options: [
            {
                name: 'user',
                description: 'The user to display information about',
                type: ApplicationCommandOptionType.User,
                required: false
            }
        ]
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">) {
        const user = interaction.options.getUser('user') || interaction.user

        if (!user) return await interaction.reply({ 
            embeds: [
                new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.user.tag} (${interaction.user.id})`,
                    iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                })
                .setTitle(`User unknown`)
                .setDescription('Couldn\'t find that user.')
                .setColor(0xff0000)
            ],
            ephemeral: true 
        })

        const {
            accentColor, bot, createdTimestamp, discriminator, flags,
            id, username, bannerURL, displayAvatarURL
        } = user

        const embed = new EmbedBuilder()
        .setColor(accentColor || 0x00ffff)
        .setTitle('User Information')
        .setDescription(`${
            bold('Username')
        } ${inlineCode(username)}\n${
            bold('4-digit Discriminator')
        } ${inlineCode(discriminator)}\n${
            bold('ID')
        } ${inlineCode(id)}\n${
            bold('Bot')
        } ${
            bot ? 'Yes' : 'No'
        }\n${
            bold('Created at')
        } ${
            time(Math.floor(createdTimestamp / 1000), 'F')
        } (${
            time(Math.floor(createdTimestamp / 1000), 'R')
        })\n${
            bold('Flags')
        } ${
            flags?.toArray().length
            ? commaList(
                flags?.toArray().map(
                    f => inlineCode(f.toLowerCase().split('_').map(s => s.replace(/\b\w/g, w => w.toUpperCase())).join(' '))
                )
            )
            : 'none'
        }`)
        try {
            const avatarURL = displayAvatarURL({ forceStatic: false })
            if (isNotEmpty(avatarURL)) embed.setThumbnail(avatarURL)
            
            const banner = bannerURL({ forceStatic: false })
            if (isNotEmpty(banner)) embed.setImage(banner)
        } finally {
            return await interaction.reply({
                embeds: [ 
                    embed
                    .setFooter(
                        Math.random() < 0.1
                        ? { text: `💡 Did you know? ${tipsAndTricks[Math.floor(Math.random() * tipsAndTricks.length)]}` }
                        : null
                    )
                ]
            })
        }
    }
}

function isNotEmpty<T>(v: T | null | undefined): v is T {
    return v !== null && v !== undefined
}

export {
    userInfoCommand
}