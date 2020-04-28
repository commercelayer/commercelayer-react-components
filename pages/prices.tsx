import {
	// getSalesChannelToken,
	getIntegrationToken,
} from '@commercelayer/js-auth'
import React, { useEffect, useState } from 'react'
import Price from '../src/components/Price'
import PriceContainer from '../src/components/PriceContainer'
import CommerceLayer from '../src/components/CommerceLayer'

const endpoint = 'https://the-blue-brand-2.commercelayer.co'

export const Nav = ({ links }) => (
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
									href={l}>
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
	<div className='font-bold text-2xl mb-2 bg-green-300'>{title}</div>
)

export const Type = ({ text }) => (
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
]

const Home = () => {
	const [token, setToken] = useState('')
	useEffect(() => {
		const getToken = async () => {
			const auth = await getIntegrationToken({
				clientId:
					'b1aa32826ce12ba2f74c59a555e3ed98a7db4ec710b14575b7e97f0a49fb9a4d',
				clientSecret:
					'8fed019759490ba13c482cc2541ef77c6b8d0b3df04db80807110784fbfec021',
				endpoint,
				scope: 'market:48',
			})
			setToken(auth?.accessToken as string)
		}
		getToken()
	}, [])
	const Loading = () => <div>Caricamento...</div>
	return (
		<section className='bg-gray-100'>
			<Nav links={['/order', '/multiOrder', '/multiApp', '/giftCard']} />
			<div className='container mx-auto'>
				<CommerceLayer accessToken={token} endpoint={endpoint}>
					{/* ... children components */}
				</CommerceLayer>
			</div>
		</section>
	)
}
export default Home
