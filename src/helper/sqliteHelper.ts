import {DataSource} from "typeorm";
import {Config, MNEMONIC_KEY, PASSWORD_KEY} from "../entities/config";
import {Repository} from "typeorm/repository/Repository";
import {comparePassword, encrypt, hashPassword} from "../utils/encryptionUtil";

export class SqliteHelper {
  private configRepository: Repository<Config>;
  constructor() {
    const dataSource = new DataSource({
      type: "sqlite",
      database: "data.db",
      entities: [Config],
      synchronize: true,
      logging: false,
    })
    dataSource.initialize()
      .then(() => {
        console.log('database initialize done');
        this.configRepository = dataSource.getRepository(Config);
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
}