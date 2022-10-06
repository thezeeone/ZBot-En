import { ApplicationCommandType, UserContextMenuCommandInteraction, EmbedBuilder, bold, inlineCode, time } from "discord.js"
import { commaList } from "../util"
import { Cmd, tipsAndTricks } from "./command-exports"

const memberInfoCommand: Cmd = {
    data: {
        name: 'member-info',
        type: ApplicationCommandType.User
    },
    async execute(interaction: UserContextMenuCommandInteraction<"cached">) {
        const member = interaction.targetMember

        if (!member) return await interaction.reply({ 
            embeds: [
                new EmbedBuilder()
                .setAuthor({
                    name: `${interaction.user.tag} (${interaction.user.id})`,
                    iconURL: interaction.user.displayAvatarURL({ forceStatic: false })
                })
                .setTitle(`Member unknown`)
                .setDescription('Couldn\'t find that member.')
                .setColor(0xff0000)
            ],
            ephemeral: true 
        })

        const {
            bot, createdTimestamp, discriminator, flags,
            id, username, bannerURL, displayAvatarURL
        } = member.user

        const {
            displayColor, nickname, pending, permissions,
            premiumSinceTimestamp, joinedTimestamp
        } = member

        const embed = new EmbedBuilder()
        .setColor(displayColor || 0x00ffff)
        .setTitle('Member Information')
        .addFields([
            {
                name: 'Member',
                value: `${
                    bold('Nickname')
                } ${inlineCode(nickname ?? 'no nickname')}\n${
                    bold('Joined')
                } ${
                    joinedTimestamp
                    ? `${
                        time(Math.floor(joinedTimestamp / 1000), 'F')
                    } ${
                        time(Math.floor(joinedTimestamp / 1000), 'R')
                    }`
                : 'Undeterminable'
                }\n${
                    bold('Verified for Membership Screening')
                } ${
                    !pending ? 'Yes' : 'No'
                }\n${
                    bold('Latest boost')
                } ${
                    premiumSinceTimestamp
                    ? `${
                        time(Math.floor(premiumSinceTimestamp / 1000), 'F')
                    } ${
                        time(Math.floor(premiumSinceTimestamp / 1000), 'R')
                    }`
                    : 'no latest boost'
                }\n${
                    bold(
                        permissions.toArray().length === 1
                        ? 'Permission'
                        : 'Permissions'
                    )
                } ${
                    commaList(permissions.toArray().map(s => inlineCode((s.match(/[A-Z][a-z]+/g) as RegExpMatchArray).join(' '))))
                }`
            },
            {
                name: 'User',
                value: `${
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
                }`
            }
        ])
        
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
    return !!v
}

export {
    memberInfoCommand
}