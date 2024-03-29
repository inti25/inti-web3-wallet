import {Network} from "../entities/network";
import {ethers, formatEther, formatUnits, ZeroAddress} from "ethers";
import {Abis} from "../abis";
import {VMTYPE} from "./constains";
import {Token} from "../entities/token";

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
  }

  return token;
}