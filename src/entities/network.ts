import {Column, Entity, PrimaryGeneratedColumn} from "typeorm"

@Entity()
export class Network {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  vmType: string

  @Column()
  name: string

  @Column({nullable: true})
  image: string

  @Column()
  rpcUrl: string

  @Column({nullable: true})
  chainId: number

  @Column()
  currencySymbol: string

  @Column({nullable: true})
  explorerUrl: string
}