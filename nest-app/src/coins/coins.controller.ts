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
		@Get('/test')
		test() {
			const headers = {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer 5omRD6NIJSOYeOnIYRGcyirWcdCslGBnIxJWfQorDKYAAAF9aChs8g',
				'data': 'object_type: "text", text: "HI", button_title: "TEST"'
			}			
			axios.post('https://kapi.kakao.com/v2/api/talk/memo/default/send', {
			}, {
				headers
			})
				.catch(err => {
					console.log(err)
				})
		}
}
