import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const WhatsappCliente = sequelize.define('WhatsappCliente', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  // --- NOVO CAMPO ---
  nome: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ultima_interacao: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'whatsapp_clientes',
  timestamps: true
});

export default WhatsappCliente;