import House from '../assets/HomePage.png'

export default function Home(params) {
  return <div className='h-full pt-16'> <div className='relative bottom-[-80px] ml-[15%] text-4xl font-semibold'><span >Create a Non-Fungible <br></br> Record of Your Home's <br></br></span><span className='text-red-400'>Journey</span></div> <img className='m-auto' width='70%' src={House} alt="house" /></div>;
}
