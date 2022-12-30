import { ApplicationCommandData, ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";
import { tipsAndTricks } from "../../facts"

interface Cmd {
    data: ApplicationCommandData,
    execute(interaction: ChatInputCommandInteraction<"cached"> | ContextMenuCommandInteraction<"cached">)
}

import { rankCommand } from "./rank";
import { leaderboardCommand } from "./leaderboard";
import { timeoutCommand } from "./timeout";
import { kickCommand } from "./kick";
import { banCommand } from "./ban";
import { tttCommand } from "./tictactoe";
import { memoryGameCommand } from "./memorygame";
import { blacklistCommand } from "./blacklist";
import { pingCommand } from "./ping"
import { slowmodeCommand } from "./slowmode";
import { helpCommand } from "./help";
import { balanceCommand } from "./balance";
import { depositCommand } from "./deposit";
import { withdrawCommand } from "./withdraw";
import { questionCommand } from "./question";
import { voteCommand } from "./vote";
import { sudokuCommand } from "./sudoku";
import { zBankCommand } from "./zbank";
import { quizCommand } from "./quiz";
import { warnCommand } from "./warn";

export {
    Cmd,
    tipsAndTricks,
    rankCommand,
    leaderboardCommand,
    timeoutCommand,
    kickCommand,
    banCommand,
    tttCommand,
    memoryGameCommand,
    blacklistCommand,
    pingCommand,
    slowmodeCommand,
    helpCommand,
    balanceCommand,
    depositCommand,
    withdrawCommand,
    ticketCommand,
    quizCommand,
    questionCommand,
    voteCommand,
    sudokuCommand,
    zBankCommand,
    warnCommand,
}
