import { getIntegrationToken } from '@commercelayer/js-auth'
import { useEffect, useState } from 'react'
import Price from '#components/prices/Price'
import PricesContainer from '#components/prices/PricesContainer'
import CommerceLayer from '#components/auth/CommerceLayer'

const clientId = process.env['NEXT_PUBLIC_CLIENT_ID_INTEGRATION'] as string
const clientSecret = process.env['NEXT_PUBLIC_CLIENT_SECRET'] as string
const endpoint = process.env['NEXT_PUBLIC_ENDPOINT'] as string
const scope = process.env['NEXT_PUBLIC_MARKET_ID'] as string

export const Nav = ({ links }: any) => (
  <header className='dark p-6'>
    <div className='container mx-auto'>
      <nav className='flex flex-row items-center'>
        <div className='flex items-center mr-10'>
          <a href='/' className='w-48'>
            <img src='//commercelayer.io/assets/img/commercelayer_logo_white.svg?v=2' />
          </a>
        </div>
        <div className='flex w-full justify-end'>
          <div className=''>
            {links.map((l: string, i: number) => {
              return (
                <a
                  key={i}
                  className='dark capitalize text-base font-normal mr-5'
                  href={l}
                >
                  {l === '/' ? 'home' : l.replace('/', ' ')}
                </a>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  </header>
)

export const Title = ({ title }: any) => (
  <div className='font-bold text-2xl mb-2 bg-green-300'>{title}</div>
)

export const Type = ({ text }: any) => (
  <span className='inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2'>
    #{text}
  </span>
)

const skus = [
  'BABYONBU000000E63E7412MX',
  'BABYONBU000000FFFFFF12MX',
  'BABYONBUFFFFFF00000012MX',
  'BABYONBUFFFFFFE63E7412MX',
  'CANVASAU000000FFFFFF1824',
  'CANVASAUE63E74FFFFFF1824',
  'HATBEAMU000000E63E74XXXX',
  'HATBEAMU000000FFFFFFXXXX',
  'HATBEAMUB7B7B7000000XXXX',
  'HATBEAMUB7B7B7E63E74XXXX',
  'HATBSBMU000000E63E74XXXX',
  'HATBSBMU000000FFFFFFXXXX',
  'HATBSBMUFFFFFF000000XXXX',
  'HATBSBMUFFFFFFE63E74XXXX',
  'LSLEEVMM000000E63E74LXXX',
  'LSLEEVMM000000FFFFFFLXXX'
]

const Home = () => {
  const [token, setToken] = useState('')
  useEffect(() => {
    const getToken = async () => {
      const auth = await getIntegrationToken({
        clientId,
        clientSecret,
        endpoint,
        scope
      })
      setToken(auth?.accessToken as string)
    }
    if (!token) {
      getToken()
    }
  }, [])
  const Loading = () => <div>Caricamento...</div>
  return (
    <section className='bg-gray-100'>
      <div className='mx-auto'>
        <CommerceLayer accessToken={token} endpoint={endpoint}>
          <h1 className='text-center text-3xl py-5'>Filtered by EUR</h1>
          <div className='flex flex-row flex-wrap justify-around p-5'>
            <PricesContainer
              perPage={5}
              loader={<Loading />}
              filters={{ price_list_currency_code_eq: 'EUR' }}
            >
              {skus.map((s, k) => {
                const lImg = s.substring(0, s.length - 4)
                return (
                  <div
                    key={k}
                    className='text-center p-5 w-full'
                    style={{ maxWidth: '15rem' }}
                  >
                    <img
                      src={`https://img.commercelayer.io/skus/${lImg}.png?fm=png&q=70`}
                      className='rounded-lg md:w-56 m-auto'
                    />
                    <div className='flex flex-row flex-wrap justify-center'>
                      <Price
                        data-test={`price-filter-${k}`}
                        skuCode={s}
                        className='text-green-600 text-2xl m-1'
                        compareClassName='text-gray-500 text-2xl m-1 line-through'
                      />
                    </div>
                    <div className='p-3'>
                      <a
                        className='mt-2 primary font-bold py-2 px-4 rounded'
                        href='#'
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                )
              })}
            </PricesContainer>
          </div>
          <div className='bg-gray-900'>
            <h1 className='text-center text-3xl py-5 text-white'>No filter</h1>
          </div>
          <div className='flex flex-row flex-wrap justify-around bg-gray-900 p-5'>
            <PricesContainer>
              {skus.map((s, k): JSX.Element => {
                const lImg = s.substring(0, s.length - 4)
                return (
                  <div key={k} className='text-center p-5 w-full'>
                    <img
                      src={`https://img.commercelayer.io/skus/${lImg}.png?fm=png&q=70`}
                      className='rounded-lg w-56 m-auto'
                    />
                    <div className='flex flex-row flex-wrap justify-center'>
                      <Price
                        data-test={`price-${k}`}
                        skuCode={s}
                        className='text-green-600 text-2xl m-1'
                        compareClassName='text-gray-500 text-2xl m-1 line-through'
                      />
                    </div>
                    <div className='p-3'>
                      <a
                        className='mt-2 primary font-bold py-2 px-4 rounded'
                        href='#'
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                )
              })}
            </PricesContainer>
          </div>
        </CommerceLayer>
      </div>
    </section>
  )
}
export default Home
