import {DataSource} from "typeorm";
import {Config, MNEMONIC_KEY, PASSWORD_KEY} from "../entities/config";
import {Repository} from "typeorm/repository/Repository";
import {comparePassword, encrypt, hashPassword} from "../utils/encryptionUtil";
import {Network} from "../entities/network";

export class SqliteHelper {
  private configRepository: Repository<Config>;
  private networkRepository: Repository<Network>;
  constructor() {
    const dataSource = new DataSource({
      type: "sqlite",
      database: "data.db",
      entities: [Config, Network],
      synchronize: true,
      logging: true,
    })
    dataSource.initialize()
      .then(() => {
        console.log('database initialize done');
        this.configRepository = dataSource.getRepository(Config);
        this.networkRepository = dataSource.getRepository(Network);
      })
      .catch((error) => console.log(error))
  }

  async savePassword(password: string) {
    const hash = await hashPassword(password);
    const cfg = new Config();
    cfg.key = PASSWORD_KEY;
    cfg.value = hash;
    await this.configRepository.save(cfg);
  }

  async getPasswordHash() {
    const conf = await this.configRepository.findOneBy({key: PASSWORD_KEY});
    return conf?.value;
  }

  async verifyPassword(password: string) {
    const conf = await this.configRepository.findOneBy({key: PASSWORD_KEY});
    if (conf) {
      return await comparePassword(password, conf.value);
    }
    return false;
  }

  async saveMnemonic(mnemonic: string, password: string) {
    const encryptData = encrypt(mnemonic, password);
    const conf = new Config();
    conf.key = MNEMONIC_KEY;
    conf.value = encryptData;
    await this.configRepository.save(conf);
  }

  async saveNetwork(nw: Network) {
    await this.networkRepository.save(nw);
  }

  async getNetworks() {
    const result = await this.networkRepository.find();
    if (result.length == 0) {
      const nw = new Network();
      nw.vmType = "evm";
      nw.currencySymbol = "ETH";
      nw.chainId = 1;
      nw.name = "Ethereum";
      nw.rpcUrl = "";
      nw.explorerUrl = "https://etherscan.io";
      nw.image = "https://assets.coingecko.com/coins/images/279/standard/ethereum.png";
    }
    return await this.networkRepository.find();
  }

  async deleteNetwork(id: number) {
    const removeItem = await this.networkRepository.findOneBy({
      id: id,
    })
    await this.networkRepository.remove(removeItem)
  }
}