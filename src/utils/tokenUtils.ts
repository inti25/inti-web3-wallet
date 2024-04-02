import {Network} from "../entities/network";
import {ethers, formatEther, formatUnits, ZeroAddress} from "ethers";
import {
  Connection, Keypair, Transaction as SolanaTransaction, PublicKey, SystemProgram,
  sendAndConfirmTransaction as SolanaSendAndConfirmTransaction, sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAccount,
  getMint,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import * as bs58 from 'bs58';
import {Abis} from "../abis";
import {VMTYPE} from "./constains";
import {Token} from "../entities/token";
import {Metaplex} from "@metaplex-foundation/js";
import {Account} from "../entities/account";
import base58 from "bs58";

export async function getTokenInfo(address: string, network: Network) {
  if (network.vmType == VMTYPE.EVM) {
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    const contract = new ethers.Contract(address, Abis.ERC20, provider);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimal = Number(await contract.decimals());
    return {name, symbol, decimal};
  }
  return null
}

export async function getTokenBalance(walletAddress: string, token: Token, network: Network) {
  if (network.vmType == VMTYPE.EVM) {
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    if (token.address) {
      const contract = new ethers.Contract(token.address, Abis.ERC20, provider);
      return String(await contract.balanceOf(walletAddress));
    } else {
      return String(await provider.getBalance(walletAddress));
    }
  } else if (network.vmType == VMTYPE.SOLANA) {
    const connection = new Connection(network.rpcUrl);
    if (token.address) {
      try {
        const info = await getAccount(connection, new PublicKey(token.tokenAccount));
        return String(info.amount);
      } catch (e) {
        return '0';
      }
    } else {
      return String(await connection.getBalance(new PublicKey(walletAddress)))
    }
  }
  return '0';
}

export async function getNativeTokenInfo(walletAddress: string, network: Network) {
  const token: any = {};
  if (network.vmType == VMTYPE.EVM) {
    token.key = ZeroAddress;
    token.name = network.currencySymbol;
    token.symbol = network.currencySymbol;
    token.image = network.currencyImage;
    token.decimal = 18;
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    token.balance = String(await provider.getBalance(walletAddress));
  } else if (network.vmType == VMTYPE.SOLANA) {
    const SOLANA_CONNECTION = new Connection(network.rpcUrl);
    const balance = await SOLANA_CONNECTION.getBalance(new PublicKey(walletAddress));
    token.balance = String(balance);
    token.key = ZeroAddress;
    token.name = network.currencySymbol;
    token.symbol = network.currencySymbol;
    token.image = network.currencyImage;
    token.decimal = 10;
  }

  return token;
}

export async function getSolanaSPLToken(walletAddress: string, rpc: string) {
  const connection = new Connection(rpc);
  const tokenAccs = await connection.getTokenAccountsByOwner(new PublicKey(walletAddress), {
    programId: TOKEN_PROGRAM_ID,
  });
  const result: any[] = [];
  for (let i = 0; i < tokenAccs.value.length; i++) {
    const token: any = {}
    const info = await getAccount(connection, tokenAccs.value[i].pubkey);
    const mint = await getMint(connection, info.mint);
    token.decimal = mint.decimals;
    token.address = mint.address.toBase58();
    token.key = mint.address.toBase58();
    token.balance = info.amount;
    token.tokenAccount = tokenAccs.value[i].pubkey.toBase58();
    result.push(token)
    const tokenInfo = await getSolanaTokenInfo(connection, mint.address)
    if (tokenInfo) {
      token.name = tokenInfo.name
      token.symbol = tokenInfo.symbol
      try {
        const uri = await (await fetch(tokenInfo.uri)).text()
        const infoUri = JSON.parse(uri);
        token.image = infoUri.image;
        token.name = infoUri.name
        token.symbol = infoUri.symbol
      } catch (e) {
        console.log(e);
      }
    } else {
      token.name = "Unrecognized"
      token.symbol = "Unrecognized"
    }
  }
  return result;

}

export async function getSolanaTokenInfo(connection: Connection, tokenMint: PublicKey) {
  const metaplex = Metaplex.make(connection);
  const metadataAccount = metaplex
    .nfts()
    .pdas()
    .metadata({mint: tokenMint});
  const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

  if (metadataAccountInfo) {
    return await metaplex.nfts().findByMint({mintAddress: tokenMint});
  } else {
    return null;
  }
}

export async function transferToken(network: Network, token: Token, from: Account, to: string, amount: bigint) {
  const response: any = {
    isSuccess: true,
    txnHash: null,
    error: null,
  }
  let transaction: any = null;
  let provider: any = null;
  let signer: any = null;
  try {
    switch (network.vmType) {
      case VMTYPE.EVM:
        provider = new ethers.JsonRpcProvider(network.rpcUrl);
        signer = new ethers.Wallet(from.privateKey, provider);
        if (token.address) {
          const tokenContract = new ethers.Contract(token.address, Abis.ERC20, signer);
          transaction = await tokenContract.transfer(to, amount);
        } else {
          const txn = {
            from: await signer.getAddress(),
            to: to,
            value: amount,
            nonce: await signer.getNonce(),
          };
          transaction = await signer.sendTransaction(txn);
        }
        await transaction.wait();
        response.isSuccess = true;
        response.txnHash = transaction?.hash;
        break;
      case VMTYPE.SOLANA:
        provider = new Connection(network.rpcUrl);
        signer = Keypair.fromSecretKey(base58.decode(from.privateKey));
        if (token.address) {
          const sourceAccount = await getOrCreateAssociatedTokenAccount(
            provider,
            signer,
            new PublicKey(token.address),
            signer.publicKey
          );
          console.log(`2 - Getting Destination Token Account`);
          const destinationAccount = await getOrCreateAssociatedTokenAccount(
            provider,
            signer,
            new PublicKey(token.address),
            new PublicKey(to)
          );
          console.log(`    Destination Account: ${destinationAccount.address.toString()}`);
          console.log(`4 - Creating and Sending Transaction`);
          const tx = new SolanaTransaction();
          tx.add(createTransferInstruction(
            sourceAccount.address,
            destinationAccount.address,
            signer.publicKey,
            amount
          ))
          transaction = await sendAndConfirmTransaction(provider, tx, [signer]);
        } else {
          transaction = new SolanaTransaction().add(
            SystemProgram.transfer({
              fromPubkey: signer.publicKey,
              toPubkey: new PublicKey(to),
              lamports: amount,
            }),
          );
          // Sign transaction, broadcast, and confirm
          transaction = await SolanaSendAndConfirmTransaction(
            provider,
            transaction,
            [signer],
          );
        }
        response.isSuccess = true;
        response.txnHash = transaction;
        break;
      default:
        break;
    }
  } catch (e) {
    console.log('transfer error ', e);
    response.isSuccess = false;
    response.error = e.message ? e.message : e;
  }

  return response;
}