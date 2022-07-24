import { ApplicationCommandData, ApplicationCommandPermissionType, ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";

interface Cmd {
    data: ApplicationCommandData,
    permissions?: ApplicationCommandPermissionType[],
    execute(interaction: ChatInputCommandInteraction<"cached"> | ContextMenuCommandInteraction<"cached">): any
}

const queue = new Collection<UserResolvable, string>()

import { rankCommand } from "./rank";
import { leaderboardCommand } from "./leaderboard";
import { timeoutCommand } from "./timeout";
import { kickCommand } from "./kick";
import { banCommand } from "./ban";
import { tttCommand } from "./tictactoe";
import { gtwCommand } from "./guesstheword";
import { memoryGameCommand } from "./memorygame";
import { playCommand } from "./play";
import { skipCommand } from "./skip";
import { stopCommand } from "./stop";

export {
    Cmd,
    queue,
    rankCommand,
    leaderboardCommand,
    timeoutCommand,
    kickCommand,
    banCommand,
    tttCommand,
    gtwCommand,
    memoryGameCommand,
    playCommand,
    skipCommand,
    stopCommand
}
