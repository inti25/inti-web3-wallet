import {Network} from "../entities/network";
import {ethers, formatEther, formatUnits, ZeroAddress} from "ethers";
import {Connection, LAMPORTS_PER_SOL, PublicKey} from '@solana/web3.js';
import {getAccount, getMint, TOKEN_PROGRAM_ID} from '@solana/spl-token';
import {Abis} from "../abis";
import {VMTYPE} from "./constains";
import {Token} from "../entities/token";
import {Metaplex} from "@metaplex-foundation/js";

export async function getTokenInfo(address: string,  network: Network) {
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
    const contract = new ethers.Contract(token.address, Abis.ERC20, provider);
    return formatUnits(await contract.balanceOf(walletAddress), token.decimal);
  } else if (network.vmType == VMTYPE.SOLANA) {
    return '0';
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
    token.balance = formatEther(await provider.getBalance(walletAddress));
  } else if (network.vmType == VMTYPE.SOLANA) {
    const SOLANA_CONNECTION = new Connection(network.rpcUrl);
    const balance = await SOLANA_CONNECTION.getBalance(new PublicKey(walletAddress));
    token.balance = balance / LAMPORTS_PER_SOL;
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
    const token:any = {}
    const info = await getAccount(connection, tokenAccs.value[i].pubkey);
    const mint = await getMint(connection, info.mint);
    token.decimal = mint.decimals;
    token.address = mint.address.toBase58();
    token.key = mint.address.toBase58();
    token.balance = formatUnits(info.amount, mint.decimals);
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
    .metadata({ mint: tokenMint });
  const metadataAccountInfo = await connection.getAccountInfo(metadataAccount);

  if (metadataAccountInfo) {
    return await metaplex.nfts().findByMint({mintAddress: tokenMint});
  } else {
    return null;
  }
}
