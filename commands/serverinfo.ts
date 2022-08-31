import { bold, ChatInputCommandInteraction, EmbedBuilder, inlineCode, ChannelType, italic, time, GuildMFALevel, GuildDefaultMessageNotifications, GuildExplicitContentFilter, GuildNSFWLevel, GuildPremiumTier } from "discord.js"
import { pluralise, commaList } from "../util"
import { Cmd, tipsAndTricks } from "./command-exports"

const serverInfoCommand: Cmd = {
    data: {
        name: 'server-info',
        description: 'View information on the server'
    },
    async execute(interaction: ChatInputCommandInteraction<"cached">): Promise<any> {
        if (!interaction.guild.available) return 

        const {
            afkChannel, afkTimeout, channels,
            createdTimestamp, defaultMessageNotifications, description,
            emojis, explicitContentFilter, features, id,
            name, memberCount, members, mfaLevel, nsfwLevel, ownerId, partnered,
            premiumSubscriptionCount, premiumTier, rulesChannel, roles, 
            systemChannel, vanityURLCode, vanityURLUses, iconURL, bannerURL
        } = interaction.guild

        const textChannels = channels.cache.filter(r => r.type === ChannelType.GuildText)
        const voiceChannels = channels.cache.filter(r => r.type === ChannelType.GuildVoice)
        const announcementChannels = channels.cache.filter(r => r.type === ChannelType.GuildNews)
        const stageChannels = channels.cache.filter(r => r.type === ChannelType.GuildStageVoice)
        const categories = channels.cache.filter(r => r.type === ChannelType.GuildCategory)
        const otherChannels = channels.cache.filter(
            r => ![
                ChannelType.GuildText, 
                ChannelType.GuildVoice, 
                ChannelType.GuildNews,
                ChannelType.GuildStageVoice, 
                ChannelType.GuildCategory,
            ].some(s => r.type === s) 
        )
        const [
            hours,
            minutes,
            seconds
        ]: number[] = [
            Math.floor(Number(afkTimeout) / 3600),
            Math.floor(Number(afkTimeout) / 60) % 60,
            Math.floor(Number(afkTimeout)) % 60
        ]
        
        const [
            hoursString,
            minutesString,
            secondsString
        ] = [
            hours,
            minutes,
            seconds
        ].map((r, i) => pluralise(r, ["hour", "minute", "second"][i]))

        const embed = new EmbedBuilder()
        .setTitle('Server Information')
        .setColor(interaction.member?.roles.highest.color || 0x00ffff)
        .addFields([
            {
                name: 'General',
                value: `${
                    bold('Name')
                } ${name}\n${
                    bold('ID')
                } ${inlineCode(id)}\n${
                    bold('Created')
                } ${
                    time(Math.floor(createdTimestamp / 1000), 'F')
                } (${time(Math.floor(createdTimestamp / 1000), 'R')})\n${
                    bold('Description')
                } ${description || 'none'}\n${
                    bold('Emojis')
                } ${
                    emojis.cache.size
                    ? `${
                        emojis.cache.filter(s => !s.animated).size
                        ? `${inlineCode(emojis.cache.filter(s => !s.animated).size.toString())} static ${
                            emojis.cache.filter(s => !s.animated).size === 1
                            ? 'emoji'
                            : 'emojis'
                        }: ${
                            emojis.cache.filter(s => !s.animated).map(s => s.toString()).join(' ')
                        }`
                        : 'No static emojis'
                    }\n${
                        emojis.cache.filter(s => Boolean(s.animated)).size
                        ? `${inlineCode(emojis.cache.filter(s => Boolean(s.animated)).size.toString())} animated ${
                            emojis.cache.filter(s => Boolean(s.animated)).size === 1
                            ? 'emoji'
                            : 'emojis'
                        }: ${
                            emojis.cache.filter(s => Boolean(s.animated)).map(s => s.toString()).join(' ')
                        }`
                        : 'No animated emojis'
                    }`
                    : 'none'
                }\n${
                    bold('Roles')
                } ${
                    roles.cache.size
                    ? inlineCode(roles.cache.size.toString())
                    : 'none'
                }\n${
                    bold('Features')
                } ${
                    features.length
                    ? commaList(
                        features.map(
                            r => inlineCode(r.toLowerCase().split('_').map(s => s.replace(/\b\w/g, w => w.toUpperCase())).join(' '))
                        )
                    )
                    : 'none'
                }`,
                inline: true
            },
            {
                name: `Channels (${channels.cache.size || 'none'})`,
                value: `${bold('Channels')}\n${
                    categories.size
                    ? `${inlineCode(
                        categories.size.toString()
                    )} ${
                        categories.size === 1
                        ? 'category'
                        : 'categories'
                    }`
                    : italic('No categories')
                }\n${
                    textChannels.size
                    ? `${inlineCode(
                        textChannels.size.toString()
                    )} text ${
                        textChannels.size === 1
                        ? 'channel'
                        : 'channels'
                    }`
                    : italic('No text channels')
                }\n${
                    voiceChannels.size
                    ? `${inlineCode(
                        voiceChannels.size.toString()
                    )} voice ${
                        voiceChannels.size === 1
                        ? 'channel'
                        : 'channels'
                    }`
                    : italic('No voice channels')
                }\n${
                    announcementChannels.size
                    ? `${inlineCode(
                        announcementChannels.size.toString()
                    )} announcement ${
                        announcementChannels.size === 1
                        ? 'channel'
                        : 'channels'
                    }`
                    : italic('No announcement channels')
                }\n${
                    stageChannels.size
                    ? `${inlineCode(
                        stageChannels.size.toString()
                    )} stage ${
                        stageChannels.size === 1
                        ? 'channel'
                        : 'channels'
                    }`
                    : italic('No stage channels')
                }\n${
                    otherChannels.size
                    ? `${inlineCode(
                        otherChannels.size.toString()
                    )} other ${
                        textChannels.size === 1
                        ? 'channel'
                        : 'channels'
                    }`
                    : italic('No other channels')
                }\n${
                    bold('Rules Channel')
                } ${
                    rulesChannel ? rulesChannel.toString() : 'none'
                }\n${
                    bold('AFK Channel')
                } ${
                    afkChannel ? afkChannel.toString() : 'none'
                }\n${
                    bold('AFK Timeout')
                } ${
                    afkTimeout
                    ? [hoursString, minutesString, secondsString].filter(s => !s.startsWith('0')).join(' ')
                    : 'none'
                }\n${bold('System Channel')} ${
                    systemChannel?.toString() || 'none'
                }`,
                inline: true
            },
            {
                name: `Members (${memberCount})`,
                value: `${
                    bold('Bots')
                } ${members.cache.filter(r => r.user.bot).size 
                    ? inlineCode(members.cache.filter(r => r.user.bot).size.toString())
                    : 'none'
                }\n${
                    bold('Non-bots')
                } ${
                    members.cache.filter(r => !r.user.bot).size 
                    ? inlineCode(members.cache.filter(r => !r.user.bot).size.toString())
                    : 'none'
                }\n${
                    bold('Owner')
                } <@${ownerId}>`,
                inline: true
            },
            {
                name: 'Moderation',
                value: `${
                    bold('2FA for Moderative Roles')
                } ${
                    mfaLevel === GuildMFALevel.Elevated
                    ? 'Enabled'
                    : 'Disabled'
                }\n${
                    bold('Default Message Notifications')
                } ${
                    defaultMessageNotifications === GuildDefaultMessageNotifications.AllMessages
                    ? 'All messages'
                    : 'Only @mentions'
                }\n${
                    bold('Explicit Content Filter')
                } ${
                    explicitContentFilter === GuildExplicitContentFilter.Disabled
                    ? 'Disabled'
                    : (
                        explicitContentFilter === GuildExplicitContentFilter.MembersWithoutRoles
                        ? 'Only members without roles'
                        : 'All members'
                    )
                }\n${
                    bold('NSFW Level')
                } ${
                    nsfwLevel === GuildNSFWLevel.AgeRestricted
                    ? 'Age Restricted'
                    : (
                        nsfwLevel === GuildNSFWLevel.Default
                        ? 'Default'
                        : (
                            nsfwLevel === GuildNSFWLevel.Explicit
                            ? 'Explicit'
                            : 'Safe'
                        )
                    )
                }`,
                inline: true
            },
            {
                name: 'Boosting',
                value: `${
                    bold('Boost Level')
                } ${
                    premiumTier === GuildPremiumTier.None
                    ? 'none'
                    : (
                        premiumTier === GuildPremiumTier.Tier1
                        ? 'Level 1'
                        : (
                            premiumTier === GuildPremiumTier.Tier2
                            ? 'Level 2'
                            : 'Level 3'
                        )
                    )
                }\n${
                    bold('Boosts')
                } ${
                    premiumSubscriptionCount ? inlineCode(premiumSubscriptionCount.toString()) : 'none'
                }\n${
                    bold('Partnership')
                } ${
                    partnered
                    ? 'Partnered with Discord'
                    : 'No Partnership'
                }\n${
                    bold('Vanity URL Code')
                } ${
                    (vanityURLCode)
                    ? `[https://discord.gg/${vanityURLCode}](https://discord.gg/${vanityURLCode})`
                    : 'none'
                }\n${
                    bold('Vanity URL Uses')
                } ${
                    (vanityURLCode)
                    ? (
                        (vanityURLUses)
                        ? `${inlineCode(String(vanityURLUses))}`
                        : 'no uses'
                    )
                    : 'no vanity code'
                }`,
                inline: true
            }
        ])

        try {
            const serverPFP = iconURL({ forceStatic: false })
            const serverBanner = bannerURL({ forceStatic: false })
    
            if (!isNotEmpty(serverPFP)) embed.setThumbnail(serverPFP)
            if (!isNotEmpty(serverBanner)) embed.setImage(serverBanner)
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
    return v !== undefined && v !== null
}

export {
    serverInfoCommand
}