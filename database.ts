import { Sequelize, Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';

const sequelize = new Sequelize('postgres://pvwahmos:L_dnC-j_X2OsWKUE2hHDUzLn86ehJb4K@abul.db.elephantsql.com/pvwahmos', {
    logging: false
})

interface LevelModel extends Model<InferAttributes<LevelModel>, InferCreationAttributes<LevelModel>> {
    id: string,
    xp: number,
    lvl: number
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

export {
    sequelize,
    LevelModel
}