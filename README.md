# ZBot
The official GitHub repository for ZBot, a multi-purpose bot you can use in your server.
[Discord Server](https://discord.gg/6tkn6m5g52)

[Add ZBot to your discord server](https://discord.com/api/oauth2/authorize?client_id=956596792542257192&permissions=8&scope=bot%20applications.commands) with **`Administrator` permission**.<sup>\[1\]</sup>

[Alternative link](https://discord.com/api/oauth2/authorize?client_id=956596792542257192&permissions=1644971949559&scope=bot%20applications.commands) using **all other permissions**, if you __don't__ have `Administrator` perms.<sup>\[2\]</sup>

## Features
### Slash Commands
Access all of this bot's slash commands with the click of the forward slash key (`/`) on your keyboard!
- **Minigames** to keep you entertained:
    - `/guess-the-word` **Guess the Word** \- Can you guess the word/sentence?
    - `/tic-tac-toe`    **Tic-tac-toe** \- Play the classic strategy game
    - `/memory-game`    **Memory Game** \- How sharp is your memory with a 4x5 20-square grid?
- **Moderation Commands** to manage your server:
    - `/timeout`        **Timeout** \- Timeout and untimeout members. (Upto 28 days)
    - `/kick`           **Kick** \- Get rid of a member if they're being a menacing rule-breaker
    - `/ban`            **Ban** \- Slam the judge's banhammer on any member who shall leave!
- **Music commands** to play music in voice chat:
    - `/yt-vid`         **Youtube Video** \- Play a YouTube video in VC
### Level System
Keep your server alive with a level system that encourages members to talk and use this bot!
- **Experience points** for members who __send messages__, when they hit a certain level they level up. The __more you talk__, the __**higher** your level__, the __**higher** your rank__ in the leaderboard.
#### **Slash Commands**
- `/rank`               **Rank** \- Check your rank. *(Displays **level**, **experience points** and **number of experience points required to reach the next level**)*
- `/leaderboard`        **Leaderboard** \- Check the global leaderboard.

## Resources
### Core
This bot uses discord.js and typescript.
- **JavaScript**, a both front-end and back-end programming language used often in combination with HTML. `ES2015`
    - Go to the [official website](https://javascript.com/)
    - [Learn JavaScript](https://javascript.info/)
- **TypeScript**, a programming language with types that is built on JavaScript, enhancing your JavaScript applications and programs.
    - Go to the [official website](https://typescriptlang.org/)
    - Read the [handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- **node.js**, an engine that allows JavaScript to be used to program apps. `v17.8.0`
    - Go to the [official website](https://nodejs.org/en/)
    - Check the [Node.js Documentation](https://nodejs.org/en/docs/)
### Main Packages
- **discord.js**, a powerful, flexible, promise-based node.js module that allows you to interact with the Discord API. `v14.0.1` `TS`
    - Join the [Discord.js discord server](https://discord.com/djs)
    - Check out the [Discord.js GitHub repositories](https://github.com/discordjs)
    - Learn discord.js using the [guide](https://discordjs.guide/)
    - Check the [discord.js documentation](https://discord.js.org/)
- **@discordjs/voice**, a node.js package that lets your Discord bot interact with Voice and Stage Channels. `v0.10.0` `TS`
    - Read the [guide](https://discordjs.guide/voice/)
### Databases and Storage
- **sequelize**, Feature-rich object-relation mapping package for PSQL, MySQL, MariaDB, SQLite, SQL Server. `v6.21.2`
    - [Get started](https://sequelize.org/docs/v6/getting-started/)
    - [API reference](https://sequelize.org/api/v6/identifiers)
    - A basic tutorial from the [Discord.js Guide](https://discordjs.guide/sequelize/) (using `sqlite3`)
- **pg** *for PostgreSQL*, powerful, open-sourced object-relational database system with over 30 years development.
    - [Official website](https://www.postgresql.org/)
    - [Download PostgreSQL](https://www.postgresql.org/download/)
### Voice (other than @discordjs/voice)
- **ytdl-core**, a download for YouTube videos.
    - [NPM package](https://www.npmjs.com/package/ytdl-core)
    - [GitHub Repository](https://github.com/fent/node-ytdl-core)
- **ffmpeg-static**, to install FFmpeg via npm, allowing you to play a range of media, example mp3.
    - [NPM package](https://www.npmjs.com/package/ffmpeg-static)
- **libsodium-wrappers**, an encryption package often used with @discordjs/voice
    - [NPM package](https://www.npmjs.com/package/libsodium-wrappers)
### Other packages
- **dotenv**, if you want to keep sensitive information safe from anyone when publishing your files in public.
    - [NPM package](https://www.npmjs.com/package/dotenv)
    
## Much more to be added
Want to contribute?
- Head to the **[Pull Request (PR)](https://github.com/Zahid556/ZBot/pulls) page** to suggest a new feature
- Problem? Bug? Bot working unexpectedly? **Report in the [Issues](https://github.com/Zahid556/ZBot/issues) page** to get it sorted!
- Join the **[ZBot Discord Server](https://discord.gg/6tkn6m5g52) for further help**

<sup>[1][2]</sup>*For you to be able to add the bot to the server, you **__must__ have** the **`Manage Server` permission** and you need to share some permissions you have with the permissions the bot requests, for the bot to be able to have permissions in that server.*
