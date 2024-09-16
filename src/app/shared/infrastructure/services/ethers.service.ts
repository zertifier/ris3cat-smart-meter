import {Injectable} from '@angular/core';
import {ZertiauthApiService} from "@features/auth/infrastructure/services/zertiauth-api.service";
import {AuthStoreService} from "@features/auth/infrastructure/services/auth-store.service";
import {Contract, ethers, formatEther, JsonRpcProvider, parseUnits, Wallet} from "ethers";
import {HttpResponse} from "./HttpResponse";
import {HttpClient} from "@angular/common/http";
import {environment} from "@environments/environment";
import {Router} from "@angular/router";
import erc20ContractAbi from '../../../../assets/ethers/ERC20-abi.json';
import daoContractAbi from '../../../../assets/ethers/DAO-abi.json';
import {UserStoreService} from "@features/user/infrastructure/services/user-store.service";


interface Rpc {
  id: number;
  blockchainId: number;
  rpc: string;
  active: boolean;
  working: boolean;
  eventTransfer: boolean;
  createDt: string;  // ISO 8601 date string
  updateDt: string;  // ISO 8601 date string
}

interface RpcData {
  [key: string]: Rpc[];
}

@Injectable({
  providedIn: 'root'
})
export class EthersService {
  private rpc: string = environment.defaultRpc
  rpcsBaseUrl = environment.zertirpcs_url || 'https://zertirpc.zertifier.com'

  constructor(
    private httpClient: HttpClient,
    private zertiauthApiService: ZertiauthApiService,
    private authStoreService: AuthStoreService,
    private router: Router,
    private userStore: UserStoreService,
  ) {
  }


  async getWalletFromAuthPk() {
    const oAuthCode = this.authStoreService.getOauthCode()
    if (!oAuthCode) {
      this.authStoreService.resetDefaults()
      const urlTree = this.router.createUrlTree(['/auth']);
      await this.router.navigateByUrl(urlTree);
    }

    try {
      const privateKeyResponse = await this.zertiauthApiService.getPrivateKey(oAuthCode)
      const provider = new JsonRpcProvider(await this.getWorkingRpc())

      return new Wallet(privateKeyResponse.privateKey, provider)
    } catch (error) {
      console.log(error)
      this.authStoreService.resetDefaults()
      const urlTree = this.router.createUrlTree(['/auth']);
      await this.router.navigateByUrl(urlTree);
      return
    }

  }

  getWorkingRpc(): Promise<string> {
    return new Promise<string>((resolve) => {
      this.updateWorkingRpc().subscribe({
        next: (rpc) => {
          if (rpc.data) {
            const workingRpc = rpc.data['100'].find((element) => element.working === true);
            this.rpc = workingRpc?.rpc || environment.defaultRpc
            resolve(this.rpc);
          } else {
            resolve(environment.defaultRpc);
          }
        },
        error: () => {
          resolve(environment.defaultRpc);
        }
      });
    });
  }

  updateWorkingRpc() {
    return this.httpClient.get<HttpResponse<RpcData>>(`${this.rpcsBaseUrl}/100/rpc`)
  }

  getCurrentRpc(){
    return this.rpc
  }

  async getEKWBalance(walletAddress: string) {
    try {
      const provider = new JsonRpcProvider(this.rpc)

      const contract = new Contract(environment.erc20_contract, erc20ContractAbi, provider)

      const balance = formatEther(await contract['balanceOf'](walletAddress)).toString()

      // return getNumber(await contract.balanceOf(walletAddress))
      return parseFloat(balance)
    } catch (error) {
      console.log(error, "ERROR")
      return 0
    }
  }

  async getChainBalance(walletAddress: string) {
    try {
      const provider = new JsonRpcProvider(this.rpc)
      const balance = formatEther(await provider.getBalance(walletAddress)).toString()
      return parseFloat(balance)
    } catch (error) {
      console.log(error, "ERROR")
      return 0
    }
  }

  async getCurrentGasPrice(){
    try {
      const provider = new JsonRpcProvider(this.rpc)

      return parseFloat(formatEther((await provider.getFeeData()).gasPrice!)) || 0 ;
    }catch (e){
      return 0
    }

  }

  async mintTokens(walletTo: string, amount: number) {
    try {
      const user = this.userStore.snapshotOnly(state => state.user);
      if (!user) {
        return
      }

      const contract = new Contract('0x7D33eC4451E4035988d9638b30b18681dE6B0dc6', daoContractAbi, user.wallet)

      let tx = await contract['mint'](walletTo, parseUnits(amount.toString(), "ether"))
      tx = await tx.wait()
      return tx
    }catch (e){
      console.log(e)
      return
    }
  }
  async transferFromCurrentWallet(to: string, amount: number, type: 'DAO' | 'XDAI' | 'EKW', contractAddress = environment.erc20_contract){
    try {
      const user = this.userStore.snapshotOnly(state => state.user);
      if (!user) {
        return
      }

      const abi = type == 'DAO' ? daoContractAbi : erc20ContractAbi

      let tx: any;
      if (type == 'XDAI'){
        tx = {
          to: to,
          value: ethers.parseUnits(amount.toString(), "ether"),
        };
        tx = await user.wallet?.sendTransaction(tx)
      }else{
        const contract = new Contract(contractAddress, abi, user.wallet)
        tx = await contract['transfer'](to, parseUnits(amount.toString(), "ether"))
      }

      tx = await tx.wait()
      return tx
    }catch (e){
      console.log(e)
      return
    }
  }
}
