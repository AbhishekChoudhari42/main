"use client"
import Canvas from '@/components/Canvas'
import ToolBox from '@/components/ToolBox'
import { Provider } from 'react-redux'
import { store } from '@/store/store'


export default function Home() {
  return (


    <Provider store={store}>
      <div className='relative'>
        <Canvas/>
        <ToolBox />
      </div>
    </Provider>


  )
}
