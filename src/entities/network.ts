import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {Token} from "./token";

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
  currencyImage: string

  @Column({nullable: true})
  explorerUrl: string

  @OneToMany(() => Token, (token) => token.network, {
    cascade: true
  }) // note: we will create network property in the Token class below
  tokens: Token[]
}