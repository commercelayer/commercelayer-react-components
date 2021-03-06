import {
  // getSalesChannelToken,
  getIntegrationToken,
} from '@commercelayer/js-auth'
import React, { useEffect, useState } from 'react'
import Price from '../src/components/Price'
import PricesContainer from '../src/components/PricesContainer'
import CommerceLayer from '../src/components/CommerceLayer'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

export const Nav = ({ links }) => (
  <header className="dark p-6">
    <div className="container mx-auto">
      <nav className="flex flex-row items-center">
        <div className="flex items-center mr-10">
          <a href="/" className="w-48">
            <img src="//commercelayer.io/assets/img/logos/commercelayer-logo-white.svg" />
          </a>
        </div>
        <div className="flex w-full justify-end">
          <div className="">
            {links.map((l: string, i: number) => {
              return (
                <a
                  key={i}
                  className="dark capitalize text-base font-normal mr-5"
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

export const Title = ({ title }) => (
  <div className="font-bold text-2xl mb-2 bg-green-300">{title}</div>
)

export const Type = ({ text }) => (
  <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
    #{text}
  </span>
)

const skus = [
  'BABYONBU000000E63E7412MX',
  // 'BABYONBU000000E63E74',
  // 'BABYONBU000000E63E7412MX',
  // 'BABYONBU000000E63E7418MX',
  // 'BABYONBU000000E63E7424MX',
  // 'BABYONBU000000E63E746MXX',
  // 'BABYONBU000000E63E74NBXX',
  // 'BABYONBU000000FFFFFF',
  // 'BABYONBU000000FFFFFF12MX',
  // 'BABYONBU000000FFFFFF18MX',
  // 'BABYONBU000000FFFFFF24MX',
  // 'BABYONBU000000FFFFFF6MXX',
  // 'BABYONBU000000FFFFFFNBXX',
  // 'BABYONBUFFFFFF000000',
  // 'BABYONBUFFFFFF00000012MX',
  // 'BABYONBUFFFFFF00000018MX',
  // 'BABYONBUFFFFFF00000024MX',
  // 'BABYONBUFFFFFF0000006MXX',
  // 'BABYONBUFFFFFF000000NBXX',
  // 'BABYONBUFFFFFFE63E74',
  // 'BABYONBUFFFFFFE63E7412MX',
  // 'BABYONBUFFFFFFE63E7418MX',
  // 'BABYONBUFFFFFFE63E7424MX',
  // 'BABYONBUFFFFFFE63E746MXX',
  // 'BABYONBUFFFFFFE63E74NBXX',
  // 'CANVASAU000000FFFFFF',
  // 'CANVASAU000000FFFFFF1824',
  // 'CANVASAUE63E74FFFFFF',
  // 'HATBEAMU000000E63E74',
  // 'HATBEAMU000000E63E74XXXX',
  // 'HATBEAMU000000FFFFFF',
  // 'HATBEAMU000000FFFFFFXXXX',
  // 'HATBEAMUB7B7B7000000',
  // 'HATBEAMUB7B7B7000000XXXX',
  // 'HATBEAMUB7B7B7E63E74',
  // 'HATBEAMUB7B7B7E63E74XXXX',
  // 'HATBSBMU000000E63E74',
  // 'HATBSBMU000000E63E74XXXX',
  // 'HATBSBMU000000FFFFFF',
  // 'HATBSBMU000000FFFFFFXXXX',
  // 'HATBSBMUFFFFFF000000',
  // 'HATBSBMUFFFFFF000000XXXX',
  // 'HATBSBMUFFFFFFE63E74',
  // 'HATBSBMUFFFFFFE63E74XXXX',
  // 'IPHO5XAU000000FFFFFF',
  // 'IPHO5XAU000000FFFFFFXXXX',
  // 'IPHO5XAUE63E74FFFFFF',
  // 'IPHO5XAUE63E74FFFFFFXXXX',
  // 'IPHO6PAU000000FFFFFF',
  // 'IPHO6PAU000000FFFFFFXXXX',
  // 'IPHO6PAUE63E74FFFFFF',
  // 'IPHO6PAUE63E74FFFFFFXXXX',
  // 'IPHO6XAU000000FFFFFF',
  // 'IPHO6XAU000000FFFFFFXXXX',
  // 'IPHO6XAUE63E74FFFFFF',
  // 'IPHO6XAUE63E74FFFFFFXXXX',
  // 'IPHO7PAU000000FFFFFF',
  // 'IPHO7PAU000000FFFFFFXXXX',
  // 'IPHO7PAUE63E74FFFFFF',
  // 'IPHO7PAUE63E74FFFFFFXXXX',
  // 'IPHO7XAU000000FFFFFF',
  // 'IPHO7XAU000000FFFFFFXXXX',
  // 'IPHO7XAUE63E74FFFFFF',
  // 'IPHO7XAUE63E74FFFFFFXXXX',
  // 'LSLEEVMM000000E63E74',
  // 'LSLEEVMM000000E63E742XLX',
  // 'LSLEEVMM000000E63E74LXXX',
  // 'LSLEEVMM000000E63E74MXXX',
  // 'LSLEEVMM000000E63E74SXXX',
  // 'LSLEEVMM000000E63E74XLXX',
  // 'LSLEEVMM000000FFFFFF',
  // 'LSLEEVMM000000FFFFFF2XLX',
  // 'LSLEEVMM000000FFFFFFLXXX',
  // 'LSLEEVMM000000FFFFFFMXXX',
  // 'LSLEEVMM000000FFFFFFSXXX',
  // 'LSLEEVMM000000FFFFFFXLXX',
  // 'LSLEEVMMFFFFFF000000',
  // 'LSLEEVMMFFFFFF0000002XLX',
  // 'LSLEEVMMFFFFFF000000LXXX',
  // 'LSLEEVMMFFFFFF000000MXXX',
  // 'LSLEEVMMFFFFFF000000SXXX',
  // 'LSLEEVMMFFFFFF000000XLXX',
  // 'LSLEEVMMFFFFFFE63E74',
  // 'LSLEEVMMFFFFFFE63E742XLX',
  // 'LSLEEVMMFFFFFFE63E74LXXX',
  // 'LSLEEVMMFFFFFFE63E74MXXX',
  // 'LSLEEVMMFFFFFFE63E74SXXX',
  // 'LSLEEVMMFFFFFFE63E74XLXX',
  // 'MUGXXXAUFFFFFF000000',
  // 'MUGXXXAUFFFFFF00000011OZ',
  // 'PILLOWAU000000FFFFFF',
  // 'PILLOWAU000000FFFFFF1818',
  // 'PILLOWAUE63E74FFFFFF',
  // 'PILLOWAUE63E74FFFFFF1818',
  // 'PSTBIGAU000000FFFFFF',
  // 'PSTBIGAU000000FFFFFF1824',
  // 'PSTBIGAUE63E74FFFFFF',
  // 'PSTBIGAUE63E74FFFFFF1824',
  // 'SOCKXXMUE63E74FFFFFF',
  // 'SOCKXXMUE63E74FFFFFFLXXX',
  // 'SOCKXXMUE63E74FFFFFFMXXX',
  // 'SOCKXXMUE63E74FFFFFFXLXX',
  // 'SOCKXXMUFFFFFF000000',
  // 'SOCKXXMUFFFFFF000000LXXX',
  // 'SOCKXXMUFFFFFF000000MXXX',
  // 'SOCKXXMUFFFFFF000000XLXX',
  // 'SWEETHMM000000E63E74',
  // 'SWEETHMU000000E63E74',
  // 'SWEETHMU000000E63E742XLX',
  // 'SWEETHMU000000E63E743XLX',
  // 'SWEETHMU000000E63E74LXXX',
  // 'SWEETHMU000000E63E74MXXX',
  // 'SWEETHMU000000E63E74SXXX',
  // 'SWEETHMU000000E63E74XLXX',
  // 'SWEETHMU000000FFFFFF',
  // 'SWEETHMU000000FFFFFF2XLX',
  // 'SWEETHMU000000FFFFFF3XLX',
  // 'SWEETHMU000000FFFFFFLXXX',
  // 'SWEETHMU000000FFFFFFMXXX',
  // 'SWEETHMU000000FFFFFFSXXX',
  // 'SWEETHMU000000FFFFFFXLXXX',
  // 'SWEETHMUB7B7B7000000',
  // 'SWEETHMUB7B7B70000002XLX',
  // 'SWEETHMUB7B7B70000003XLX',
  // 'SWEETHMUB7B7B7000000LXXX',
  // 'SWEETHMUB7B7B7000000MXXX',
  // 'SWEETHMUB7B7B7000000SXXX',
  // 'SWEETHMUB7B7B7000000XLXX',
  // 'SWEETHMUB7B7B7E63E74',
  // 'SWEETHMUB7B7B7E63E742XLX',
  // 'SWEETHMUB7B7B7E63E743XLX',
  // 'SWEETHMUB7B7B7E63E74LXXX',
  // 'SWEETHMUB7B7B7E63E74MXXX',
  // 'SWEETHMUB7B7B7E63E74SXXX',
  // 'SWEETHMUB7B7B7E63E74XLXX',
  // 'SWEETSMU000000E63E74',
  // 'SWEETSMU000000E63E742XLX',
  // 'SWEETSMU000000E63E743XLX',
  // 'SWEETSMU000000E63E74LXXX',
  // 'SWEETSMU000000E63E74MXXX',
  // 'SWEETSMU000000E63E74SXXX',
  // 'SWEETSMU000000E63E74XLXX',
  // 'SWEETSMU000000FFFFFF',
  // 'SWEETSMU000000FFFFFF2XLX',
  // 'SWEETSMU000000FFFFFF3XLX',
  // 'SWEETSMU000000FFFFFFLXXX',
  // 'SWEETSMU000000FFFFFFMXXX',
  // 'SWEETSMU000000FFFFFFSXXX',
  // 'SWEETSMU000000FFFFFFXLXX',
  // 'SWEETSMUB7B7B7000000',
  // 'SWEETSMUB7B7B70000002XLX',
  // 'SWEETSMUB7B7B70000003XLX',
  // 'SWEETSMUB7B7B7000000LXXX',
  // 'SWEETSMUB7B7B7000000MXXX',
  // 'SWEETSMUB7B7B7000000SXXX',
  // 'SWEETSMUB7B7B7000000XLXX',
  // 'SWEETSMUB7B7B7E63E74',
  // 'SWEETSMUB7B7B7E63E742XLX',
  // 'SWEETSMUB7B7B7E63E743XL',
  // 'SWEETSMUB7B7B7E63E74LXXX',
  // 'SWEETSMUB7B7B7E63E74MXXX',
  // 'SWEETSMUB7B7B7E63E74SXXX',
  // 'SWEETSMUB7B7B7E63E74XLXX',
  // 'THANKTMM000000E63E74',
  // 'THANKTMM000000E63E742XLX',
  // 'THANKTMM000000E63E74LXXX',
  // 'THANKTMM000000E63E74MXXX',
  // 'THANKTMM000000E63E74SXXX',
  // 'THANKTMM000000E63E74XLXX',
  // 'THANKTMM000000FFFFFF',
  // 'THANKTMM000000FFFFFF2XLX',
  // 'THANKTMM000000FFFFFFLXXX',
  // 'THANKTMM000000FFFFFFMXXX',
  // 'THANKTMM000000FFFFFFSXXX',
  // 'THANKTMM000000FFFFFFXLXX',
  // 'THANKTMMFFFFFF000000',
  // 'THANKTMMFFFFFF0000002XLX',
  // 'THANKTMMFFFFFF000000LXXX',
  // 'THANKTMMFFFFFF000000MXXX',
  // 'THANKTMMFFFFFF000000SXXX',
  // 'THANKTMMFFFFFF000000XLXX',
  // 'THANKTMMFFFFFFE63E74',
  // 'THANKTMMFFFFFFE63E742XLX',
  // 'THANKTMMFFFFFFE63E74LXXX',
  // 'THANKTMMFFFFFFE63E74MXXX',
  // 'THANKTMMFFFFFFE63E74SXXX',
  // 'THANKTMMFFFFFFE63E74XLXXX',
  // 'TOTEXXAUFFFFFF000000',
  // 'TOTEXXAUFFFFFF000000XXXX',
  // 'TOTEXXAUFFFFFFE63E74',
  // 'TOTEXXAUFFFFFFE63E74XXXX',
  // 'TSHIRTKF000000E63E74',
  // 'TSHIRTKF000000E63E74LXXX',
  // 'TSHIRTKF000000E63E74MXXX',
  // 'TSHIRTKF000000E63E74SXXX',
  // 'TSHIRTKF000000E63E74XLXX',
  // 'TSHIRTKF000000E63E74XSXX',
  // 'TSHIRTKF000000FFFFFF',
  // 'TSHIRTKF000000FFFFFFLXXX',
  // 'TSHIRTKF000000FFFFFFMXXX',
  // 'TSHIRTKF000000FFFFFFSXXX',
  // 'TSHIRTKF000000FFFFFFXLXX',
  // 'TSHIRTKF000000FFFFFFXSXX',
  // 'TSHIRTKFFFFFFF000000',
  // 'TSHIRTKFFFFFFF000000LXXX',
  // 'TSHIRTKFFFFFFF000000MXXX',
  // 'TSHIRTKFFFFFFF000000SXXX',
  // 'TSHIRTKFFFFFFF000000XLXX',
  // 'TSHIRTKFFFFFFF000000XSXX',
  // 'TSHIRTKFFFFFFFE63E74',
  // 'TSHIRTKFFFFFFFE63E74LXXX',
  // 'TSHIRTKFFFFFFFE63E74MXXX',
  // 'TSHIRTKFFFFFFFE63E74SXXX',
  // 'TSHIRTKFFFFFFFE63E74XLXX',
  // 'TSHIRTKFFFFFFFE63E74XSXX',
  // 'TSHIRTKM000000E63E74',
  // 'TSHIRTKM000000E63E74LXXX',
  // 'TSHIRTKM000000E63E74MXXX',
  // 'TSHIRTKM000000E63E74SXXX',
  // 'TSHIRTKM000000E63E74XLXX',
  // 'TSHIRTKM000000E63E74XSXX',
  // 'TSHIRTKM000000FFFFFF',
  // 'TSHIRTKM000000FFFFFFLXXX',
  // 'TSHIRTKM000000FFFFFFMXXX',
  // 'TSHIRTKM000000FFFFFFSXXX',
  // 'TSHIRTKM000000FFFFFFXLXX',
  // 'TSHIRTKM000000FFFFFFXSXX',
  // 'TSHIRTKMFFFFFF000000',
  // 'TSHIRTKMFFFFFF000000LXXX',
  // 'TSHIRTKMFFFFFF000000MXXX',
  // 'TSHIRTKMFFFFFF000000SXXX',
  // 'TSHIRTKMFFFFFF000000XLXX',
  // 'TSHIRTKMFFFFFF000000XSXX',
  // 'TSHIRTKMFFFFFFE63E74',
  // 'TSHIRTKMFFFFFFE63E74LXXX',
  // 'TSHIRTKMFFFFFFE63E74MXXX',
  // 'TSHIRTKMFFFFFFE63E74SXXX',
  // 'TSHIRTKMFFFFFFE63E74XLXX',
  // 'TSHIRTKMFFFFFFE63E74XSXX',
  // 'TSHIRTMM000000E63E74',
  // 'TSHIRTMM000000E63E742XLX',
  // 'TSHIRTMM000000E63E74LXXX',
  // 'TSHIRTMM000000E63E74MXXX',
  // 'TSHIRTMM000000E63E74SXXX',
  // 'TSHIRTMM000000E63E74XLXX',
  // 'TSHIRTMM000000FFFFFF',
  // 'TSHIRTMM000000FFFFFF2XLX',
  // 'TSHIRTMM000000FFFFFFLXXX',
  // 'TSHIRTMM000000FFFFFFMXXX',
  // 'TSHIRTMM000000FFFFFFSXXX',
  // 'TSHIRTMM000000FFFFFFXLXX',
  // 'TSHIRTMMFFFFFF000000',
  // 'TSHIRTMMFFFFFF0000002XL',
  // 'TSHIRTMMFFFFFF000000LXXX',
  // 'TSHIRTMMFFFFFF000000MXXX',
  // 'TSHIRTMMFFFFFF000000SXXX',
  // 'TSHIRTMMFFFFFF000000XLXX',
  // 'TSHIRTMMFFFFFFE63E74',
  // 'TSHIRTMMFFFFFFE63E742XLX',
  // 'TSHIRTMMFFFFFFE63E74LXXX',
  // 'TSHIRTMMFFFFFFE63E74MXXX',
  // 'TSHIRTMMFFFFFFE63E74SXXX',
  // 'TSHIRTMMFFFFFFE63E74XLXX',
  // 'TSHIRTWF000000E63E74',
  // 'TSHIRTWF000000E63E742XLX',
  // 'TSHIRTWF000000E63E74LXXX',
  // 'TSHIRTWF000000E63E74MXXX',
  // 'TSHIRTWF000000E63E74SXXX',
  // 'TSHIRTWF000000E63E74XLXX',
  // 'TSHIRTWF000000FFFFFF',
  // 'TSHIRTWF000000FFFFFF2XLX',
  // 'TSHIRTWF000000FFFFFFLXXX',
  // 'TSHIRTWF000000FFFFFFMXXX',
  // 'TSHIRTWF000000FFFFFFSXXX',
  // 'TSHIRTWF000000FFFFFFXLXX',
  // 'TSHIRTWFFFFFFF000000',
  // 'TSHIRTWFFFFFFF0000002XLX',
  // 'TSHIRTWFFFFFFF000000LXXX',
  // 'TSHIRTWFFFFFFF000000MXXX',
  // 'TSHIRTWFFFFFFF000000SXXX',
  // 'TSHIRTWFFFFFFF000000XLXX',
  // 'TSHIRTWFFFFFFFE63E74',
  // 'TSHIRTWFFFFFFFE63E742XLX',
  // 'TSHIRTWFFFFFFFE63E74LXXX',
  // 'TSHIRTWFFFFFFFE63E74MXXX',
  // 'TSHIRTWFFFFFFFE63E74SXXX',
  // 'TSHIRTWFFFFFFFE63E74XLXX'
]

const Home = () => {
  const [token, setToken] = useState('')
  useEffect(() => {
    const getToken = async () => {
      // const { accessToken } = await getSalesChannelToken({
      //   clientId:
      //     '4769bcf1998d700d5e159a89b24233a1ecec7e1524505fb8b7652c3e10139d78',
      //   endpoint,
      //   scope: 'market:48'
      // })
      // @ts-ignore
      const { accessToken } = await getIntegrationToken({
        clientId:
          'b1aa32826ce12ba2f74c59a555e3ed98a7db4ec710b14575b7e97f0a49fb9a4d',
        clientSecret:
          '8fed019759490ba13c482cc2541ef77c6b8d0b3df04db80807110784fbfec021',
        endpoint,
        scope: 'market:48',
      })
      setToken(accessToken)
    }
    getToken()
  }, [])
  const Loading = () => <div>Caricamento...</div>
  return (
    <section className="bg-gray-100">
      <Nav links={['/order', '/multiOrder', '/multiApp', '/giftCard']} />
      <div className="container mx-auto">
        <CommerceLayer accessToken={token} endpoint={endpoint}>
          <div className="flex flex-row flex-wrap justify-around">
            <PricesContainer perPage={20} loader={<Loading />}>
              {skus.map((s, k) => {
                const lImg = s.substring(0, s.length - 4)
                return (
                  <div key={k} className="text-center p-3">
                    <img
                      src={`https://img.commercelayer.io/skus/${lImg}.png?fm=png&q=70`}
                      className="rounded-lg md:w-56 m-auto"
                    />
                    <div className="flex flex-row flex-wrap justify-center">
                      <Price
                        skuCode={s}
                        className="text-green-600 text-2xl m-1"
                        compareClassName="text-gray-500 text-2xl m-1 line-through"
                      />
                    </div>
                    <div className="p-3">
                      <a
                        className="mt-2 primary font-bold py-2 px-4 rounded"
                        href="/order"
                      >
                        Order
                      </a>
                    </div>
                  </div>
                )
              })}
            </PricesContainer>
          </div>
          {/* <br />
        <br />
        <Title title="Preselect Prices by skuCode" />
        <PricesContainer>
          <Price
            skuCode="BABYONBU000000E63E746MXX"
            amountClassName="font-bold"
            compareClassName="line-through"
          />
        </PricesContainer>
        <br />
        <br />
        <Title title="Variant" />
        <VariantContainer>
          <Type text="select type" />
          <VariantSelector
            name="variant1"
            skuCodes={[
              { label: '6 months', code: 'BABYONBU000000E63E746MXX' },
              {
                label: '12 months',
                code: 'BABYONBU000000E63E7412MX'
              },
              {
                label: '24 months',
                code: 'BABYONBU000000E63E746MXXFAKE'
              }
            ]}
          />
          <br />
          <br />
          <Type text="radio type" />
          <VariantSelector
            name="variant"
            type="radio"
            skuCodes={[
              { label: '6 months', code: 'BABYONBU000000E63E746MXX' },
              {
                label: '12 months',
                code: 'BABYONBU000000E63E7412MX'
              },
              {
                label: '24 months',
                code: 'BABYONBU000000E63E746MXXFAKE'
              }
            ]}
          />
        </VariantContainer>
        <br />
        <br />
        <Title title="Preselect Variant by skuCode" />
        <VariantContainer skuCode="BABYONBU000000E63E746MXX">
          <Type text="select type" />
          <VariantSelector
            name="variant1"
            skuCodes={[
              { label: '6 months', code: 'BABYONBU000000E63E746MXX' },
              {
                label: '12 months',
                code: 'BABYONBU000000E63E7412MX'
              },
              {
                label: '24 months',
                code: 'BABYONBU000000E63E746MXXFAKE'
              }
            ]}
          />
          <br />
          <br />
          <Type text="radio type" />
          <VariantSelector
            name="variant1"
            type="radio"
            skuCodes={[
              { label: '6 months', code: 'BABYONBU000000E63E746MXX' },
              {
                label: '12 months',
                code: 'BABYONBU000000E63E7412MX'
              },
              {
                label: '24 months',
                code: 'BABYONBU000000E63E746MXXFAKE'
              }
            ]}
          />
        </VariantContainer> */}
        </CommerceLayer>
      </div>
    </section>
  )
}
export default Home
