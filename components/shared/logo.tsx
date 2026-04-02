import Image from 'next/image'


const Logo = () => {
  return (
     <div className="flex">
           <Image src="/logo.png" className="shrink-0 object-contain" width={32} height={32} alt="logo"/>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-[#1e3a2b] select-none">Short <span className="font-normal">Purify</span></h1>
            <p className="text-[10px] font-medium -mt-1 text-[#1e3a2b] select-none">Automate. Clip. Go Viral</p>
          </div>
         </div>
  )
}

export default Logo