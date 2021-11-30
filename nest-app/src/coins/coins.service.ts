import { Injectable } from '@nestjs/common'
import { AxiosRequestHeaders } from '@nestjs/common/node_modules/axios'
import axios from 'axios'
import * as moment from 'moment-timezone'

@Injectable()
export class CoinsService {
    kakaoAccessKey: string = '4vkEqpy_2EAOyn_bNdAkGjh2KzIsEmT-wV2bjgopb7gAAAF9cPtycw'
    async getTickers(): Promise<Array<string>> {
        const response: any = await axios.get('https://api.upbit.com/v1/market/all?isDetails=false')
        const krwFiltered = response?.data?.filter(coin => coin?.market?.indexOf('KRW') > -1)?.map(coin => coin?.market)
        return krwFiltered
      }
    async getBand(ticker: string): Promise<Array<number>> {
        const response: any = await axios.get('https://api.upbit.com/v1/candles/days', {
          params: {
            market: ticker,
            count: 20
          }
        })
        const dataList: Array<any> = response.data.map(data => data.trade_price)
        const price20: number = this.getMedian(dataList)
        const ubb: number = price20 + (this.getStandardDeviation(dataList) * 2)
        const lbb: number = price20 - (this.getStandardDeviation(dataList) * 2)
        return [price20, ubb, lbb]
        // mbb = 중심선 = 주가의 20 기간 이동평균선 = clo20
        // ubb = 상한선 = 중심선 + 주가의 20기간 표준편차 * 2
        // lbb = 하한선 = 중심선 – 주가의 20기간 표준편차 * 2
        // perb = %b = (주가 – 하한선) / (상한선 – 하한선) = (close - lbb) / (ubb - lbb)
        // bw = 밴드폭 (Bandwidth) = (상한선 – 하한선) / 중심선 = (ubb - lbb) / mbb
    }
    async getUbbOutTickers(): Promise<Array<object>> {
        const tickers: Array<any> = await this.getTickers()
        const response: any = await axios.get('https://api.upbit.com/v1/ticker', {
            params: {
              markets: tickers.join(', ')
            }
        })
        const priceList: Array<any> = response.data.map(data => {
            return {
                market: data.market, 
                trade_price: data.trade_price
            }
        })
        // console.log('length : ', priceList.length)
        const timerTen: Function = () => {
            return new Promise<Array<object>>(resolve => {
                let turn: number = 0
                let tmpList: Array<object> = []
                const timer: NodeJS.Timer = setInterval(async () => {
                    // console.log(`${turn}---------------------------------------`)
                    for (let i = turn * 10; i < (turn + 1) * 10; i++) {
                        if (!priceList[i]) {
                            break
                        }
                        const crntPrice: number = priceList[i].trade_price
                        if (crntPrice && crntPrice !== undefined && crntPrice !== 0) {
                            const tickerBand: Array<any> = await this.getBand(priceList[i].market)
                            // console.log(crntPrice)
                            // console.log(tickerBand)
                            if (crntPrice > tickerBand[1]) {
                                tmpList.push({ market: priceList[i].market, ubb: tickerBand[1], trade_price: crntPrice })
                            }
                        }
                        // console.log(i)
                    }
                    if (turn === Math.floor(priceList.length / 10)) {
                        resolve(tmpList)
                        clearInterval(timer)
                    }
                    turn++
                }, 1500)
            })
        }
        const ubbOutList: Array<object> = await timerTen()
        console.log('UpperOut: ', ubbOutList)
        return ubbOutList
    }
    async getLbbOutTickers(): Promise<Array<object>> {
        const tickers: Array<any> = await this.getTickers()
        const response: any = await axios.get('https://api.upbit.com/v1/ticker', {
            params: {
              markets: tickers.join(', ')
            }
        })
        const priceList: Array<any> = response.data.map(data => {
            return {
                market: data.market, 
                trade_price: data.trade_price
            }
        })
        // console.log('length : ', priceList.length)
        const timerTen: Function = () => {
            return new Promise<Array<object>>(resolve => {
                let turn: number = 0
                let tmpList: Array<object> = []
                const timer: NodeJS.Timer = setInterval(async () => {
                    // console.log(`${turn}---------------------------------------`)
                    for (let i = turn * 10; i < (turn + 1) * 10; i++) {
                        if (!priceList[i]) {
                            break
                        }
                        const crntPrice: number = priceList[i].trade_price
                        if (crntPrice && crntPrice !== undefined && crntPrice !== 0) {
                            const tickerBand: Array<any> = await this.getBand(priceList[i].market)
                            // console.log(crntPrice)
                            // console.log(tickerBand)
                            if (crntPrice < tickerBand[2]) {
                                tmpList.push({ market: priceList[i].market, lbb: tickerBand[2], trade_price: crntPrice })
                            }
                        }
                        // console.log(i)
                    }
                    if (turn === Math.floor(priceList.length / 10)) {
                        resolve(tmpList)
                        clearInterval(timer)
                    }
                    turn++
                }, 1500)
            })
        }
        const lbbOutList: Array<object> = await timerTen()
        console.log('LowerOut: ', lbbOutList)
        return lbbOutList
    }
    getMedian (array: Array<any>): number {
        if (!array || array.length === 0) { return 0 }
        const n: number = array.length
        let sum: number = 0
        for (let data of array) {
          sum += data
        }
        return sum / n
    }
    getStandardDeviation (array: Array<any>): number {
        if (!array || array.length === 0) { return 0 }
        const n: number = array.length
        const mean: number = array.reduce((a, b) => a + b) / n
        return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
    }
    makeMessageTemplate (array: Array<any>, isUbb: boolean): string {
        const dateStr: string = moment().format('YYYY-MM-DD HH:mm:ss')
        let msg: string = '코인 정보 '.concat(dateStr).concat('\n')
        if (array.length > 0) {
            for (let coin of array) {
                if (!coin || coin === undefined || coin === null) {
                    break
                }
                msg += '티커 : '
                msg += coin.market
                msg += '\n'
                msg += '현재 가격 : '
                msg += coin.trade_price
                msg += '\n'
                if (coin.ubb) {
                    msg += 'UBB : '
                    msg += coin.ubb
                    msg += '\n'
                }
                if (coin.lbb) {
                    msg += 'LBB : '
                    msg += coin.lbb
                    msg += '\n'
                }
            }
        } else if (isUbb) {
            msg += 'NO UBB OUT COIN'
        } else {
            msg += 'NO LBB OUT COIN'
        }
        return msg
    }
    makeKakaoHeader (): AxiosRequestHeaders {
        const headers: AxiosRequestHeaders = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Bearer ${this.kakaoAccessKey}`
        }
        return headers
    }
    makeKakaoMessage (textMsg: string): Object {
		const msgTemplate: object = {
			"object_type": "text",
			"text": textMsg,
			"link": {
				"web_url": "https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC",
				"mobile_web_url": "https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC"
			},
			"button_title": "바로 확인"
		}
        return msgTemplate
    }
}
