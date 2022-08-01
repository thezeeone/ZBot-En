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

// RESOLVING ISSUE
// https://github.com/Zahid556/ZBot-En/issues/11
// interface RankCardModel extends Model<InferAttributes<RankCardModel>, InferCreationAttributes<RankCardModel>> {
//     id: string,
//     colour: number
// }

const LevelModel = sequelize.define<LevelModel>('Levels', {
    id: {
        primaryKey: true,
        type: DataTypes.STRING
    },
    xp: DataTypes.INTEGER,
    lvl: DataTypes.INTEGER
})

// RESOLVING ISSUE
// https://github.com/Zahid556/ZBot-En/issues/11
// const RankCardModel = sequelize.define<RankCardModel>('RankCards', {
//     id: {
//         primaryKey: true,
//         type: DataTypes.NUMBER <-- THIS LINE WAS WHAT WAS CAUSING THE ERROR
//     },
//     colour: {
//         type: DataTypes.INTEGER,
//         defaultValue: 0x00ffff
//     }
// })

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
    /* RankCardModel */ // RESOLVING ISSUE
}
