module.exports = (sequelize, DataTypes) => {
	return sequelize.define('Pet_Shop', {
		Pet: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		Adoption_Fee: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};