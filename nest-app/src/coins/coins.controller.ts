import { Controller, Get } from '@nestjs/common'
import { AxiosRequestHeaders } from '@nestjs/common/node_modules/axios'
import { URLSearchParams } from 'url'
import { CoinsService } from './coins.service'
import axios from 'axios'

@Controller('coins')
export class CoinsController {
    constructor(private readonly coinService: CoinsService) {}
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
	@Get('/sendAllMyKakaoMessage')
	async sendAllMyKakaoMessage(): Promise<Array<Array<object>>> {
		const ubbs: Array<object> = await this.sendUbbsMyKaKaoMessage()
		const lbbs: Array<object> = await this.sendLbbsMyKaKaoMessage()
		return [ubbs, lbbs]
	}
    @Get('/sendUbbsMyKaKaoMessage')
    async sendUbbsMyKaKaoMessage(): Promise<Array<object>> {
		const ubbsList: Array<object> = await this.coinService.getUbbOutTickers()
		const textMsg: string = this.coinService.makeMessageTemplate(ubbsList, true)
		const headers: AxiosRequestHeaders = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: 'Bearer gJd4riFKUQs21DzEKztHPrn8zH22SX5niFT2hgo9dVwAAAF9bQrm8A'
		}
		const params: URLSearchParams = new URLSearchParams()
		const msgTemplate: object = {
			"object_type": "text",
			"text": textMsg,
			"link": {
				"web_url": "https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC",
				"mobile_web_url": "https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC"
			},
			"button_title": "바로 확인"
		}
		params.append('template_object', JSON.stringify(msgTemplate))
		axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send', params, { headers })
			.catch(err => console.log(err))
		return ubbsList
    }
    @Get('/sendLbbsMyKaKaoMessage')
    async sendLbbsMyKaKaoMessage(): Promise<Array<object>> {
		const lbbsList: Array<object> = await this.coinService.getLbbOutTickers()
		const textMsg: string = this.coinService.makeMessageTemplate(lbbsList, false)
		const headers: AxiosRequestHeaders = {
		  'Content-Type': 'application/x-www-form-urlencoded',
		  Authorization: 'Bearer gJd4riFKUQs21DzEKztHPrn8zH22SX5niFT2hgo9dVwAAAF9bQrm8A'
		}
		const params: URLSearchParams = new URLSearchParams()
		const msgTemplate: object = {
		  "object_type": "text",
		  "text": textMsg,
		  "link": {
			  "web_url": "https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC",
			  "mobile_web_url": "https://upbit.com/exchange?code=CRIX.UPBIT.KRW-BTC"
		  },
		  "button_title": "바로 확인"
		}
		params.append('template_object', JSON.stringify(msgTemplate))
		axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send', params, { headers })
			.catch(err => console.log(err))
		return lbbsList
    }
}
