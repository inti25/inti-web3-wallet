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

  address: string

  privateKey : string;
}

export const networkType = ["evm", "solana"]