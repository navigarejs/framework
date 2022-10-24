import { RawRoute, route } from '@navigare/core'
import React from 'react'

const Component: React.FunctionComponent<{
  rawRoute: RawRoute
}> = (props) => {
  return (
    <>
      <div>Hello World</div>
      <div>{JSON.stringify(props.rawRoute)}</div>
      <div>{JSON.stringify(route('welcome' as never))}</div>
    </>
  )
}

export default Component
