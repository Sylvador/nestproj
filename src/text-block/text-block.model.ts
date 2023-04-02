import { Column, DataType, Model, Table } from "sequelize-typescript";

interface TextBlockCreationAttrs {
  uniqueName: string;
  title: string;
  text: string;
  group: string;
}

@Table({tableName: 'text-blocks'})
export class TextBlock extends Model<TextBlock, TextBlockCreationAttrs> {
  @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({ type: DataType.STRING, unique: true, allowNull: false})
  uniqueName: string;

  @Column
  title: string;

  @Column({ type: DataType.TEXT})
  text: string;
  
  @Column({ type: DataType.STRING})
  group: string;
}