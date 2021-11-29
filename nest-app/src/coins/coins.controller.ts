import { Controller, Get } from '@nestjs/common'
import axios from 'axios'
import { CoinsService } from './coins.service'

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
    @Get('/sendUbbsMyKaKaoMessage')
    async sendUbbsMyKaKaoMessage(): Promise<Array<object>> {
		const ubbsList = await this.coinService.getUbbOutTickers()
		const textMsg = this.coinService.makeMessageTemplate(ubbsList, true)
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: 'Bearer g1aF_SDB9yc4LQU37v7JDTsgN5Je_PVquG4sXAo9c04AAAF9amy4_Q'
		}
		const params = new URLSearchParams()
		const msgTemplate = {
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
		const lbbsList = await this.coinService.getLbbOutTickers()
		const textMsg = this.coinService.makeMessageTemplate(lbbsList, false)
		const headers = {
		  'Content-Type': 'application/x-www-form-urlencoded',
		  Authorization: 'Bearer gJd4riFKUQs21DzEKztHPrn8zH22SX5niFT2hgo9dVwAAAF9bQrm8A'
		}
		const params = new URLSearchParams()
		const msgTemplate = {
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
    @Get('/test')
    async test() {
		const headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: 'Bearer gJd4riFKUQs21DzEKztHPrn8zH22SX5niFT2hgo9dVwAAAF9bQrm8A'
		}
		const params = new URLSearchParams()
		const msgTemplate = {
			"object_type": "text",
			"text": "텍스트 영역입니다. 최대 200자 표시 가능합니다.22222",
			"link": {
				"web_url": "https://developers.kakao.com",
				"mobile_web_url": "https://developers.kakao.com"
			},
			"button_title": "바로 확인"
		}
		params.append('template_object', JSON.stringify(msgTemplate))
		axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send', params, { headers })
			.catch(err => console.log(err))
    }
}
