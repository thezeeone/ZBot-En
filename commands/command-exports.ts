import { ApplicationCommandData, ApplicationCommandPermissionType, ChatInputCommandInteraction, Collection, ContextMenuCommandInteraction, GuildResolvable, TextBasedChannelResolvable, User } from "discord.js";

interface Cmd {
    data: ApplicationCommandData,
    permissions?: ApplicationCommandPermissionType[],
    execute(interaction: ChatInputCommandInteraction<"cached"> | ContextMenuCommandInteraction<"cached">): any
}

interface QueueConstruct {
    textChannel: TextBasedChannelResolvable,
    voiceChannel: TextBasedChannelResolvable,
    connection: VoiceConnection | null,
    songs: SongInfo[]
}

interface SongInfo { 
    url: string,
    title: string,
    author: string,
    authorChannelUrl: string
    duration: number,
    thumbnail: string,
    suggestedBy: User,
    playing: boolean
}

const queue = new Map<GuildResolvable, QueueConstruct>()

import { rankCommand } from "./rank";
import { leaderboardCommand } from "./leaderboard";
import { timeoutCommand } from "./timeout";
import { kickCommand } from "./kick";
import { banCommand } from "./ban";
import { tttCommand } from "./tictactoe";
import { gtwCommand } from "./guesstheword";
import { memoryGameCommand } from "./memorygame";
import { blacklistCommand } from "./blacklist";
import { reportCommand } from "./reportproblem";
import { playCommand } from "./play";
import { VoiceConnection } from "@discordjs/voice";

export {
    Cmd,
    queue,
    QueueConstruct,
    SongInfo,
    rankCommand,
    leaderboardCommand,
    timeoutCommand,
    kickCommand,
    banCommand,
    tttCommand,
    gtwCommand,
    memoryGameCommand,
    blacklistCommand,
    playCommand,
    reportCommand
}
