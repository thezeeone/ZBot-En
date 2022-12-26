import { ApplicationCommandData, ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";
import { tipsAndTricks } from "../../facts"

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
import { memoryGameCommand } from "./memorygame";
import { blacklistCommand } from "./blacklist";
import { pingCommand } from "./ping"
import { slowmodeCommand } from "./slowmode";
import { helpCommand } from "./help";
import { serverInfoCommand } from "./serverinfo";
import { inviteCommand } from "./invite";
import { updatesCommand } from "./updates";
import { userInfoCommand } from "./userinfo";
import { memberInfoCommand } from "./memberinfo";
import { balanceCommand } from "./balance";
import { depositCommand } from "./deposit";
import { withdrawCommand } from "./withdraw";
import { giveCommand } from "./givecoins";
import { channelBLCommand } from "./channelblacklist";
import { channelWLCommand } from "./channelwhitelist";
import { questionCommand } from "./question";
import { reportMemberCommand } from "./report-member";
import { reportMessageCommand } from "./report-message";
import { ticketCommand } from "./ticket";
import { voteCommand } from "./vote";
import { sudokuCommand } from "./sudoku";
import { zBankCommand } from "./zbank";
import { quizCommand } from "./quiz";
import { warnCommand } from "./warn";
import { welcomeEditorCommand } from "./welcomeeditor";

export {
    Cmd,
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
    serverInfoCommand,
    inviteCommand,
    updatesCommand,
    userInfoCommand,
    tipsAndTricks,
    memberInfoCommand,
    balanceCommand,
    depositCommand,
    withdrawCommand,
    giveCommand,
    channelBLCommand,
    channelWLCommand,
    questionCommand,
    reportMemberCommand,
    reportMessageCommand,
    ticketCommand,
    voteCommand,
    sudokuCommand,
    zBankCommand,
    quizCommand,
    warnCommand,
    welcomeEditorCommand
}
