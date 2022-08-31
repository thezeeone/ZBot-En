import { Sequelize, Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import { config } from 'dotenv';
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
    message?: string,
    embeds?: APIEmbed
}

const LevelModel = sequelize.define<LevelModel>('Levels', {
    id: {
        primaryKey: true,
        type: DataTypes.STRING
    },
    xp: DataTypes.INTEGER,
    lvl: DataTypes.INTEGER
})

const RankCardModel = sequelize.define<RankCardModel>('RankCards', {
    id: {
        primaryKey: true,
        type: DataTypes.NUMBER
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

export {
    sequelize,
    LevelModel,
    BlacklistModel,
    RankCardModel
}
