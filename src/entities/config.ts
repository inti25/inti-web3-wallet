import {Column, Entity, PrimaryColumn} from "typeorm"

@Entity()
export class Config {
  @PrimaryColumn()
  key: string
  @Column()
  value: string
}

export const PASSWORD_KEY = 'password';
export const MNEMONIC_KEY = 'mnemonic';