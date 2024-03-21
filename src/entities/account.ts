import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  vmType: string

  @Column()
  name: string

  @Column()
  accountIndex: number
}

export const networkType = ["evm", "solana"]