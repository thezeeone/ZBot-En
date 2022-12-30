import { Sequelize, Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import { config } from 'dotenv';
config()

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
    logging: false
})

// @ts-ignore
interface LevelModel extends Model<InferAttributes<LevelModel>, InferCreationAttributes<LevelModel>> {
    id: string,
    xp: number,
    lvl: number
}

// @ts-ignore
interface BlacklistModel extends Model<InferAttributes<BlacklistModel>, InferCreationAttributes<BlacklistModel>> {
    id: string
}

// @ts-ignore
interface RankCardModel extends Model<InferAttributes<RankCardModel>, InferCreationAttributes<RankCardModel>> {
    id: string,
    colour: number
}

// @ts-ignore
interface EconomyModel extends Model<InferAttributes<EconomyModel>, InferCreationAttributes<EconomyModel>> {
    id: string,
    bank: number,
    wallet: number,
    maxBank: number,
    maxWallet: number
}

// @ts-ignore
interface LevelsChannelListModel extends Model<InferAttributes<LevelsChannelListModel>, InferCreationAttributes<LevelsChannelListModel>> {
    guildId: string,
    channelId: string,
    allowed: boolean
}

// @ts-ignore
interface SudokuGridsModel extends Model<InferAttributes<SudokuGridsModel>, InferCreationAttributes<SudokuGridsModel>> {
    game: string,
    numberOfAttempts: number,
    numberOfSolves: number
}

// @ts-ignore
interface ZCentralBankModel extends Model<InferAttributes<ZCentralBankModel>, InferCreationAttributes<ZCentralBankModel>> {
    original: number,
    originalGiven: boolean,
    timesUsedInDay: number,
    numberToAdd: number,
    moneyAdded: boolean,
    lastTimeAdded: Date,
    moneyTaken: number,
    initialiseDate: Date
}

// @ts-ignore
interface ZBankCooldowns extends Model<InferAttributes<ZBankCooldowns>, InferCreationAttributes<ZBankCooldowns>> {
    user: string,
    lastTimestamp: Date
}

// @ts-ignore
interface XPBoosts extends Model<InferAttributes<XPBoosts>, InferCreationAttributes<XPBoosts>> {
    user: string,
    XPBoosts: ({ boost: number, expiryDate: Date })[]
}

enum WarningTypes {
    WARNING = 'warning',
    KICK = 'kick',
    TIMEOUT = 'timeout_g',
    TIMEOUT_REMOVE = 'timeout_r',
    BAN = 'ban_g',
    BAN_REMOVE = 'ban_r'
}

// @ts-ignore
interface CaseSystem extends Model<InferAttributes<CaseSystem>, InferCreationAttributes<CaseSystem>> {
    id: number,
    user: string,
    moderator: string,
    type: WarningTypes,
    reason: string,
    guild: string,
    edited: boolean
}

// @ts-ignore
const LevelModel = sequelize.define<LevelModel>('Levels', {
    id: {
        primaryKey: true,
        type: DataTypes.STRING
    },
    xp: DataTypes.INTEGER,
    lvl: DataTypes.INTEGER
})

// @ts-ignore
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

// @ts-ignore
const BlacklistModel = sequelize.define<BlacklistModel>('Blacklists', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    }
})

// @ts-ignore
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

// @ts-ignore
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

// @ts-ignore
const SudokuGridsModel = sequelize.define<SudokuGridsModel>('SudokuBoards', {
    game: DataTypes.STRING,
    numberOfAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    numberOfSolves: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
})

// @ts-ignore
const ZCentralBankModel = sequelize.define<ZCentralBankModel>('ZBanks', {
    original: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    originalGiven: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    timesUsedInDay: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastTimeAdded: DataTypes.DATE,
    numberToAdd: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    moneyAdded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    moneyTaken: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    initialiseDate: {
        type: DataTypes.DATE,
        defaultValue: new Date(1668297600000)
    }
})

// @ts-ignore
const ZBankCooldowns = sequelize.define<ZBankCooldowns>('ZBankCooldowns', {
    user: DataTypes.STRING,
    lastTimestamp: DataTypes.DATE
})

// @ts-ignore
const XPBoostsModel = sequelize.define<XPBoosts>('XPBoosts', {
    user: DataTypes.STRING,
    XPBoosts: DataTypes.ARRAY(DataTypes.JSON)
})

// @ts-ignore
const CaseSystem = sequelize.define<CaseSystem>('Cases', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user: DataTypes.STRING,
    moderator: DataTypes.STRING,
    type: DataTypes.STRING,
    reason: DataTypes.STRING,
    guild: DataTypes.STRING,
    edited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})

export {
    sequelize,
    LevelModel,
    BlacklistModel,
    RankCardModel,
    EconomyModel,
    LevelsChannelListModel,
    SudokuGridsModel,
    ZCentralBankModel,
    ZBankCooldowns,
    XPBoostsModel,
    CaseSystem,
    WarningTypes
}
