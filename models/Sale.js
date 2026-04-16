const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Sale = sequelize.define('Sale', {
  sellerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  },
  status: {
    type: DataTypes.ENUM('pendente', 'entregue'),
    allowNull: false,
    defaultValue: 'pendente',
  },
  observation: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '',
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  needChange: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'sales',
});

module.exports = Sale;
