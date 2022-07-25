import { Sequelize, Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';

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

const LevelModel = sequelize.define<LevelModel>('Levels', {
    id: {
        primaryKey: true,
        type: DataTypes.STRING
    },
    xp: {
        type: DataTypes.INTEGER
    },
    lvl: {
        type: DataTypes.INTEGER
    }
})

const BlacklistModel = sequelize.define<BlacklistModel>('Blacklists', {
    id: DataTypes.STRING
})

export {
    sequelize,
    LevelModel,
    BlacklistModel
}
