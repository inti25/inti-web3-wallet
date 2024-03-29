import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Network} from "./network";

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  address: string

  @Column()
  name: string

  @Column()
  symbol: string

  @Column()
  decimal: number

  @Column({nullable: true})
  image: string

  @Column({default: false})
  hidden: boolean

  balance: string;

  @ManyToOne(() => Network, (network) => network.tokens)
  network: Network
}
