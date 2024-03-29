import {DataSource} from "typeorm";
import {Config, MNEMONIC_KEY, PASSWORD_KEY} from "../entities/config";
import {Repository} from "typeorm/repository/Repository";
import {comparePassword, encrypt, hashPassword} from "../utils/encryptionUtil";
import {Network} from "../entities/network";
import {Account} from "../entities/account";
import {Token} from "../entities/token";

export class SqliteHelper {
  private configRepository: Repository<Config>;
  private networkRepository: Repository<Network>;
  private accountRepository: Repository<Account>;
  private tokenRepository: Repository<Token>;
  constructor() {
    const dataSource = new DataSource({
      type: "sqlite",
      database: "data.db",
      entities: [Network,Token, Account, Config],
      synchronize: true,
      logging: false,
    })
    dataSource.initialize()
      .then(() => {
        console.log('database initialize done');
        this.configRepository = dataSource.getRepository(Config);
        this.networkRepository = dataSource.getRepository(Network);
        this.accountRepository = dataSource.getRepository(Account);
        this.tokenRepository = dataSource.getRepository(Token);
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

  async getMnemonic() {
    const conf = await this.configRepository.findOneBy({key: MNEMONIC_KEY});
    return conf.value;
  }

  async saveNetwork(nw: Network) {
    await this.networkRepository.save(nw);
  }

  async getNetworks() {
    return await this.networkRepository.find();
  }

  async deleteNetwork(id: number) {
    const removeItem = await this.networkRepository.findOneBy({
      id: id,
    })
    await this.networkRepository.remove(removeItem)
  }

  async getAccounts(vmType: string) {
    return await this.accountRepository.findBy({vmType : vmType});
  }

  async createAccount(vmType: string, accountName: string) {
    const index = await this.accountRepository.countBy({vmType : vmType});
    const newAccount = new Account();
    newAccount.accountIndex = index;
    newAccount.vmType = vmType;
    newAccount.name = accountName;
    return await this.accountRepository.save(newAccount);
  }

  async getTokens(network: Network) {
    return await this.tokenRepository.findBy({network: network});
  }

  async saveToken(token: Token) {
    await this.tokenRepository.save(token);
  }

  async removeToken(removeItem: Token) {
    await this.tokenRepository.remove(removeItem);
  }
}