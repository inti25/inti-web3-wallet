import type { mnemonicToSeedSync as mnemonicToSeedSyncT } from "ethereum-cryptography/bip39";
const { bufferToHex } = require("@nomicfoundation/ethereumjs-util");
import type { HDKey as HDKeyT } from "ethereum-cryptography/hdkey";
import { ethers } from "ethers";

export function getEtherAccount(mnemonic: string, index: number) {
  const privatKey = deriveKeyFromMnemonicAndPath(
    mnemonic,
    `m/44'/60'/0'/0/${index}`,
    ""
  );
  return new ethers.Wallet(bufferToHex(privatKey));
}

export function deriveKeyFromMnemonicAndPath(
  mnemonic: string,
  hdPath: string,
  passphrase: string
): Buffer | undefined {
  const {
    mnemonicToSeedSync,
  }: {
    mnemonicToSeedSync: typeof mnemonicToSeedSyncT;
  } = require("ethereum-cryptography/bip39");
  const trimmedMnemonic = mnemonic.trim();
  const seed = mnemonicToSeedSync(trimmedMnemonic, passphrase);
  const {
    HDKey,
  }: {
    HDKey: typeof HDKeyT;
  } = require("ethereum-cryptography/hdkey");
  const masterKey = HDKey.fromMasterSeed(seed);
  const derived = masterKey.derive(hdPath);

  return derived.privateKey === null
    ? undefined
    : Buffer.from(derived.privateKey);
}
