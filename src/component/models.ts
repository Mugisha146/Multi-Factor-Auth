import { DataTypes, Model } from 'sequelize'
import sequelize from '../database'
import { UserRAttributes, UserRSignupAttributes } from './types'
const currentDate = new Date()
const UserRPasswordValidityPeriod = new Date(currentDate)
UserRPasswordValidityPeriod.setMonth(currentDate.getMonth() + 3)


class UserR
  extends Model<UserRAttributes, UserRSignupAttributes>
  implements UserRAttributes
{
  declare id: string

  declare firstName: string

  declare lastName: string

  declare email: string

  declare password: string

  declare verified: boolean

  declare role: string

  declare isActive: boolean

  declare createdAt: Date

  declare updatedAt: Date

}

UserR.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      onDelete: 'CASCADE',
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'user',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize: sequelize,
    modelName: 'UserR',
    tableName: 'Userrs',
    timestamps: true,
  },
)

export default UserR