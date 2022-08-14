import { ApplicationCommandData, ApplicationCommandPermissionType, ChatInputCommandInteraction, Collection, ContextMenuCommandInteraction, GuildResolvable, TextBasedChannelResolvable, User } from "discord.js";

interface Cmd {
    data: ApplicationCommandData,
    execute(interaction: ChatInputCommandInteraction<"cached"> | ContextMenuCommandInteraction<"cached">): any
}

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
import { pingCommand } from "./ping"
import { slowmodeCommand } from "./slowmode";
import { helpCommand } from "./help";

export {
    Cmd,
    rankCommand,
    leaderboardCommand,
    timeoutCommand,
    kickCommand,
    banCommand,
    tttCommand,
    gtwCommand,
    memoryGameCommand,
    blacklistCommand,
    reportCommand,
    pingCommand,
    slowmodeCommand,
    helpCommand
}
