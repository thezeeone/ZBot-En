import { Sequelize, Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import { config } from 'dotenv';
import { APIEmbed } from 'discord.js';
config()

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
    logging: false
})

interface LevelModel extends Model<InferAttributes<LevelModel>, InferCreationAttributes<LevelModel>> {
    id: string,
    xp: number,
    lvl: number
}

interface BlacklistModel extends Model<InferAttributes<BlacklistModel>, InferCreationAttributes<BlacklistModel>> {
    id: string
}

interface RankCardModel extends Model<InferAttributes<RankCardModel>, InferCreationAttributes<RankCardModel>> {
    id: string,
    colour: number
}

interface WelcomeMessageEditorModel extends Model<InferAttributes<WelcomeMessageEditorModel>, InferCreationAttributes<WelcomeMessageEditorModel>> {
    id: string,
    channelId?: string,
    message?: string,
    embeds?: APIEmbed,
    enabled: boolean
}

interface EconomyModel extends Model<InferAttributes<EconomyModel>, InferCreationAttributes<EconomyModel>> {
    id: string,
    bank: number,
    wallet: number,
    maxBank: number,
    maxWallet: number
}

interface LevelsChannelListModel extends Model<InferAttributes<LevelsChannelListModel>, InferCreationAttributes<LevelsChannelListModel>> {
    guildId: string,
    channelId: string,
    allowed: boolean
}

const LevelModel = sequelize.define<LevelModel>('Levels', {
    id: {
        primaryKey: true,
        type: DataTypes.STRING
    },
    xp: DataTypes.INTEGER,
    lvl: DataTypes.INTEGER
})

const RankCardModel = sequelize.define<RankCardModel>('CustomisedRankCards', {
    id: {
        primaryKey: true,
        type: DataTypes.STRING
    },
    colour: {
        type: DataTypes.INTEGER,
        defaultValue: 0x00ffff
    }
})

const BlacklistModel = sequelize.define<BlacklistModel>('Blacklists', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    }
})

const LevelsChannelListModel = sequelize.define<LevelsChannelListModel>('LevelsBlacklists', {
    guildId: DataTypes.STRING,
    channelId: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    allowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
})

const EconomyModel = sequelize.define<EconomyModel>('EconomySystems', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    wallet: {
        defaultValue: 0,
        type: DataTypes.INTEGER
    },
    bank: {
        defaultValue: 0,
        type: DataTypes.INTEGER
    },
    maxBank: DataTypes.INTEGER,
    maxWallet: DataTypes.INTEGER
})

const WelcomeMessageEditorModel = sequelize.define<WelcomeMessageEditorModel>('PSWelcomeMessageEditors', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    channelId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    message: {
        type: DataTypes.STRING,
        defaultValue: ''
    },
    embeds: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        defaultValue: []
    },
    enabled: DataTypes.BOOLEAN
})

export {
    sequelize,
    LevelModel,
    BlacklistModel,
    RankCardModel,
    EconomyModel,
    LevelsChannelListModel,
    WelcomeMessageEditorModel
}
