import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity()
export class Network {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  vmType: string

  @Column()
  name: string

  @Column()
  image: string

  @Column()
  rpcUrl: string

  @Column()
  chainId: number

  @Column()
  currencySymbol: string

  @Column()
  explorerUrl: string
}