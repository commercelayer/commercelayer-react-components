import { getIntegrationToken } from '@commercelayer/js-auth'
import { Import } from '@commercelayer/js-sdk'
import { NextApiRequest, NextApiResponse } from 'next'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { accessToken } = await getIntegrationToken({
      clientId:
        'b1aa32826ce12ba2f74c59a555e3ed98a7db4ec710b14575b7e97f0a49fb9a4d',
      clientSecret:
        '8fed019759490ba13c482cc2541ef77c6b8d0b3df04db80807110784fbfec021',
      endpoint,
      scope: 'market:48',
    })
    try {
      await Import.withCredentials({
        accessToken,
        endpoint,
      }).create(req.body)
      console.log('req.body', req.body)
      res.statusCode = 200
      return res.json({
        success: true,
      })
    } catch (error) {
      res.statusCode = 422
      return res.json(error.errors().toArray())
    }
  }
  res.statusCode = 405
  return res.json({
    code: 405,
    message: 'Method not allowed',
  })
}
