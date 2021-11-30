import { Controller, Get } from '@nestjs/common'
import { AxiosRequestHeaders } from '@nestjs/common/node_modules/axios'
import { URLSearchParams } from 'url'
import { CoinsService } from './coins.service'
import axios from 'axios'

@Controller('coins')
export class CoinsController {
	timer: NodeJS.Timer
    constructor(private readonly coinService: CoinsService) {
		this.timer = null
	}
    @Get('/tickers')
    async getTickers(): Promise<any> {
		return await this.coinService.getTickers()
    }
    @Get('/getUbbOutTickers')
    async getBandOutTicker(): Promise<Array<object>> {
		return this.coinService.getUbbOutTickers()
    }
    @Get('/getLbbOutTickers')
    async getLbbOutTickers(): Promise<Array<object>> {
		return this.coinService.getLbbOutTickers()
    }
	@Get('/clearTimer')
	clearTimer(): void {
		clearInterval(this.timer)
		this.timer = null
	}
	@Get('/sendAllMyKakaoMessage')
	async sendAllMyKakaoMessage(): Promise<void> {
		this.timer = setInterval(async () => {
			await this.sendUbbsMyKaKaoMessage()
			await this.sendLbbsMyKaKaoMessage()
		}, 1000 * 60 * 10)
	}
    @Get('/sendUbbsMyKaKaoMessage')
    async sendUbbsMyKaKaoMessage(): Promise<Array<object>> {
		const ubbsList: Array<Object> = await this.coinService.getUbbOutTickers()
		const textMsg: string = this.coinService.makeMessageTemplate(ubbsList, true)
		const headers: AxiosRequestHeaders = this.coinService.makeKakaoHeader()
		const params: URLSearchParams = new URLSearchParams()
		const msgTemplate: Object = this.coinService.makeKakaoMessage(textMsg)
		params.append('template_object', JSON.stringify(msgTemplate))
		axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send', params, { headers })
			.catch(err => console.log(err))
		return ubbsList
    }
    @Get('/sendLbbsMyKaKaoMessage')
    async sendLbbsMyKaKaoMessage(): Promise<Array<object>> {
		const lbbsList: Array<object> = await this.coinService.getLbbOutTickers()
		const textMsg: string = this.coinService.makeMessageTemplate(lbbsList, false)
		const headers: AxiosRequestHeaders = this.coinService.makeKakaoHeader()
		const params: URLSearchParams = new URLSearchParams()
		const msgTemplate: Object = this.coinService.makeKakaoMessage(textMsg)
		params.append('template_object', JSON.stringify(msgTemplate))
		axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send', params, { headers })
			.catch(err => console.log(err))
		return lbbsList
    }
}
